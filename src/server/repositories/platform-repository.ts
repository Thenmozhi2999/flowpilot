import { getWorkspaceSnapshot } from "@/server/services/workspace-snapshot";

export async function getPlatformRepositorySnapshot() {
  return getWorkspaceSnapshot();
}
