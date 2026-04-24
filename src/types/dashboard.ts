export type MetricCard = {
  label: string;
  value: string;
  delta: string;
  trend: "up" | "down" | "neutral";
};

export type WorkflowSummary = {
  id: string;
  name: string;
  owner: string;
  status: "Active" | "Draft" | "Paused";
  lastRun: string;
  successRate: string;
};

export type RunFeedItem = {
  id: string;
  workflow: string;
  state: "Running" | "Waiting Approval" | "Failed" | "Completed";
  startedAt: string;
  duration: string;
};
