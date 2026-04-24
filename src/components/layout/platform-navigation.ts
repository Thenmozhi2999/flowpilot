import type { NavigationItem } from "@/types/navigation";

export const platformNavigation: NavigationItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    description: "Operational overview for workflows, approvals, and execution health."
  },
  {
    title: "Workflows",
    href: "/workflows",
    description: "Catalog of versioned automation definitions and builder entry points."
  },
  {
    title: "Runs",
    href: "/runs",
    description: "Execution timeline, approval queue, and issue triage."
  },
  {
    title: "Agents",
    href: "/agents",
    description: "AI registry, provider inventory, and usage governance."
  },
  {
    title: "Governance",
    href: "/governance",
    description: "Approval posture, policy activity, and audit coverage."
  },
  {
    title: "Settings",
    href: "/settings",
    description: "Tenant, integration, and environment configuration surfaces."
  }
];
