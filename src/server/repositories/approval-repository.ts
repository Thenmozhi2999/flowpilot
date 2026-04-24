import { ApprovalStatus, AuditActorType, RunStatus, StepRunStatus } from "@prisma/client";

import { prisma } from "@/lib/db/prisma";

export async function decideApprovalRequest(input: {
  approvalRequestId: string;
  decision: "APPROVED" | "REJECTED";
  decidedByUserId: string;
  comment?: string;
}) {
  return prisma.$transaction(async (tx) => {
    const request = await tx.approvalRequest.findUnique({
      where: {
        id: input.approvalRequestId
      },
      include: {
        workflowRun: {
          include: {
            workflow: true
          }
        },
        workspace: true
      }
    });

    if (!request) {
      throw new Error("Approval request not found.");
    }

    if (request.status !== ApprovalStatus.PENDING) {
      throw new Error("Approval request is no longer pending.");
    }

    await tx.approvalDecision.create({
      data: {
        approvalRequestId: request.id,
        decidedByUserId: input.decidedByUserId,
        decision: input.decision,
        comment: input.comment
      }
    });

    await tx.approvalRequest.update({
      where: {
        id: request.id
      },
      data: {
        status: input.decision
      }
    });

    const waitingStepRun = await tx.stepRun.findFirst({
      where: {
        workflowRunId: request.workflowRunId,
        status: StepRunStatus.WAITING_INPUT
      },
      orderBy: {
        createdAt: "asc"
      }
    });

    if (waitingStepRun) {
      await tx.stepRun.update({
        where: {
          id: waitingStepRun.id
        },
        data: {
          status: input.decision === "APPROVED" ? StepRunStatus.COMPLETED : StepRunStatus.CANCELED,
          completedAt: new Date(),
          ...(input.decision === "APPROVED"
            ? {
                outputPayload: { approval: "approved" }
              }
            : {
                errorSummary: "Approval request was rejected."
              })
        }
      });
    }

    const pendingStepRuns = await tx.stepRun.findMany({
      where: {
        workflowRunId: request.workflowRunId,
        status: StepRunStatus.PENDING
      }
    });

    for (const stepRun of pendingStepRuns) {
      await tx.stepRun.update({
        where: {
          id: stepRun.id
        },
        data: {
          status: input.decision === "APPROVED" ? StepRunStatus.COMPLETED : StepRunStatus.CANCELED,
          startedAt: input.decision === "APPROVED" ? new Date() : null,
          completedAt: input.decision === "APPROVED" ? new Date() : null,
          ...(input.decision === "APPROVED"
            ? {
                outputPayload: { state: "auto-completed-after-approval" }
              }
            : {
                errorSummary: "Canceled after approval rejection."
              })
        }
      });
    }

    await tx.workflowRun.update({
      where: {
        id: request.workflowRunId
      },
      data: {
        status: input.decision === "APPROVED" ? RunStatus.COMPLETED : RunStatus.CANCELED,
        completedAt: new Date(),
        ...(input.decision === "REJECTED"
          ? {
              errorSummary: "Run canceled because the approval request was rejected."
            }
          : {
              outputPayload: { approval: "approved" }
            })
      }
    });

    await tx.auditEvent.create({
      data: {
        workspaceId: request.workspaceId,
        workflowRunId: request.workflowRunId,
        actorUserId: input.decidedByUserId,
        actorType: AuditActorType.USER,
        action: input.decision === "APPROVED" ? "Approval granted" : "Approval rejected",
        resourceType: "ApprovalRequest",
        resourceId: request.id,
        metadata: {
          workflow: request.workflowRun.workflow.name,
          comment: input.comment ?? null
        }
      }
    });

    return request;
  });
}
