import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import { DatabaseStatus } from "@/components/platform/database-status";
import { SectionCard } from "@/components/ui/section-card";
import { StatCard } from "@/components/ui/stat-card";
import { getWorkspaceSnapshot } from "@/server/services/workspace-snapshot";
import type { WorkflowSummary } from "@/types/dashboard";

export default async function DashboardPage() {
  const { databaseReady, dashboardMetrics, workflowSummaries, recentRuns } = await getWorkspaceSnapshot();

  if (!databaseReady) {
    return <DatabaseStatus />;
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {dashboardMetrics.map((metric) => (
          <StatCard key={metric.label} metric={metric} />
        ))}
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <SectionCard
          title="Workflow portfolio"
          description="High-value automations with their deployment posture and delivery health."
        >
          <DataTable<WorkflowSummary>
            columns={[
              { key: "name", header: "Workflow" },
              { key: "owner", header: "Owner" },
              {
                key: "status",
                header: "Status",
                render: (value) => (
                  <Badge tone={value === "Active" ? "success" : value === "Draft" ? "warning" : "neutral"}>
                    {String(value)}
                  </Badge>
                )
              },
              { key: "lastRun", header: "Last run" },
              { key: "successRate", header: "Success rate" }
            ]}
            rows={workflowSummaries}
          />
        </SectionCard>

        <SectionCard
          title="Execution feed"
          description="Recent run activity across the workspace for quick operator triage."
        >
          <div className="space-y-4">
            {recentRuns.map((run) => (
              <article
                key={run.id}
                className="rounded-[24px] border border-[var(--border)] bg-[rgba(255,255,255,0.03)] p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-base font-semibold">{run.workflow}</p>
                    <p className="mt-1 text-sm text-[var(--muted)]">{run.startedAt}</p>
                  </div>
                  <Badge
                    tone={
                      run.state === "Completed"
                        ? "success"
                        : run.state === "Failed"
                          ? "danger"
                          : "warning"
                    }
                  >
                    {run.state}
                  </Badge>
                </div>
                <div className="mt-4 text-sm text-[var(--muted-foreground)]">
                  Run ID {run.id} · Duration {run.duration}
                </div>
              </article>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
