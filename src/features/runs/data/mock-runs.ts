import type { ApprovalQueueItem, ExecutionTimelineItem } from "@/types/runs";

export const executionTimeline: ExecutionTimelineItem[] = [
  {
    step: "Collect source context",
    state: "Completed",
    duration: "12s",
    details: "ERP, vendor registry, and prior approvals loaded."
  },
  {
    step: "AI risk assessment",
    state: "Completed",
    duration: "24s",
    details: "Risk score 0.71 with sanctions mismatch flag."
  },
  {
    step: "Director approval",
    state: "Waiting Approval",
    duration: "02m 11s",
    details: "Approval requested from EMEA Procurement Director."
  },
  {
    step: "Notify requester",
    state: "Pending",
    duration: "0s",
    details: "Queued until approval outcome is received."
  }
];

export const approvalQueue: ApprovalQueueItem[] = [
  {
    id: "approval_vendor_northwind",
    title: "Vendor onboarding for Northwind Imports",
    workflow: "Vendor Onboarding Review",
    age: "6m",
    owner: "Security",
    priority: "High"
  },
  {
    id: "approval_invoice_88421",
    title: "Exception override for invoice #88421",
    workflow: "Invoice Reconciliation",
    age: "14m",
    owner: "Finance Systems",
    priority: "Medium"
  }
];
