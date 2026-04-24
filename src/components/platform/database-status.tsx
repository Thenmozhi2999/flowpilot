type DatabaseStatusProps = {
  title?: string;
  description?: string;
};

export function DatabaseStatus({
  title = "Database setup required",
  description = "Run Prisma migrations and seed the workspace so FlowPilot can load real tenant data."
}: DatabaseStatusProps) {
  return (
    <section className="rounded-[28px] border border-[rgba(255,200,107,0.28)] bg-[rgba(255,200,107,0.08)] p-6 shadow-[var(--shadow)]">
      <h2 className="text-xl font-semibold tracking-tight text-[var(--accent)]">{title}</h2>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted-foreground)]">
        {description}
      </p>
      <pre className="mt-5 overflow-x-auto rounded-2xl border border-[var(--border)] bg-[rgba(8,14,24,0.88)] px-4 py-4 text-sm text-[var(--foreground)]">
        <code>npm.cmd run prisma:generate{"\n"}npm.cmd run prisma:migrate{"\n"}npm.cmd run db:seed</code>
      </pre>
    </section>
  );
}
