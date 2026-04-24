export type WorkflowCatalogItem = {
  id: string;
  slug: string;
  name: string;
  trigger: string;
  version: string;
  owner: string;
  status: "Active" | "Draft" | "Paused";
  steps: number;
  sla: string;
  lastRun: string;
};

export type WorkflowBuilderStep = {
  key: string;
  name: string;
  type:
    | "TOOL_ACTION"
    | "AI_TASK"
    | "APPROVAL"
    | "CONDITION"
    | "HUMAN_TASK"
    | "DELAY"
    | "NOTIFICATION";
  description: string;
};

export type WorkflowRunListItem = {
  id: string;
  status: "Running" | "Waiting Approval" | "Failed" | "Completed";
  startedAt: string;
  duration: string;
  initiatedBy: string;
};

export type WorkflowDetail = {
  id: string;
  slug: string;
  name: string;
  description: string;
  status: "Active" | "Draft" | "Paused";
  triggerType: "MANUAL" | "SCHEDULE" | "WEBHOOK" | "EVENT";
  version: number;
  stepCount: number;
  steps: WorkflowBuilderStep[];
  runs: WorkflowRunListItem[];
};
