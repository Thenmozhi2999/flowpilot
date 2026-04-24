import { RunStatus, StepRunStatus, WorkflowStatus } from "@prisma/client";

import { defaultWorkspaceContext } from "@/lib/config/app";
import { prisma } from "@/lib/db/prisma";
import { formatDuration, formatRelativeTime, formatTimestamp, toTitleCase } from "@/lib/utils/format";
import { mapRunState, mapWorkflowStatus } from "@/server/services/workflow-mappers";
import type { WorkspaceSnapshot } from "@/types/platform";

const emptySnapshot: WorkspaceSnapshot = {
  databaseReady: false,
  dashboardMetrics: [],
  workflowSummaries: [],
  recentRuns: [],
  workflowCatalog: [],
  workflowBuilderSteps: [],
  executionTimeline: [],
  approvalQueue: [],
  agentRegistry: [],
  governanceHighlights: [],
  auditFeed: []
};

export async function getWorkspaceSnapshot(): Promise<WorkspaceSnapshot> {
  try {
    const workspace = await prisma.workspace.findFirst({
      where: {
        slug: defaultWorkspaceContext.workspaceSlug,
        organization: {
          slug: defaultWorkspaceContext.organizationSlug
        }
      },
      include: {
        workflows: {
          include: {
            activeVersion: {
              include: {
                steps: {
                  orderBy: {
                    sequence: "asc"
                  }
                }
              }
            },
            runs: {
              orderBy: {
                createdAt: "desc"
              },
              take: 1
            }
          },
          orderBy: {
            updatedAt: "desc"
          }
        },
        workflowRuns: {
          include: {
            workflow: true,
            approvalRequests: true
          },
          orderBy: {
            createdAt: "desc"
          },
          take: 6
        },
        approvalRequests: {
          where: {
            status: "PENDING"
          },
          include: {
            workflowRun: {
              include: {
                workflow: true
              }
            }
          },
          orderBy: {
            createdAt: "asc"
          },
          take: 6
        },
        auditEvents: {
          orderBy: {
            createdAt: "desc"
          },
          include: {
            actorUser: true
          },
          take: 6
        },
        organization: {
          include: {
            agents: {
              include: {
                owner: true
              },
              orderBy: {
                updatedAt: "desc"
              }
            }
          }
        }
      }
    });

    if (!workspace) {
      return emptySnapshot;
    }

    const totalRuns = workspace.workflowRuns.length;
    const completedRuns = workspace.workflowRuns.filter((run) => run.status === RunStatus.COMPLETED).length;
    const activeWorkflows = workspace.workflows.filter((workflow) => workflow.status === WorkflowStatus.ACTIVE).length;
    const pendingApprovals = workspace.approvalRequests.length;
    const medianRunTime = getMedianDuration(workspace.workflowRuns);
    const draftCount = workspace.workflows.filter((workflow) => workflow.status === WorkflowStatus.DRAFT).length;
    const failedRuns = workspace.workflowRuns.filter((run) => run.status === RunStatus.FAILED).length;

    return {
      databaseReady: true,
      dashboardMetrics: [
        {
          label: "Active workflows",
          value: String(activeWorkflows),
          delta: `${draftCount} drafts`,
          trend: activeWorkflows > 0 ? "up" : "neutral"
        },
        {
          label: "Runs tracked",
          value: String(totalRuns),
          delta: completedRuns > 0 ? `${completedRuns} completed` : "No completions yet",
          trend: completedRuns > 0 ? "up" : "neutral"
        },
        {
          label: "Approval backlog",
          value: String(pendingApprovals),
          delta: pendingApprovals > 0 ? "Needs review" : "Clear",
          trend: pendingApprovals > 0 ? "down" : "neutral"
        },
        {
          label: "Median run time",
          value: medianRunTime,
          delta: failedRuns > 0 ? `${failedRuns} failed` : "Stable",
          trend: failedRuns > 0 ? "down" : "neutral"
        }
      ],
      workflowSummaries: workspace.workflows.slice(0, 5).map((workflow) => {
        const lastRun = workflow.runs[0];
        const completed = workspace.workflowRuns.filter(
          (run) => run.workflowId === workflow.id && run.status === RunStatus.COMPLETED
        ).length;
        const workflowTotal = workspace.workflowRuns.filter((run) => run.workflowId === workflow.id).length;
        const successRate = workflowTotal > 0 ? `${Math.round((completed / workflowTotal) * 100)}%` : "N/A";

        return {
          id: workflow.id,
          name: workflow.name,
          owner: workspace.name,
          status: mapWorkflowStatus(workflow.status),
          lastRun: lastRun?.createdAt ? formatRelativeTime(lastRun.createdAt) : "Not run yet",
          successRate
        };
      }),
      recentRuns: workspace.workflowRuns.slice(0, 4).map((run) => ({
        id: run.id,
        workflow: run.workflow.name,
        state: mapRunState(run.status),
        startedAt: run.startedAt ? `Started ${formatRelativeTime(run.startedAt)}` : "Queued",
        duration: formatDuration(run.startedAt, run.completedAt)
      })),
      workflowCatalog: workspace.workflows.map((workflow) => ({
        id: workflow.id,
        slug: workflow.slug,
        name: workflow.name,
        trigger: workflow.activeVersion ? toTitleCase(workflow.activeVersion.triggerType) : "Manual",
        version: workflow.activeVersion ? `v${workflow.activeVersion.versionNumber}` : "v0",
        owner: workspace.name,
        status: mapWorkflowStatus(workflow.status),
        steps: workflow.activeVersion?.steps.length ?? 0,
        sla: getWorkflowSla(workflow.status),
        lastRun: workflow.runs[0]?.createdAt ? formatRelativeTime(workflow.runs[0].createdAt) : "Not run yet"
      })),
      workflowBuilderSteps:
        workspace.workflows[0]?.activeVersion?.steps.map((step) => ({
          key: step.key,
          name: step.name,
          type: step.type,
          description: step.description ?? "No step description yet."
        })) ?? [],
      executionTimeline:
        workspace.workflowRuns[0]
          ? await getExecutionTimeline(workspace.workflowRuns[0].id)
          : [],
      approvalQueue: workspace.approvalRequests.map((request) => ({
        id: request.id,
        title: request.title,
        workflow: request.workflowRun.workflow.name,
        age: formatRelativeTime(request.createdAt),
        owner: workspace.name,
        priority: request.dueAt && request.dueAt.getTime() < Date.now() ? "High" : "Medium"
      })),
      agentRegistry: workspace.organization.agents.map((agent) => ({
        name: agent.name,
        provider: agent.provider,
        model: agent.model,
        owner: agent.owner ? `${agent.owner.firstName} ${agent.owner.lastName}` : "Platform team",
        usage: `${workspace.workflows.filter((workflow) => workflow.description?.includes(agent.name)).length} workflows`
      })),
      governanceHighlights: [
        {
          label: "Pending approvals",
          value: String(pendingApprovals),
          note: pendingApprovals > 0 ? "Approvals are blocking downstream automation." : "No approvals are waiting."
        },
        {
          label: "Policy exceptions",
          value: String(failedRuns),
          note: failedRuns > 0 ? "Investigate failed executions and exception handling." : "No failed runs in the sample workspace."
        },
        {
          label: "Audit coverage",
          value: workspace.auditEvents.length > 0 ? "100%" : "0%",
          note: workspace.auditEvents.length > 0 ? "Recent actions are being captured in the audit feed." : "Seed the workspace to generate audit records."
        }
      ],
      auditFeed: workspace.auditEvents.map((event) => ({
        action: event.action,
        actor: event.actorUser ? `${event.actorUser.firstName} ${event.actorUser.lastName}` : event.actorType,
        target: `${event.resourceType} / ${event.resourceId}`,
        timestamp: formatTimestamp(event.createdAt)
      }))
    };
  } catch {
    return emptySnapshot;
  }
}

