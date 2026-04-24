import {
  ApprovalStatus,
  AuditActorType,
  PrismaClient,
  RunStatus,
  StepRunStatus,
  StepType,
  TriggerType,
  WorkflowStatus
} from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const now = new Date();

  const [mina, jordan, ava] = await Promise.all([
    prisma.user.upsert({
      where: { email: "mina.park@flowpilot.ai" },
      update: {
        firstName: "Mina",
        lastName: "Park",
        jobTitle: "Platform AI Lead",
        avatarUrl: null
      },
      create: {
        email: "mina.park@flowpilot.ai",
        firstName: "Mina",
        lastName: "Park",
        jobTitle: "Platform AI Lead"
      }
    }),
    prisma.user.upsert({
      where: { email: "jordan.weiss@flowpilot.ai" },
      update: {
        firstName: "Jordan",
        lastName: "Weiss",
        jobTitle: "Operations Director",
        avatarUrl: null
      },
      create: {
        email: "jordan.weiss@flowpilot.ai",
        firstName: "Jordan",
        lastName: "Weiss",
        jobTitle: "Operations Director"
      }
    }),
    prisma.user.upsert({
      where: { email: "ava.shah@flowpilot.ai" },
      update: {
        firstName: "Ava",
        lastName: "Shah",
        jobTitle: "Security Program Manager",
        avatarUrl: null
      },
      create: {
        email: "ava.shah@flowpilot.ai",
        firstName: "Ava",
        lastName: "Shah",
        jobTitle: "Security Program Manager"
      }
    })
  ]);

  const organization = await prisma.organization.upsert({
    where: { slug: "flowpilot-labs" },
    update: {
      name: "FlowPilot Labs"
    },
    create: {
      name: "FlowPilot Labs",
      slug: "flowpilot-labs"
    }
  });

  await prisma.agent.deleteMany({
    where: {
      organizationId: organization.id
    }
  });

  await prisma.integration.deleteMany({
    where: {
      organizationId: organization.id
    }
  });

  await prisma.workspace.deleteMany({
    where: {
      organizationId: organization.id
    }
  });

  const workspace = await prisma.workspace.create({
    data: {
      organizationId: organization.id,
      name: "MVP Workspace",
      slug: "mvp-workspace",
      description: "Primary seeded workspace for FlowPilot MVP"
    }
  });

  await prisma.workspaceMember.createMany({
    data: [
      { workspaceId: workspace.id, userId: mina.id, role: "OWNER" },
      { workspaceId: workspace.id, userId: jordan.id, role: "ADMIN" },
      { workspaceId: workspace.id, userId: ava.id, role: "BUILDER" }
    ]
  });

  const policyAnalyst = await prisma.agent.create({
    data: {
      organizationId: organization.id,
      ownerUserId: mina.id,
      name: "Policy Analyst",
      slug: "policy-analyst",
      description: "Assesses policy, procurement, and exception requests.",
      provider: "OpenAI",
      model: "gpt-4.1",
      systemPrompt: "Assess risk, cite policy posture, and explain the recommendation.",
      capabilities: ["policy-review", "risk-summary", "structured-output"]
    }
  });

  const docClassifier = await prisma.agent.create({
    data: {
      organizationId: organization.id,
      ownerUserId: ava.id,
      name: "Document Classifier",
      slug: "document-classifier",
      description: "Classifies incoming intake documents and extracts critical metadata.",
      provider: "Anthropic",
      model: "claude-3-5-sonnet",
      systemPrompt: "Classify the document type and extract structured fields.",
      capabilities: ["classification", "extraction"]
    }
  });

  await prisma.integration.createMany({
    data: [
      {
        organizationId: organization.id,
        name: "ServiceNow",
        slug: "servicenow",
        provider: "servicenow",
        status: "CONNECTED",
        config: { region: "us-east-1" }
      },
      {
        organizationId: organization.id,
        name: "NetSuite",
        slug: "netsuite",
        provider: "netsuite",
        status: "CONNECTED",
        config: { environment: "sandbox" }
      }
    ]
  });

  const procurementWorkflow = await createWorkflow({
    workspaceId: workspace.id,
    name: "Procurement Intake Triage",
    description: `Routes procurement requests through ${policyAnalyst.name} before approval and notification.`,
    status: WorkflowStatus.ACTIVE,
    triggerType: TriggerType.WEBHOOK,
    versionNumber: 12,
    publishedAt: offsetMinutes(now, -180),
    changelog: "Added supplier sanctions signal and approval escalation.",
    steps: [
      step("collect_context", "Collect source context", StepType.TOOL_ACTION, "Load the procurement request and related vendor details."),
      step("ai_risk_assessment", "AI risk assessment", StepType.AI_TASK, "Score vendor and contract risk before approval."),
      step("approval_gate", "Director approval", StepType.APPROVAL, "Require approval for medium or high risk requests."),
      step("notify_requester", "Notify requester", StepType.NOTIFICATION, "Send the decision back to the intake source.")
    ]
  });

  const financeWorkflow = await createWorkflow({
    workspaceId: workspace.id,
    name: "Invoice Reconciliation",
    description: "Matches invoices against ERP data and flags exceptions for finance review.",
    status: WorkflowStatus.ACTIVE,
    triggerType: TriggerType.SCHEDULE,
    versionNumber: 8,
    publishedAt: offsetMinutes(now, -240),
    changelog: "Improved exception handling and duplicate detection.",
    steps: [
      step("collect_invoice_batch", "Collect invoice batch", StepType.TOOL_ACTION, "Load the invoice batch from the finance system."),
      step("classify_documents", "Classify supporting documents", StepType.AI_TASK, `Use ${docClassifier.name} for document classification.`),
      step("match_against_erp", "Match against ERP", StepType.CONDITION, "Validate invoice totals and vendor identities."),
      step("route_exceptions", "Route exceptions", StepType.HUMAN_TASK, "Route mismatches to finance operations."),
      step("post_results", "Post reconciliation result", StepType.NOTIFICATION, "Publish the result back to finance systems.")
    ]
  });

  await createWorkflow({
    workspaceId: workspace.id,
    name: "Vendor Onboarding Review",
    description: "Coordinates security, compliance, and procurement review for new vendors.",
    status: WorkflowStatus.DRAFT,
    triggerType: TriggerType.MANUAL,
    versionNumber: 3,
    publishedAt: null,
    changelog: "Draft workflow for security review expansion.",
    steps: [
      step("capture_vendor_profile", "Capture vendor profile", StepType.TOOL_ACTION, "Load vendor profile and submitted documentation."),
      step("security_screen", "Security screening", StepType.AI_TASK, "Summarize security risks and missing controls."),
      step("stakeholder_review", "Stakeholder review", StepType.APPROVAL, "Route to security and procurement stakeholders."),
      step("onboarding_decision", "Onboarding decision", StepType.NOTIFICATION, "Notify downstream onboarding systems.")
    ]
  });

  const procurementRun = await prisma.workflowRun.create({
    data: {
      workspaceId: workspace.id,
      workflowId: procurementWorkflow.id,
      workflowVersionId: procurementWorkflow.activeVersionId!,
      initiatedByUserId: jordan.id,
      status: RunStatus.WAITING_APPROVAL,
      correlationId: "run-procurement-19382",
      startedAt: offsetMinutes(now, -7),
      inputPayload: { requestId: "PR-8821", vendor: "Northwind Imports" }
    }
  });

  const procurementSteps = await prisma.workflowStep.findMany({
    where: {
      workflowVersionId: procurementWorkflow.activeVersionId!
    },
    orderBy: {
      sequence: "asc"
    }
  });

  await prisma.stepRun.createMany({
    data: [
      {
        workflowRunId: procurementRun.id,
        workflowStepId: procurementSteps[0].id,
        status: StepRunStatus.COMPLETED,
        startedAt: offsetMinutes(now, -7),
        completedAt: offsetMinutes(now, -7, 12),
        inputPayload: { requestId: "PR-8821" },
        outputPayload: { contextLoaded: true }
      },
      {
        workflowRunId: procurementRun.id,
        workflowStepId: procurementSteps[1].id,
        status: StepRunStatus.COMPLETED,
        startedAt: offsetMinutes(now, -6, 45),
        completedAt: offsetMinutes(now, -6, 21),
        outputPayload: { riskScore: 0.71, sanctionsFlag: true }
      },
      {
        workflowRunId: procurementRun.id,
        workflowStepId: procurementSteps[2].id,
        status: StepRunStatus.WAITING_INPUT,
        startedAt: offsetMinutes(now, -6, 10),
        inputPayload: { approver: "Operations Director" }
      }
    ]
  });

  const approvalRequest = await prisma.approvalRequest.create({
    data: {
      workspaceId: workspace.id,
      workflowRunId: procurementRun.id,
      requestedByUserId: jordan.id,
      stepKey: "approval_gate",
      title: "Vendor onboarding for Northwind Imports",
      description: "Sanctions mismatch flag requires director approval before the request can proceed.",
      status: ApprovalStatus.PENDING,
      dueAt: offsetMinutes(now, 30),
      metadata: { severity: "high", riskScore: 0.71 }
    }
  });

  const financeRun = await prisma.workflowRun.create({
    data: {
      workspaceId: workspace.id,
      workflowId: financeWorkflow.id,
      workflowVersionId: financeWorkflow.activeVersionId!,
      initiatedByUserId: mina.id,
      status: RunStatus.COMPLETED,
      correlationId: "run-finance-19376",
      startedAt: offsetMinutes(now, -31),
      completedAt: offsetMinutes(now, -29),
      inputPayload: { batchId: "INV-BATCH-418" },
      outputPayload: { matched: 184, exceptions: 2 }
    }
  });

  const financeSteps = await prisma.workflowStep.findMany({
    where: {
      workflowVersionId: financeWorkflow.activeVersionId!
    },
    orderBy: {
      sequence: "asc"
    }
  });

  await prisma.stepRun.createMany({
    data: financeSteps.map((step, index) => ({
      workflowRunId: financeRun.id,
      workflowStepId: step.id,
      status: StepRunStatus.COMPLETED,
      startedAt: offsetMinutes(now, -31 + index),
      completedAt: offsetMinutes(now, -31 + index, 20),
      outputPayload: { sequence: index + 1 }
    }))
  });

  const failedRun = await prisma.workflowRun.create({
    data: {
      workspaceId: workspace.id,
      workflowId: financeWorkflow.id,
      workflowVersionId: financeWorkflow.activeVersionId!,
      initiatedByUserId: mina.id,
      status: RunStatus.FAILED,
      correlationId: "run-finance-19380",
      startedAt: offsetMinutes(now, -18),
      failedAt: offsetMinutes(now, -15),
      errorSummary: "ERP endpoint timed out during reconciliation batch processing.",
      inputPayload: { batchId: "INV-BATCH-422" }
    }
  });

  await prisma.auditEvent.createMany({
    data: [
      {
        workspaceId: workspace.id,
        workflowRunId: financeRun.id,
        actorUserId: mina.id,
        actorType: AuditActorType.USER,
        action: "Workflow published",
        resourceType: "WorkflowVersion",
        resourceId: financeWorkflow.activeVersionId!,
        metadata: { workflow: financeWorkflow.name }
      },
      {
        workspaceId: workspace.id,
        workflowRunId: procurementRun.id,
        actorUserId: jordan.id,
        actorType: AuditActorType.USER,
        action: "Approval requested",
        resourceType: "ApprovalRequest",
        resourceId: approvalRequest.id,
        metadata: { workflow: procurementWorkflow.name }
      },
      {
        workspaceId: workspace.id,
        workflowRunId: failedRun.id,
        actorUserId: ava.id,
        actorType: AuditActorType.USER,
        action: "Run failed",
        resourceType: "WorkflowRun",
        resourceId: failedRun.id,
        metadata: { reason: "ERP timeout" }
      }
    ]
  });

  console.log(`Seeded workspace "${workspace.name}" with real FlowPilot MVP data.`);
}

