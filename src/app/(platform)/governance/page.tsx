import { DatabaseStatus } from "@/components/platform/database-status";
import { SectionCard } from "@/components/ui/section-card";
import { getWorkspaceSnapshot } from "@/server/services/workspace-snapshot";

export default async function GovernancePage() {
  const { auditFeed, databaseReady, governanceHighlights } = await getWorkspaceSnapshot();

  if (!databaseReady) {
    return <DatabaseStatus />;
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-3">
        {governanceHighlights.map((item) => (
          <article
            key={item.label}
            className="rounded-[24px] border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--shadow)]"
          >
            <p className="text-sm text-[var(--muted)]">{item.label}</p>
            <p className="mt-4 text-3xl font-semibold tracking-tight">{item.value}</p>
            <p className="mt-3 text-sm leading-6 text-[var(--muted-foreground)]">{item.note}</p>
          </article>
        ))}
      </section>

      <SectionCard
        title="Audit activity"
        description="Latest governance and control-plane actions emitted by the platform."
      >
        <div className="space-y-4">
          {auditFeed.map((event) => (
            <article
              key={`${event.action}-${event.timestamp}`}
              className="rounded-[24px] border border-[var(--border)] bg-[rgba(255,255,255,0.03)] p-5"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-base font-semibold">{event.action}</p>
                  <p className="mt-1 text-sm text-[var(--muted)]">
                    {event.actor} · {event.target}
                  </p>
                </div>
                <p className="text-sm text-[var(--muted-foreground)]">{event.timestamp}</p>
              </div>
            </article>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
