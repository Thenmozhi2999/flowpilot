import Link from "next/link";
import { Bell, Search } from "lucide-react";

import { logoutAction } from "@/app/(platform)/actions";
import { platformNavigation } from "@/components/layout/platform-navigation";

type AppShellProps = {
  title: string;
  eyebrow: string;
  description: string;
  currentUserName: string;
  currentUserRole?: string;
  children: React.ReactNode;
};

export function AppShell({
  title,
  eyebrow,
  description,
  currentUserName,
  currentUserRole,
  children
}: AppShellProps) {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <div className="mx-auto grid min-h-screen max-w-[1600px] grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="border-b border-[var(--border)] bg-[rgba(5,10,19,0.75)] px-6 py-8 backdrop-blur-xl lg:border-b-0 lg:border-r">
          <div className="mb-10">
            <Link href="/" className="inline-flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[rgba(124,224,195,0.4)] bg-[rgba(124,224,195,0.14)] font-semibold text-[var(--primary)]">
                FP
              </span>
              <span>
                <span className="block text-lg font-semibold tracking-tight">FlowPilot</span>
                <span className="block text-sm text-[var(--muted)]">
                  Enterprise AI operations
                </span>
              </span>
            </Link>
          </div>

          <nav className="space-y-2">
            {platformNavigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group block rounded-2xl border border-transparent px-4 py-3 transition hover:border-[var(--border)] hover:bg-[rgba(255,255,255,0.03)]"
              >
                <div className="text-sm font-medium text-[var(--foreground)]">{item.title}</div>
                <div className="mt-1 text-sm text-[var(--muted)]">{item.description}</div>
              </Link>
            ))}
          </nav>

          <div className="mt-10 rounded-3xl border border-[rgba(255,200,107,0.25)] bg-[rgba(255,200,107,0.08)] p-5">
            <p className="text-sm font-medium text-[var(--accent)]">Production-ready direction</p>
            <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
              Workflow versioning, approvals, audit history, and agent governance are baked
              into the MVP surface from day one.
            </p>
          </div>

          <div className="mt-6 rounded-3xl border border-[var(--border)] bg-[rgba(255,255,255,0.03)] p-5">
            <p className="text-sm font-medium">{currentUserName}</p>
            <p className="mt-1 text-sm text-[var(--muted)]">{currentUserRole ?? "Workspace member"}</p>
            <form action={logoutAction} className="mt-4">
              <button
                type="submit"
                className="rounded-2xl border border-[var(--border)] px-4 py-2 text-sm font-medium transition hover:bg-[rgba(255,255,255,0.04)]"
              >
                Sign out
              </button>
            </form>
          </div>
        </aside>

        <main className="shell-grid px-5 py-5 sm:px-8 lg:px-10">
          <header className="mb-8 rounded-[28px] border border-[var(--border)] bg-[rgba(8,14,24,0.72)] p-5 shadow-[var(--shadow)] backdrop-blur-xl">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--primary)]">
                  {eyebrow}
                </p>
                <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1>
                <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--muted-foreground)]">
                  {description}
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[rgba(255,255,255,0.03)] px-4 py-3 text-sm text-[var(--muted)]">
                  <Search className="h-4 w-4" />
                  Search workflows, runs, approvals
                </div>
                <button
                  type="button"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[var(--border)] bg-[rgba(255,255,255,0.03)] px-4 py-3 text-sm font-medium text-[var(--foreground)] transition hover:bg-[rgba(255,255,255,0.06)]"
                >
                  <Bell className="h-4 w-4" />
                  Alerts
                </button>
              </div>
            </div>
          </header>

          {children}
        </main>
      </div>
    </div>
  );
}
