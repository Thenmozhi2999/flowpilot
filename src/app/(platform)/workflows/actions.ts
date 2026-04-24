"use server";

import { revalidatePath } from "next/cache";

import { defaultWorkspaceContext } from "@/lib/config/app";
import { workflowCreateSchema, workflowUpdateSchema } from "@/lib/validation/workflow";
import { getWorkspaceContextBySlug } from "@/server/repositories/workspace-context-repository";
import {
  createWorkflowDefinition,
  createWorkflowRun,
  getWorkflowBySlug,
  updateWorkflowDefinition
} from "@/server/repositories/workflow-repository";

export type CreateWorkflowActionState = {
  status: "idle" | "success" | "error";
  message?: string;
};

export type UpdateWorkflowActionState = {
  status: "idle" | "success" | "error";
  message?: string;
};

const initialWorkflowSteps = [
  {
    key: "collect_context",
    name: "Collect source context",
    type: "TOOL_ACTION" as const,
    description: "Retrieve the source request and business context."
  },
  {
    key: "ai_analysis",
    name: "AI analysis",
    type: "AI_TASK" as const,
    description: "Classify, summarize, and determine the next action."
  },
  {
    key: "approval_gate",
    name: "Approval gate",
    type: "APPROVAL" as const,
    description: "Require human approval before sensitive execution continues."
  },
  {
    key: "notify_owner",
    name: "Notify owner",
    type: "NOTIFICATION" as const,
    description: "Send completion or escalation details to the workflow owner."
  }
];

export async function createWorkflowAction(
  _previousState: CreateWorkflowActionState,
  formData: FormData
): Promise<CreateWorkflowActionState> {
  const parsed = workflowCreateSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    triggerType: formData.get("triggerType")
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "Workflow input is invalid."
    };
  }

  const workspace = await getWorkspaceContextBySlug(
    defaultWorkspaceContext.organizationSlug,
    defaultWorkspaceContext.workspaceSlug
  );

  if (!workspace) {
    return {
      status: "error",
      message: "Workspace not found. Run migrations and seed the database first."
    };
  }

  await createWorkflowDefinition({
    workspaceId: workspace.id,
    name: parsed.data.name,
    description: parsed.data.description,
    triggerType: parsed.data.triggerType,
    steps: initialWorkflowSteps
  });

  revalidatePath("/dashboard");
  revalidatePath("/workflows");

  return {
    status: "success",
    message: "Workflow created successfully."
  };
}

export async function updateWorkflowAction(
  _previousState: UpdateWorkflowActionState,
  formData: FormData
): Promise<UpdateWorkflowActionState> {
  const workflowSlug = String(formData.get("workflowSlug") ?? "");

  const parsed = workflowUpdateSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    status: formData.get("status"),
    triggerType: formData.get("triggerType")
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "Workflow update is invalid."
    };
  }

  const workspace = await getWorkspaceContextBySlug(
    defaultWorkspaceContext.organizationSlug,
    defaultWorkspaceContext.workspaceSlug
  );

  if (!workspace) {
    return {
      status: "error",
      message: "Workspace not found."
    };
  }

  const workflow = await getWorkflowBySlug(workspace.id, workflowSlug);

  if (!workflow) {
    return {
      status: "error",
      message: "Workflow not found."
    };
  }

  await updateWorkflowDefinition({
    workflowId: workflow.id,
    ...parsed.data
  });

  revalidatePath("/dashboard");
  revalidatePath("/workflows");
  revalidatePath(`/workflows/${workflowSlug}`);

  return {
    status: "success",
    message: "Workflow updated."
  };
}

export async function triggerWorkflowRunAction(workflowSlug: string) {
  const workspace = await getWorkspaceContextBySlug(
    defaultWorkspaceContext.organizationSlug,
    defaultWorkspaceContext.workspaceSlug
  );

  if (!workspace) {
    throw new Error("Workspace not found.");
  }

  const workflow = await getWorkflowBySlug(workspace.id, workflowSlug);

  if (!workflow) {
    throw new Error("Workflow not found.");
  }

  await createWorkflowRun({
    workspaceId: workspace.id,
    workflowId: workflow.id
  });

  revalidatePath("/dashboard");
  revalidatePath("/runs");
  revalidatePath("/workflows");
  revalidatePath(`/workflows/${workflowSlug}`);
}
