import { SectionCard } from "@/components/ui/section-card";

const settingsGroups = [
  {
    title: "Workspace and tenancy",
    description:
      "Organization, workspace, and role boundaries live here. This is where SSO, SCIM, and tenant policy controls will land next."
  },
  {
    title: "Integrations and secrets",
    description:
      "Connection inventory, credential rotation, and outbound system policy checks should be managed in this boundary."
  },
  {
    title: "Execution infrastructure",
    description:
      "Queue backends, retry defaults, trace exporters, and worker concurrency controls will extend this surface."
  }
];

export default function SettingsPage() {
  return (
    <SectionCard
      title="Platform settings"
      description="Reserved control surfaces for enterprise configuration. The scaffold keeps these concerns separate from day-to-day operator workflows."
    >
      <div className="grid gap-4 lg:grid-cols-3">
        {settingsGroups.map((group) => (
          <article
            key={group.title}
            className="rounded-[24px] border border-[var(--border)] bg-[rgba(255,255,255,0.03)] p-5"
          >
            <h2 className="text-lg font-semibold tracking-tight">{group.title}</h2>
            <p className="mt-3 text-sm leading-6 text-[var(--muted-foreground)]">
              {group.description}
            </p>
          </article>
        ))}
      </div>
    </SectionCard>
  );
}
