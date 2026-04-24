import { prisma } from "@/lib/db/prisma";

export async function getWorkspaceContextBySlug(organizationSlug: string, workspaceSlug: string) {
  return prisma.workspace.findFirst({
    where: {
      slug: workspaceSlug,
      organization: {
        slug: organizationSlug
      }
    },
    select: {
      id: true,
      name: true,
      slug: true,
      organizationId: true,
      organization: {
        select: {
          id: true,
          name: true,
          slug: true
        }
      }
    }
  });
}
