import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { loginAction } from "@/app/login/actions";
import { getCurrentUser } from "@/lib/auth/session";
import { getWorkspaceLoginUsers } from "@/server/repositories/auth-repository";

export default async function LoginPage() {
  const currentUser = await getCurrentUser();

  if (currentUser) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6">
        <div className="w-full max-w-xl rounded-[32px] border border-[var(--border)] bg-[var(--card)] p-8 shadow-[var(--shadow)]">
          <p className="text-sm uppercase tracking-[0.2em] text-[var(--primary)]">Signed in</p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight">
            {currentUser.firstName} {currentUser.lastName}
          </h1>
          <p className="mt-3 text-sm text-[var(--muted-foreground)]">
            Your workspace session is active. Continue into the control plane.
          </p>
          <Link
            href="/dashboard"
            className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-[var(--primary)] px-4 py-3 text-sm font-semibold text-slate-950"
          >
            Open dashboard
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </main>
    );
  }

  const members = await getWorkspaceLoginUsers();

  return (
    <main className="mx-auto flex min-h-screen max-w-5xl items-center px-6 py-10">
      <div className="grid w-full gap-8 lg:grid-cols-[1.15fr_0.85fr]">
        <section>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--accent)]">
            Workspace sign-in
          </p>
          <h1 className="mt-5 text-5xl font-semibold tracking-tight">
            Enter FlowPilot as an operator, builder, or approver.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--muted-foreground)]">
            This environment uses seeded workspace users so we can test permissions and approvals
            end to end while the broader enterprise auth stack is still being built.
          </p>
        </section>

        <section className="rounded-[32px] border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--shadow)]">
          <h2 className="text-xl font-semibold tracking-tight">Choose a workspace user</h2>
          <div className="mt-5 space-y-4">
            {members.map((member) => (
              <form
                key={member.id}
                action={loginAction}
                className="rounded-[24px] border border-[var(--border)] bg-[rgba(255,255,255,0.03)] p-5"
              >
                <input type="hidden" name="userId" value={member.user.id} />
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-base font-semibold">
                      {member.user.firstName} {member.user.lastName}
                    </p>
                    <p className="mt-1 text-sm text-[var(--muted)]">{member.user.email}</p>
                    <p className="mt-2 text-xs uppercase tracking-[0.18em] text-[var(--primary)]">
                      {member.role}
                    </p>
                  </div>
                  <button
                    type="submit"
                    className="rounded-2xl bg-[var(--primary)] px-4 py-3 text-sm font-semibold text-slate-950"
                  >
                    Continue
                  </button>
                </div>
              </form>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
