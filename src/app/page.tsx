import Link from "next/link";
import { ArrowRight, ShieldCheck, Sparkles, Workflow } from "lucide-react";

const pillars = [
  {
    title: "Governed automation",
    description: "Versioned workflows, approvals, and auditability built into the core model.",
    icon: ShieldCheck
  },
  {
    title: "Agentic operations",
    description: "A registry for enterprise AI agents, models, and provider ownership.",
    icon: Sparkles
  },
  {
    title: "Reliable execution",
    description: "Workflow runs, step telemetry, and future-ready worker boundaries.",
    icon: Workflow
  }
];

export default function LandingPage() {
  return (
    <main className="relative min-h-screen overflow-hidden px-6 py-10 sm:px-10 lg:px-16">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(124,224,195,0.16),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(255,200,107,0.12),transparent_22%)]" />

      <div className="relative mx-auto max-w-6xl">
        <div className="flex items-center justify-between rounded-full border border-[var(--border)] bg-[rgba(5,10,19,0.55)] px-5 py-4 backdrop-blur-xl">
          <div className="text-sm font-semibold tracking-[0.2em] text-[var(--primary)]">FLOWPILOT</div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] px-4 py-2 text-sm font-medium text-[var(--foreground)] transition hover:bg-[rgba(255,255,255,0.04)]"
          >
            Open platform
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <section className="grid gap-10 pb-16 pt-20 lg:grid-cols-[1.25fr_0.95fr] lg:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.26em] text-[var(--accent)]">
              Enterprise AI workflow automation
            </p>
            <h1 className="mt-5 max-w-4xl text-5xl font-semibold tracking-tight sm:text-6xl lg:text-7xl">
              Orchestrate AI, humans, and systems without losing control.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--muted-foreground)]">
              FlowPilot gives operations teams a governed control plane for workflow design,
              execution monitoring, approvals, and agent oversight.
            </p>
          </div>

          <div className="rounded-[32px] border border-[var(--border)] bg-[rgba(8,14,24,0.78)] p-6 shadow-[var(--shadow)] backdrop-blur-xl">
            <p className="text-sm text-[var(--muted)]">MVP delivery scope</p>
            <div className="mt-4 space-y-4">
              <div className="rounded-3xl border border-[rgba(124,224,195,0.2)] bg-[rgba(124,224,195,0.08)] p-4">
                <p className="text-sm font-medium text-[var(--primary)]">Workflow definitions</p>
                <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
                  Versioned workflow models, step types, trigger types, and runtime history.
                </p>
              </div>
              <div className="rounded-3xl border border-[rgba(255,200,107,0.2)] bg-[rgba(255,200,107,0.08)] p-4">
                <p className="text-sm font-medium text-[var(--accent)]">Execution control</p>
                <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
                  Runs, logs, approvals, and audit surfaces ready for worker-based orchestration.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-5 pb-10 md:grid-cols-3">
          {pillars.map(({ icon: Icon, title, description }) => (
            <article
              key={title}
              className="rounded-[28px] border border-[var(--border)] bg-[rgba(8,14,24,0.68)] p-6 shadow-[var(--shadow)] backdrop-blur-xl"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[rgba(124,224,195,0.12)] text-[var(--primary)]">
                <Icon className="h-5 w-5" />
              </div>
              <h2 className="mt-5 text-xl font-semibold tracking-tight">{title}</h2>
              <p className="mt-3 text-sm leading-6 text-[var(--muted-foreground)]">{description}</p>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
