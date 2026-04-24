import { Prisma, RunStatus, StepRunStatus, StepType, TriggerType, WorkflowStatus } from "@prisma/client";

import { prisma } from "@/lib/db/prisma";

export async function getWorkflowCatalogByWorkspaceId(workspaceId: string) {
  return prisma.workflow.findMany({
    where: {
      workspaceId
    },
    orderBy: {
      updatedAt: "desc"
    },
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
    }
  });
}

export async function createWorkflowDefinition(input: {
  workspaceId: string;
  name: string;
  description?: string;
  triggerType: TriggerType;
  steps: Array<{
    key: string;
    name: string;
    type: StepType;
    description?: string;
  }>;
}) {
  return prisma.$transaction(async (tx) => {
    const existingCount = await tx.workflow.count({
      where: {
        workspaceId: input.workspaceId
      }
    });

    const slug = slugify(input.name);
    const workflow = await tx.workflow.create({
      data: {
        workspaceId: input.workspaceId,
        name: input.name,
        slug: await ensureUniqueWorkflowSlug(tx, input.workspaceId, slug),
        description: input.description,
        status: "DRAFT"
      }
    });

    const version = await tx.workflowVersion.create({
      data: {
        workflowId: workflow.id,
        versionNumber: 1,
        changelog: "Initial version created from FlowPilot MVP UI",
        triggerType: input.triggerType,
        triggerConfig: {
          mode: input.triggerType
        },
        inputSchema: {
          type: "object",
          additionalProperties: true
        },
        outputSchema: {
          type: "object",
          additionalProperties: true
        },
        steps: {
          create: input.steps.map((step, index) => ({
            key: step.key,
            name: step.name,
            description: step.description,
            type: step.type,
            sequence: index + 1,
            config: {},
            retryPolicy: {
              maxRetries: 2,
              strategy: "exponential-backoff"
            }
          }))
        }
      },
      include: {
        steps: {
          orderBy: {
            sequence: "asc"
          }
        }
      }
    });

    const updatedWorkflow = await tx.workflow.update({
      where: {
        id: workflow.id
      },
      data: {
        activeVersionId: version.id,
        status: existingCount === 0 ? "ACTIVE" : "DRAFT"
      },
      include: {
        activeVersion: {
          include: {
            steps: {
              orderBy: {
                sequence: "asc"
              }
            }
          }
        }
      }
    });

    return updatedWorkflow;
  });
}

export async function getWorkflowBySlug(workspaceId: string, workflowSlug: string) {
  return prisma.workflow.findFirst({
    where: {
      workspaceId,
      slug: workflowSlug
    },
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
        take: 10,
        include: {
          initiatedBy: true
        }
      }
    }
  });
}

export async function updateWorkflowDefinition(input: {
  workflowId: string;
  name: string;
  description?: string;
  status: WorkflowStatus;
  triggerType: TriggerType;
}) {
  return prisma.$transaction(async (tx) => {
    const workflow = await tx.workflow.update({
      where: {
        id: input.workflowId
      },
      data: {
        name: input.name,
        description: input.description,
        status: input.status
      },
      include: {
        activeVersion: true
      }
    });

    if (workflow.activeVersion) {
      await tx.workflowVersion.update({
        where: {
          id: workflow.activeVersion.id
        },
        data: {
          triggerType: input.triggerType,
          triggerConfig: {
            mode: input.triggerType
          }
        }
      });
    }

    return workflow;
  });
}

export async function createWorkflowRun(input: {
  workspaceId: string;
  workflowId: string;
  initiatedByUserId?: string;
}) {
  return prisma.$transaction(async (tx) => {
    const workflow = await tx.workflow.findUnique({
      where: {
        id: input.workflowId
      },
      include: {
        activeVersion: {
          include: {
            steps: {
              orderBy: {
                sequence: "asc"
              }
            }
          }
        }
      }
    });

    if (!workflow?.activeVersion) {
      throw new Error("Workflow does not have an active version.");
    }

    const startedAt = new Date();
    const approvalStepIndex = workflow.activeVersion.steps.findIndex((step) => step.type === StepType.APPROVAL);
    const finalStatus = approvalStepIndex >= 0 ? RunStatus.WAITING_APPROVAL : RunStatus.COMPLETED;
    const completedAt = finalStatus === RunStatus.COMPLETED ? new Date(startedAt.getTime() + 45_000) : null;

    const run = await tx.workflowRun.create({
      data: {
        workspaceId: input.workspaceId,
        workflowId: workflow.id,
        workflowVersionId: workflow.activeVersion.id,
        initiatedByUserId: input.initiatedByUserId,
        status: finalStatus,
        startedAt,
        completedAt,
        inputPayload: {
          source: "manual-trigger"
        },
        ...(finalStatus === RunStatus.COMPLETED
          ? {
              outputPayload: { state: "completed" }
            }
          : {})
      }
    });

    for (const [index, step] of workflow.activeVersion.steps.entries()) {
      const stepStartedAt = new Date(startedAt.getTime() + index * 12_000);
      const beforeApproval = approvalStepIndex === -1 || index < approvalStepIndex;
      const isApproval = index === approvalStepIndex;
      const stepStatus = beforeApproval
        ? StepRunStatus.COMPLETED
        : isApproval
          ? StepRunStatus.WAITING_INPUT
          : finalStatus === RunStatus.COMPLETED
            ? StepRunStatus.COMPLETED
            : StepRunStatus.PENDING;

      await tx.stepRun.create({
        data: {
          workflowRunId: run.id,
          workflowStepId: step.id,
          status: stepStatus,
          startedAt: stepStatus === StepRunStatus.PENDING ? null : stepStartedAt,
          completedAt:
            stepStatus === StepRunStatus.COMPLETED
              ? new Date(stepStartedAt.getTime() + 10_000)
              : null,
          outputPayload:
            stepStatus === StepRunStatus.COMPLETED
              ? { state: "completed", stepKey: step.key }
              : undefined
        }
      });
    }

    if (finalStatus === RunStatus.WAITING_APPROVAL) {
      const approvalStep = workflow.activeVersion.steps[approvalStepIndex];

      await tx.approvalRequest.create({
        data: {
          workspaceId: input.workspaceId,
          workflowRunId: run.id,
          requestedByUserId: input.initiatedByUserId,
          stepKey: approvalStep.key,
          title: `${workflow.name} approval required`,
          description: "Manual trigger reached an approval gate and is waiting for a decision.",
          status: "PENDING",
          dueAt: new Date(startedAt.getTime() + 30 * 60_000),
          metadata: {
            source: "manual-trigger"
          }
        }
      });
    }

    return run;
  });
}

async function ensureUniqueWorkflowSlug(
  tx: Prisma.TransactionClient,
  workspaceId: string,
  baseSlug: string
) {
  let candidate = baseSlug;
  let suffix = 1;

  while (
    await tx.workflow.findFirst({
      where: {
        workspaceId,
        slug: candidate
      },
      select: {
        id: true
      }
    })
  ) {
    suffix += 1;
    candidate = `${baseSlug}-${suffix}`;
  }

  return candidate;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50);
}
