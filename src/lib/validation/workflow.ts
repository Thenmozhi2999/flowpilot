import { z } from "zod";

export const workflowStatusSchema = z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]);

export const workflowCreateSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters.").max(120),
  description: z
    .string()
    .max(500, "Description must be 500 characters or fewer.")
    .optional()
    .or(z.literal("")),
  triggerType: z.enum(["MANUAL", "SCHEDULE", "WEBHOOK", "EVENT"])
});

export const workflowUpdateSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters.").max(120),
  description: z
    .string()
    .max(500, "Description must be 500 characters or fewer.")
    .optional()
    .or(z.literal("")),
  status: z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]),
  triggerType: z.enum(["MANUAL", "SCHEDULE", "WEBHOOK", "EVENT"])
});

export const workflowDefinitionSchema = z.object({
  name: z.string().min(3).max(120),
  description: z.string().max(500).optional(),
  triggerType: z.enum(["MANUAL", "SCHEDULE", "WEBHOOK", "EVENT"]),
  steps: z
    .array(
      z.object({
        key: z.string().min(2).max(80),
        name: z.string().min(2).max(120),
        type: z.enum([
          "AI_TASK",
          "CONDITION",
          "APPROVAL",
          "TOOL_ACTION",
          "HUMAN_TASK",
          "DELAY",
          "NOTIFICATION"
        ]),
        sequence: z.number().int().positive()
      })
    )
    .min(1)
});

export type WorkflowDefinitionInput = z.infer<typeof workflowDefinitionSchema>;
