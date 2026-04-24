import { getWorkspaceSnapshot } from "@/server/services/workspace-snapshot";

export async function getPlatformOverview() {
  return getWorkspaceSnapshot();
}