async function getExecutionTimeline(workflowRunId: string) {
  const stepRuns = await prisma.stepRun.findMany({
    where: {
      workflowRunId
    },
    include: {
      workflowStep: true
    },
    orderBy: {
      createdAt: "asc"
    }
  });

  return stepRuns.map((stepRun) => ({
    step: stepRun.workflowStep.name,
    state: mapStepRunState(stepRun.status),
    duration: formatDuration(stepRun.startedAt, stepRun.completedAt),
    details: stepRun.errorSummary ?? stepRun.workflowStep.description ?? "Execution details pending."
  }));
}

function getMedianDuration(
  runs: Array<{ startedAt: Date | null; completedAt: Date | null }>
) {
  const durations = runs
    .filter((run) => run.startedAt && run.completedAt)
    .map((run) => run.completedAt!.getTime() - run.startedAt!.getTime())
    .sort((a, b) => a - b);

  if (durations.length === 0) {
    return "N/A";
  }

  const median = durations[Math.floor(durations.length / 2)];
  const totalSeconds = Math.floor(median / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${String(minutes).padStart(2, "0")}m ${String(seconds).padStart(2, "0")}s`;
}

function mapStepRunState(status: StepRunStatus) {
  if (status === StepRunStatus.COMPLETED) {
    return "Completed" as const;
  }

  if (status === StepRunStatus.WAITING_INPUT) {
    return "Waiting Approval" as const;
  }

  return "Pending" as const;
}

function getWorkflowSla(status: WorkflowStatus) {
  if (status === WorkflowStatus.ACTIVE) {
    return "4m target";
  }

  if (status === WorkflowStatus.ARCHIVED) {
    return "Paused";
  }

  return "Builder review";
}
