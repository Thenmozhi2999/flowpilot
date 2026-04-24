import { defaultWorkspaceContext } from "@/lib/config/app";
import { prisma } from "@/lib/db/prisma";

export async function getWorkspaceLoginUsers() {
  return prisma.workspaceMember.findMany({
    where: {
      workspace: {
        slug: defaultWorkspaceContext.workspaceSlug,
        organization: {
          slug: defaultWorkspaceContext.organizationSlug
        }
      }
    },
    orderBy: {
      createdAt: "asc"
    },
    include: {
      user: true
    }
  });
}

export async function getUserById(userId: string) {
  return prisma.user.findUnique({
    where: {
      id: userId
    }
  });
}