async function createWorkflow(input: {
  workspaceId: string;
  name: string;
  description: string;
  status: WorkflowStatus;
  triggerType: TriggerType;
  versionNumber: number;
  publishedAt: Date | null;
  changelog: string;
  steps: Array<{
    key: string;
    name: string;
    type: StepType;
    description: string;
  }>;
}) {
  const workflow = await prisma.workflow.create({
    data: {
      workspaceId: input.workspaceId,
      name: input.name,
      slug: slugify(input.name),
      description: input.description,
      status: input.status
    }
  });

  const version = await prisma.workflowVersion.create({
    data: {
      workflowId: workflow.id,
      versionNumber: input.versionNumber,
      changelog: input.changelog,
      triggerType: input.triggerType,
      triggerConfig: { source: input.triggerType, cadence: input.triggerType === TriggerType.SCHEDULE ? "0 * * * *" : null },
      inputSchema: { type: "object", additionalProperties: true },
      outputSchema: { type: "object", additionalProperties: true },
      publishedAt: input.publishedAt,
      steps: {
        create: input.steps.map((stepItem, index) => ({
          key: stepItem.key,
          name: stepItem.name,
          description: stepItem.description,
          type: stepItem.type,
          sequence: index + 1,
          config: {},
          retryPolicy: { maxRetries: 2, strategy: "exponential-backoff" }
        }))
      }
    }
  });

  return prisma.workflow.update({
    where: { id: workflow.id },
    data: {
      activeVersionId: version.id
    }
  });
}

function step(key: string, name: string, type: StepType, description: string) {
  return { key, name, type, description };
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function offsetMinutes(date: Date, minutes: number, seconds = 0) {
  return new Date(date.getTime() + minutes * 60_000 + seconds * 1000);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
