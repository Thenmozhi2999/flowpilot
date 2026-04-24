import type { AgentRegistryItem } from "@/types/agents";
import type { MetricCard, RunFeedItem, WorkflowSummary } from "@/types/dashboard";
import type { ApprovalQueueItem, ExecutionTimelineItem } from "@/types/runs";
import type { WorkflowBuilderStep, WorkflowCatalogItem } from "@/types/workflows";

export type GovernanceHighlight = {
  label: string;
  value: string;
  note: string;
};

export type AuditFeedItem = {
  action: string;
  actor: string;
  target: string;
  timestamp: string;
};

export type WorkspaceSnapshot = {
  databaseReady: boolean;
  dashboardMetrics: MetricCard[];
  workflowSummaries: WorkflowSummary[];
  recentRuns: RunFeedItem[];
  workflowCatalog: WorkflowCatalogItem[];
  workflowBuilderSteps: WorkflowBuilderStep[];
  executionTimeline: ExecutionTimelineItem[];
  approvalQueue: ApprovalQueueItem[];
  agentRegistry: AgentRegistryItem[];
  governanceHighlights: GovernanceHighlight[];
  auditFeed: AuditFeedItem[];
};
