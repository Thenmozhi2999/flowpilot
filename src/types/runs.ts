export type ExecutionTimelineItem = {
  step: string;
  state: "Completed" | "Waiting Approval" | "Pending";
  duration: string;
  details: string;
};

export type ApprovalQueueItem = {
  id: string;
  title: string;
  workflow: string;
  age: string;
  owner: string;
  priority: "High" | "Medium" | "Low";
};
