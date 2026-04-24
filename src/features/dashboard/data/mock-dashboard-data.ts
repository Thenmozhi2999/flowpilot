import type { MetricCard, RunFeedItem, WorkflowSummary } from "@/types/dashboard";

export const dashboardMetrics: MetricCard[] = [
  { label: "Active workflows", value: "42", delta: "+8.1%", trend: "up" },
  { label: "Runs today", value: "1,284", delta: "+14.6%", trend: "up" },
  { label: "Approval backlog", value: "12", delta: "-3.2%", trend: "down" },
  { label: "Median run time", value: "02m 14s", delta: "Stable", trend: "neutral" }
];

export const workflowSummaries: WorkflowSummary[] = [
  {
    id: "wf_procurement",
    name: "Procurement Intake Triage",
    owner: "Operations",
    status: "Active",
    lastRun: "4 minutes ago",
    successRate: "99.1%"
  },
  {
    id: "wf_finops",
    name: "Invoice Reconciliation",
    owner: "Finance Systems",
    status: "Active",
    lastRun: "12 minutes ago",
    successRate: "97.8%"
  },
  {
    id: "wf_vendor_onboarding",
    name: "Vendor Onboarding Review",
    owner: "Security",
    status: "Draft",
    lastRun: "Not deployed",
    successRate: "N/A"
  }
];

export const recentRuns: RunFeedItem[] = [
  {
    id: "run_19384",
    workflow: "Invoice Reconciliation",
    state: "Running",
    startedAt: "Started 90 seconds ago",
    duration: "01m 30s"
  },
  {
    id: "run_19382",
    workflow: "Procurement Intake Triage",
    state: "Waiting Approval",
    startedAt: "Started 7 minutes ago",
    duration: "07m 02s"
  },
  {
    id: "run_19380",
    workflow: "Contract Risk Review",
    state: "Failed",
    startedAt: "Started 18 minutes ago",
    duration: "03m 11s"
  },
  {
    id: "run_19376",
    workflow: "Customer Escalation Routing",
    state: "Completed",
    startedAt: "Started 31 minutes ago",
    duration: "01m 54s"
  }
];
