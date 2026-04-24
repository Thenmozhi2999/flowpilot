import type { WorkflowBuilderStep, WorkflowCatalogItem } from "@/types/workflows";

export const workflowCatalog: WorkflowCatalogItem[] = [
  {
    id: "wf_procurement",
    slug: "procurement-intake-triage",
    name: "Procurement Intake Triage",
    trigger: "Webhook",
    version: "v12",
    owner: "Operations",
    status: "Active",
    steps: 6,
    sla: "4m target",
    lastRun: "4 minutes ago"
  },
  {
    id: "wf_finops",
    slug: "invoice-reconciliation",
    name: "Invoice Reconciliation",
    trigger: "Scheduled",
    version: "v8",
    owner: "Finance Systems",
    status: "Active",
    steps: 9,
    sla: "10m target",
    lastRun: "12 minutes ago"
  },
  {
    id: "wf_vendor_onboarding",
    slug: "vendor-onboarding-review",
    name: "Vendor Onboarding Review",
    trigger: "Manual",
    version: "v3",
    owner: "Security",
    status: "Draft",
    steps: 7,
    sla: "Human gate",
    lastRun: "Not run yet"
  }
];

export const workflowBuilderSteps: WorkflowBuilderStep[] = [
  {
    key: "collect_context",
    name: "Collect source context",
    type: "TOOL_ACTION",
    description: "Pull the request, vendor profile, and prior policy decisions."
  },
  {
    key: "ai_risk_assessment",
    name: "AI risk assessment",
    type: "AI_TASK",
    description: "Generate risk signals, summarize missing data, and classify severity."
  },
  {
    key: "approval_gate",
    name: "Director approval",
    type: "APPROVAL",
    description: "Pause high-risk requests until an owner explicitly approves."
  },
  {
    key: "notify_requester",
    name: "Notify requester",
    type: "NOTIFICATION",
    description: "Send outcome and next actions to the originating system."
  }
];
