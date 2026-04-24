import { TriggerType } from "@prisma/client";

import { defaultWorkspaceContext } from "@/lib/config/app";
import { toTitleCase } from "@/lib/utils/format";
import { getWorkspaceContextBySlug } from "@/server/repositories/workspace-context-repository";
import { getWorkflowBySlug } from "@/server/repositories/workflow-repository";
import { mapRunState, mapRunTiming, mapWorkflowStatus } from "@/server/services/workflow-mappers";
import type { WorkflowDetail } from "@/types/workflows";

export async function getWorkflowDetail(workflowSlug: string): Promise<WorkflowDetail | null> {
  const workspace = await getWorkspaceContextBySlug(
    defaultWorkspaceContext.organizationSlug,
    defaultWorkspaceContext.workspaceSlug
  );

  if (!workspace) {
    return null;
  }

  const workflow = await getWorkflowBySlug(workspace.id, workflowSlug);

  if (!workflow || !workflow.activeVersion) {
    return null;
  }

  return {
    id: workflow.id,
    slug: workflow.slug,
    name: workflow.name,
    description: workflow.description ?? "",
    status: mapWorkflowStatus(workflow.status),
    triggerType: workflow.activeVersion.triggerType as TriggerType,
    version: workflow.activeVersion.versionNumber,
    stepCount: workflow.activeVersion.steps.length,
    steps: workflow.activeVersion.steps.map((step) => ({
      key: step.key,
      name: step.name,
      type: step.type,
      description: step.description ?? `${toTitleCase(step.type)} step`
    })),
    runs: workflow.runs.map((run) => {
      const timing = mapRunTiming(run);

      return {
        id: run.id,
        status: mapRunState(run.status),
        startedAt: timing.startedAt,
        duration: timing.duration,
        initiatedBy: run.initiatedBy ? `${run.initiatedBy.firstName} ${run.initiatedBy.lastName}` : "System"
      };
    })
  };
}
