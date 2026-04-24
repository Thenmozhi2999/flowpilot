import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { CreateWorkflowForm } from "@/components/workflows/create-workflow-form";
import { DatabaseStatus } from "@/components/platform/database-status";
import { DataTable } from "@/components/ui/data-table";
import { SectionCard } from "@/components/ui/section-card";
import { getWorkspaceSnapshot } from "@/server/services/workspace-snapshot";
import type { WorkflowCatalogItem } from "@/types/workflows";

export default async function WorkflowsPage() {
  const { databaseReady, workflowBuilderSteps, workflowCatalog } = await getWorkspaceSnapshot();

  if (!databaseReady) {
    return <DatabaseStatus description="Initialize Postgres, run migrations, and seed the workspace before creating real workflows." />;
  }

  return (
    <div className="space-y-6">
      <SectionCard
        title="Workflow registry"
        description="Real workflow definitions stored in PostgreSQL through Prisma. New entries created here are persisted and versioned."
        action={<span className="rounded-full border border-[var(--border)] px-3 py-1 text-xs text-[var(--muted)]">Database-backed</span>}
      >
        <DataTable<WorkflowCatalogItem>
          columns={[
            {
              key: "name",
              header: "Workflow",
              render: (value, row) => (
                <Link href={`/workflows/${row.slug}`} className="font-medium text-[var(--primary)] hover:underline">
                  {String(value)}
                </Link>
              )
            },
            { key: "trigger", header: "Trigger" },
            { key: "version", header: "Version" },
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
            { key: "steps", header: "Steps" },
            { key: "sla", header: "SLA" },
            { key: "lastRun", header: "Last run" }
          ]}
          rows={workflowCatalog}
        />
      </SectionCard>

      <SectionCard
        title="Create workflow"
        description="Create a persisted workflow with a safe production starter sequence. This writes to PostgreSQL and refreshes the dashboard."
      >
        <CreateWorkflowForm />
      </SectionCard>

      <SectionCard
        title="Active version preview"
        description="The current active workflow version step sequence from the seeded tenant."
      >
        <div className="grid gap-4 lg:grid-cols-2">
          {workflowBuilderSteps.map((step, index) => (
            <article
              key={step.key}
              className="rounded-[24px] border border-[var(--border)] bg-[rgba(255,255,255,0.03)] p-5"
            >
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                  Step {index + 1}
                </p>
                <Badge tone={step.type === "APPROVAL" ? "warning" : "neutral"}>{step.type}</Badge>
              </div>
              <h3 className="mt-3 text-lg font-semibold">{step.name}</h3>
              <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
                {step.description}
              </p>
            </article>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
