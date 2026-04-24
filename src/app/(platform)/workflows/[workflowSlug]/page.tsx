import { Badge } from "@/components/ui/badge";
import { DatabaseStatus } from "@/components/platform/database-status";
import { SectionCard } from "@/components/ui/section-card";
import { WorkflowDetailForm } from "@/components/workflows/workflow-detail-form";
import { getWorkflowDetail } from "@/server/services/workflow-details";
import { getWorkspaceSnapshot } from "@/server/services/workspace-snapshot";

type WorkflowDetailPageProps = {
  params: Promise<{
    workflowSlug: string;
  }>;
};

export default async function WorkflowDetailPage({ params }: WorkflowDetailPageProps) {
  const { databaseReady } = await getWorkspaceSnapshot();

  if (!databaseReady) {
    return <DatabaseStatus />;
  }

  const { workflowSlug } = await params;
  const workflow = await getWorkflowDetail(workflowSlug);

  if (!workflow) {
    return (
      <SectionCard
        title="Workflow not found"
        description="The requested workflow could not be loaded from the current workspace."
      >
        <p className="text-sm text-[var(--muted)]">Return to the workflow registry and choose another item.</p>
      </SectionCard>
    );
  }

  return (
    <div className="space-y-6">
      <SectionCard
        title={workflow.name}
        description="Edit workflow metadata, inspect the active version, and manually trigger runtime execution."
        action={
          <div className="flex gap-2">
            <Badge tone={workflow.status === "Active" ? "success" : workflow.status === "Draft" ? "warning" : "neutral"}>
              {workflow.status}
            </Badge>
            <Badge tone="neutral">v{workflow.version}</Badge>
          </div>
        }
      >
        <WorkflowDetailForm workflow={workflow} />
      </SectionCard>

      <SectionCard
        title="Active version steps"
        description="Current execution plan for the selected workflow."
      >
        <div className="grid gap-4 lg:grid-cols-2">
          {workflow.steps.map((step, index) => (
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
              <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">{step.description}</p>
            </article>
          ))}
        </div>
      </SectionCard>

      <SectionCard
        title="Recent runs"
        description="Latest execution attempts for this workflow."
      >
        <div className="space-y-4">
          {workflow.runs.map((run) => (
            <article
              key={run.id}
              className="rounded-[24px] border border-[var(--border)] bg-[rgba(255,255,255,0.03)] p-5"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-base font-semibold">{run.startedAt}</p>
                  <p className="mt-1 text-sm text-[var(--muted)]">{run.initiatedBy}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge
                    tone={
                      run.status === "Completed"
                        ? "success"
                        : run.status === "Failed"
                          ? "danger"
                          : "warning"
                    }
                  >
                    {run.status}
                  </Badge>
                  <span className="text-sm text-[var(--muted-foreground)]">{run.duration}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
