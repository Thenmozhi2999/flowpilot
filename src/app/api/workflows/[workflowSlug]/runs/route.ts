import { NextResponse } from "next/server";

import { defaultWorkspaceContext } from "@/lib/config/app";
import { getWorkspaceContextBySlug } from "@/server/repositories/workspace-context-repository";
import { createWorkflowRun, getWorkflowBySlug } from "@/server/repositories/workflow-repository";

type RouteProps = {
  params: Promise<{
    workflowSlug: string;
  }>;
};

export async function POST(_request: Request, { params }: RouteProps) {
  const { workflowSlug } = await params;
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

  const run = await createWorkflowRun({
    workspaceId: workspace.id,
    workflowId: workflow.id
  });

  return NextResponse.json({ runId: run.id }, { status: 201 });
}
