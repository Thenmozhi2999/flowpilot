import { decideApprovalAction } from "@/app/(platform)/actions";
import { Badge } from "@/components/ui/badge";
import { DatabaseStatus } from "@/components/platform/database-status";
import { SectionCard } from "@/components/ui/section-card";
import { getWorkspaceSnapshot } from "@/server/services/workspace-snapshot";
import type { ApprovalQueueItem, ExecutionTimelineItem } from "@/types/runs";

export default async function RunsPage() {
  const { databaseReady, approvalQueue, executionTimeline } = await getWorkspaceSnapshot();

  if (!databaseReady) {
    return <DatabaseStatus />;
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
      <SectionCard
        title="Execution timeline"
        description="Detailed run progression through system actions, AI evaluation, and human review checkpoints."
      >
        <div className="space-y-4">
          {executionTimeline.map((item: ExecutionTimelineItem, index) => (
            <article
              key={`${item.step}-${index}`}
              className="rounded-[24px] border border-[var(--border)] bg-[rgba(255,255,255,0.03)] p-5"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-base font-semibold">{item.step}</p>
                  <p className="mt-1 text-sm text-[var(--muted)]">{item.details}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge
                    tone={
                      item.state === "Completed"
                        ? "success"
                        : item.state === "Waiting Approval"
                          ? "warning"
                          : "neutral"
                    }
                  >
                    {item.state}
                  </Badge>
                  <span className="text-sm text-[var(--muted-foreground)]">{item.duration}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </SectionCard>

      <SectionCard
        title="Approval queue"
        description="Human-in-the-loop tasks that are currently gating downstream automation."
      >
        <div className="space-y-4">
          {approvalQueue.map((item: ApprovalQueueItem) => (
            <article
              key={item.id}
              className="rounded-[24px] border border-[var(--border)] bg-[rgba(255,255,255,0.03)] p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-base font-semibold">{item.title}</p>
                  <p className="mt-1 text-sm text-[var(--muted)]">{item.workflow}</p>
                </div>
                <Badge tone={item.priority === "High" ? "danger" : "warning"}>{item.priority}</Badge>
              </div>
              <div className="mt-4 text-sm text-[var(--muted-foreground)]">
                Owner {item.owner} · Waiting {item.age}
              </div>
              <div className="mt-4 flex gap-3">
                <form action={decideApprovalAction}>
                  <input type="hidden" name="approvalRequestId" value={item.id} />
                  <input type="hidden" name="decision" value="APPROVED" />
                  <button
                    type="submit"
                    className="rounded-2xl bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-slate-950"
                  >
                    Approve
                  </button>
                </form>
                <form action={decideApprovalAction}>
                  <input type="hidden" name="approvalRequestId" value={item.id} />
                  <input type="hidden" name="decision" value="REJECTED" />
                  <button
                    type="submit"
                    className="rounded-2xl border border-[rgba(255,125,125,0.35)] bg-[rgba(255,125,125,0.08)] px-4 py-2 text-sm font-semibold text-[var(--danger)]"
                  >
                    Reject
                  </button>
                </form>
              </div>
            </article>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
