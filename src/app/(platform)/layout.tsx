import { requireCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { AppShell } from "@/components/layout/app-shell";

export default async function PlatformLayout({ children }: { children: React.ReactNode }) {
  const currentUser = await requireCurrentUser();
  const membership = await prisma.workspaceMember.findFirst({
    where: {
      userId: currentUser.id
    },
    select: {
      role: true
    }
  });

  return (
    <AppShell
      eyebrow="MVP Workspace"
      title="FlowPilot Control Plane"
      description="Starter enterprise surfaces for operators designing workflows, monitoring runtime health, governing AI agents, and managing compliance-critical approvals."
      currentUserName={`${currentUser.firstName} ${currentUser.lastName}`}
      currentUserRole={membership?.role}
    >
      {children}
    </AppShell>
  );
}
