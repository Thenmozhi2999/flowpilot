import type { AgentRegistryItem } from "@/types/agents";

export const agentRegistry: AgentRegistryItem[] = [
  {
    name: "Policy Analyst",
    provider: "OpenAI",
    model: "gpt-4.1",
    owner: "Platform AI",
    usage: "124 workflows"
  },
  {
    name: "Document Classifier",
    provider: "Anthropic",
    model: "claude-3-5-sonnet",
    owner: "Knowledge Systems",
    usage: "62 workflows"
  },
  {
    name: "Routing Copilot",
    provider: "OpenAI",
    model: "gpt-4o-mini",
    owner: "Operations",
    usage: "18 workflows"
  }
];
