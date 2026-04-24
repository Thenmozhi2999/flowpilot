import { Badge } from "@/components/ui/badge";
import { DatabaseStatus } from "@/components/platform/database-status";
import { DataTable } from "@/components/ui/data-table";
import { SectionCard } from "@/components/ui/section-card";
import { getWorkspaceSnapshot } from "@/server/services/workspace-snapshot";
import type { AgentRegistryItem } from "@/types/agents";

export default async function AgentsPage() {
  const { agentRegistry, databaseReady } = await getWorkspaceSnapshot();

  if (!databaseReady) {
    return <DatabaseStatus />;
  }

  return (
    <SectionCard
      title="Agent registry"
      description="Managed AI assets with provider metadata, model lineage, and ownership visibility."
      action={
        <span className="rounded-full border border-[var(--border)] px-3 py-1 text-xs text-[var(--muted)]">
          Seeded tenant data
        </span>
      }
    >
      <DataTable<AgentRegistryItem>
        columns={[
          { key: "name", header: "Agent" },
          { key: "provider", header: "Provider" },
          {
            key: "model",
            header: "Model",
            render: (value) => <Badge tone="neutral">{String(value)}</Badge>
          },
          { key: "owner", header: "Owner" },
          { key: "usage", header: "Usage" }
        ]}
        rows={agentRegistry}
      />
    </SectionCard>
  );
}
