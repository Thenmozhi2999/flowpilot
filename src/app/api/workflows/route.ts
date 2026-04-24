import { NextResponse } from "next/server";

import { getWorkspaceSnapshot } from "@/server/services/workspace-snapshot";

export async function GET() {
  const snapshot = await getWorkspaceSnapshot();

  return NextResponse.json({
    workflows: snapshot.workflowCatalog
  });
}
