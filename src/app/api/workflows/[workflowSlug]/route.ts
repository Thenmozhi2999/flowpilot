import { NextResponse } from "next/server";
import { WorkflowStatus } from "@prisma/client";

import { defaultWorkspaceContext } from "@/lib/config/app";
import { workflowUpdateSchema } from "@/lib/validation/workflow";
import { getWorkspaceContextBySlug } from "@/server/repositories/workspace-context-repository";
import { getWorkflowBySlug, updateWorkflowDefinition } from "@/server/repositories/workflow-repository";
import { getWorkflowDetail } from "@/server/services/workflow-details";

type RouteProps = {
  params: Promise<{
    workflowSlug: string;
  }>;
};

export async function GET(_request: Request, { params }: RouteProps) {
  const { workflowSlug } = await params;
  const workflow = await getWorkflowDetail(workflowSlug);

  if (!workflow) {
    return NextResponse.json({ error: "Workflow not found" }, { status: 404 });
  }

  return NextResponse.json(workflow);
}

export async function PATCH(request: Request, { params }: RouteProps) {
  const { workflowSlug } = await params;
  const payload = await request.json();
  const parsed = workflowUpdateSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const workspace = await getWorkspaceContextBySlug(
    defaultWorkspaceContext.organizationSlug,
    defaultWorkspaceContext.workspaceSlug
  );

  if (!workspace) {
    return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
  }

  const workflow = await getWorkflowBySlug(workspace.id, workflowSlug);

  if (!workflow) {
    return NextResponse.json({ error: "Workflow not found" }, { status: 404 });
  }

  await updateWorkflowDefinition({
    workflowId: workflow.id,
    name: parsed.data.name,
    description: parsed.data.description,
    triggerType: parsed.data.triggerType,
    status: parsed.data.status as WorkflowStatus
  });

  const updated = await getWorkflowDetail(workflowSlug);

  return NextResponse.json(updated);
}
