"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { LoaderCircle, Play, Save } from "lucide-react";

import {
  triggerWorkflowRunAction,
  updateWorkflowAction,
  type UpdateWorkflowActionState
} from "@/app/(platform)/workflows/actions";
import type { WorkflowDetail } from "@/types/workflows";

const initialState: UpdateWorkflowActionState = {
  status: "idle"
};

const triggerOptions = [
  { value: "MANUAL", label: "Manual" },
  { value: "SCHEDULE", label: "Scheduled" },
  { value: "WEBHOOK", label: "Webhook" },
  { value: "EVENT", label: "Event" }
] as const;

const statusOptions = [
  { value: "DRAFT", label: "Draft" },
  { value: "ACTIVE", label: "Active" },
  { value: "ARCHIVED", label: "Archived" }
] as const;

export function WorkflowDetailForm({ workflow }: { workflow: WorkflowDetail }) {
  const [state, formAction] = useActionState(updateWorkflowAction, initialState);
  const [isPending, startTransition] = useTransition();
  const [runMessage, setRunMessage] = useState<string | null>(null);

  useEffect(() => {
    if (state.status === "success") {
      setRunMessage(null);
    }
  }, [state.status]);

  return (
    <div className="space-y-6">
      <form action={formAction} className="grid gap-4 rounded-[24px] border border-[var(--border)] bg-[rgba(255,255,255,0.03)] p-5">
        <input type="hidden" name="workflowSlug" value={workflow.slug} />

        <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr_1fr]">
          <label className="grid gap-2 text-sm">
            <span className="font-medium text-[var(--muted-foreground)]">Workflow name</span>
            <input
              name="name"
              defaultValue={workflow.name}
              className="rounded-2xl border border-[var(--border)] bg-[rgba(8,14,24,0.88)] px-4 py-3 outline-none"
            />
          </label>

          <label className="grid gap-2 text-sm">
            <span className="font-medium text-[var(--muted-foreground)]">Trigger</span>
            <select
              name="triggerType"
              defaultValue={workflow.triggerType}
              className="rounded-2xl border border-[var(--border)] bg-[rgba(8,14,24,0.88)] px-4 py-3 outline-none"
            >
              {triggerOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2 text-sm">
            <span className="font-medium text-[var(--muted-foreground)]">Status</span>
            <select
              name="status"
              defaultValue={workflow.status === "Paused" ? "ARCHIVED" : workflow.status.toUpperCase()}
              className="rounded-2xl border border-[var(--border)] bg-[rgba(8,14,24,0.88)] px-4 py-3 outline-none"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="grid gap-2 text-sm">
          <span className="font-medium text-[var(--muted-foreground)]">Description</span>
          <textarea
            name="description"
            rows={4}
            defaultValue={workflow.description}
            className="rounded-2xl border border-[var(--border)] bg-[rgba(8,14,24,0.88)] px-4 py-3 outline-none"
          />
        </label>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-[var(--muted)]">
            Active version v{workflow.version} currently contains {workflow.stepCount} steps.
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() =>
                startTransition(async () => {
                  try {
                    await triggerWorkflowRunAction(workflow.slug);
                    setRunMessage("Run triggered successfully.");
                  } catch {
                    setRunMessage("Unable to trigger run.");
                  }
                })
              }
              className="inline-flex items-center gap-2 rounded-2xl border border-[var(--border)] px-4 py-3 text-sm font-medium"
            >
              {isPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
              Trigger run
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-2xl bg-[var(--primary)] px-4 py-3 text-sm font-semibold text-slate-950"
            >
              <Save className="h-4 w-4" />
              Save changes
            </button>
          </div>
        </div>

        {state.message ? (
          <p className={state.status === "error" ? "text-sm text-[var(--danger)]" : "text-sm text-[var(--primary)]"}>
            {state.message}
          </p>
        ) : null}

        {runMessage ? <p className="text-sm text-[var(--primary)]">{runMessage}</p> : null}
      </form>
    </div>
  );
}
