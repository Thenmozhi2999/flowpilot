"use client";

import { useActionState, useEffect, useRef } from "react";
import { LoaderCircle, PlusCircle } from "lucide-react";
import { useFormStatus } from "react-dom";

import { createWorkflowAction, type CreateWorkflowActionState } from "@/app/(platform)/workflows/actions";

const initialState: CreateWorkflowActionState = {
  status: "idle"
};

const triggerOptions = [
  { value: "MANUAL", label: "Manual trigger" },
  { value: "SCHEDULE", label: "Scheduled trigger" },
  { value: "WEBHOOK", label: "Webhook trigger" },
  { value: "EVENT", label: "Event trigger" }
] as const;

export function CreateWorkflowForm() {
  const [state, formAction] = useActionState(createWorkflowAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.status === "success") {
      formRef.current?.reset();
    }
  }, [state.status]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="grid gap-4 rounded-[24px] border border-[var(--border)] bg-[rgba(255,255,255,0.03)] p-5"
    >
      <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <label className="grid gap-2 text-sm">
          <span className="font-medium text-[var(--muted-foreground)]">Workflow name</span>
          <input
            name="name"
            required
            placeholder="Example: Customer escalation routing"
            className="rounded-2xl border border-[var(--border)] bg-[rgba(8,14,24,0.88)] px-4 py-3 text-sm outline-none transition focus:border-[rgba(124,224,195,0.5)]"
          />
        </label>

        <label className="grid gap-2 text-sm">
          <span className="font-medium text-[var(--muted-foreground)]">Trigger type</span>
          <select
            name="triggerType"
            defaultValue="MANUAL"
            className="rounded-2xl border border-[var(--border)] bg-[rgba(8,14,24,0.88)] px-4 py-3 text-sm outline-none transition focus:border-[rgba(124,224,195,0.5)]"
          >
            {triggerOptions.map((option) => (
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
          placeholder="Describe the business process, stakeholders, and control requirements."
          className="rounded-2xl border border-[var(--border)] bg-[rgba(8,14,24,0.88)] px-4 py-3 text-sm outline-none transition focus:border-[rgba(124,224,195,0.5)]"
        />
      </label>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-[var(--muted)]">
          New workflows are created with an enterprise-safe starter sequence: context collection,
          AI analysis, approval gate, and notification.
        </p>
        <SubmitButton />
      </div>

      {state.message ? (
        <p
          className={
            state.status === "error"
              ? "text-sm text-[var(--danger)]"
              : "text-sm text-[var(--primary)]"
          }
        >
          {state.message}
        </p>
      ) : null}
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[var(--primary)] px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-[var(--primary-strong)] disabled:cursor-not-allowed disabled:opacity-70"
    >
      {pending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <PlusCircle className="h-4 w-4" />}
      {pending ? "Creating..." : "Create workflow"}
    </button>
  );
}
