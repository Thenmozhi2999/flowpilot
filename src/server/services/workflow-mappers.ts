import { RunStatus, WorkflowStatus } from "@prisma/client";

import { formatDuration, formatRelativeTime } from "@/lib/utils/format";

export function mapWorkflowStatus(status: WorkflowStatus) {
  if (status === WorkflowStatus.ACTIVE) {
    return "Active" as const;
  }

  if (status === WorkflowStatus.ARCHIVED) {
    return "Paused" as const;
  }

  return "Draft" as const;
}

export function mapRunState(status: RunStatus) {
  if (status === RunStatus.COMPLETED) {
    return "Completed" as const;
  }

  if (status === RunStatus.FAILED) {
    return "Failed" as const;
  }

  if (status === RunStatus.WAITING_APPROVAL) {
    return "Waiting Approval" as const;
  }

  return "Running" as const;
}

export function mapRunTiming(run: {
  startedAt: Date | null;
  completedAt: Date | null;
}) {
  return {
    startedAt: run.startedAt ? `Started ${formatRelativeTime(run.startedAt)}` : "Queued",
    duration: formatDuration(run.startedAt, run.completedAt)
  };
}
