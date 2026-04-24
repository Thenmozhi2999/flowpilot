# FlowPilot Architecture Plan

## Product Intent

FlowPilot is an enterprise AI workflow automation platform for teams that need governed, observable, human-in-the-loop execution across workflows, agents, approvals, and external systems.

The MVP is intentionally structured as a modular monolith. That gives us one deployable Next.js application today while preserving clean seams for future extraction into worker services, auth services, execution runtimes, and integration connectors.

## MVP Objectives

- Support multi-tenant organizations, workspaces, users, memberships, and role-based access.
- Model reusable workflows with versioned definitions, typed triggers, and ordered steps.
- Track workflow runs, step runs, logs, approvals, and audit events with compliance-friendly history.
- Expose starter operational surfaces for dashboarding, workflow catalog, run monitoring, agent registry, and governance.
- Keep domain logic isolated enough that background orchestration, auth, and integration services can be added without structural rewrites.

## System Shape

### Runtime

- Next.js App Router for server-first route composition and layout nesting.
- TypeScript strict mode for domain contracts and safer refactors.
- Tailwind CSS for design-system speed without sacrificing composition.
- Prisma + PostgreSQL as the persistence baseline for a relational, multi-tenant core.

### Application Style

- Modular monolith instead of layer-only MVC.
- Domain folders own their types, mock adapters, UI composition, and later services.
- Shared platform libraries handle database access, environment validation, utilities, and UI primitives.
- Server-side application services live under `src/server` so route handlers and pages do not absorb domain logic over time.

## Bounded Domains

### Identity and Access

- Organizations, workspaces, memberships, and roles.
- Reserved extension points for SSO, SCIM, fine-grained RBAC, and policy evaluation.

### Workflow Design

- Workflow definitions, versions, triggers, steps, and schemas.
- Prepared for a visual builder, publishing pipeline, and schema-driven editors.

### Execution and Orchestration

- Workflow runs, step runs, execution state transitions, and logs.
- Designed so queue workers and async orchestration can move out of the web tier later.

### Agents and Integrations

- AI agent registry, provider/model metadata, and future tool bindings.
- Integration inventory and connection state to support enterprise system automation.

### Governance and Compliance

- Approval requests, approval decisions, and audit events.
- Governance is treated as a first-class domain rather than an afterthought.

## Folder Structure

```text
src/
  app/
    (platform)/
      agents/
      dashboard/
      governance/
      runs/
      settings/
      workflows/
      layout.tsx
    layout.tsx
    page.tsx
  components/
    layout/
    ui/
  features/
    agents/
      data/
    dashboard/
      data/
    governance/
      data/
    runs/
      data/
    workflows/
      data/
  lib/
    db/
    env/
    utils/
    validation/
  server/
    repositories/
    services/
  styles/
    globals.css
  types/
prisma/
  schema.prisma
  seed.ts
docs/
  architecture.md
```

## Module Responsibilities

### `src/app`

- Route entry points, route groups, layouts, and server-rendered page composition.
- Minimal business logic. Pages should orchestrate data and render domain UI.

### `src/components`

- Shared UI primitives, layout scaffolding, navigation, tables, cards, and badges.
- Reusable across domains without owning business rules.

### `src/features`

- Domain-specific data contracts, seed-safe mock adapters, view models, and future forms/components.
- The goal is to keep business capabilities easy to find and evolve independently.

### `src/lib`

- Cross-cutting utilities such as Prisma client management, env validation, class merging, and schemas.
- Safe to import broadly across the codebase.

### `src/server`

- Server-only repositories and application services.
- Home for workflow publishing, execution dispatch, approval routing, audit logging, and connector orchestration as they are added.

## Dependency List

### Core Platform

- `next`
- `react`
- `react-dom`
- `typescript`

### Styling and UI Composition

- `tailwindcss`
- `@tailwindcss/postcss`
- `lucide-react`
- `class-variance-authority`
- `clsx`
- `tailwind-merge`
- `@radix-ui/react-avatar`
- `@radix-ui/react-dialog`
- `@radix-ui/react-dropdown-menu`
- `@radix-ui/react-label`
- `@radix-ui/react-select`
- `@radix-ui/react-slot`

### Forms, Data, and Validation

- `react-hook-form`
- `@hookform/resolvers`
- `@tanstack/react-query`
- `zod`

### Persistence and Tooling

- `@prisma/client`
- `prisma`
- `tsx`

### Operational Tooling

- `eslint`
- `eslint-config-next`
- `postcss`
- `autoprefixer`

## Data Model Strategy

Prisma is the source of truth for the MVP persistence model. The schema is designed around five principles:

1. Multi-tenancy is explicit.
2. Versioned workflow definitions are immutable once published.
3. Runtime execution is separated from workflow design.
4. Governance data is queryable and auditable.
5. Flexible JSON is used only for extension points such as trigger config, mappings, and payloads.

### Core Entities

- `Organization`, `Workspace`, `User`, and `WorkspaceMember` define tenancy and access boundaries.
- `Workflow`, `WorkflowVersion`, and `WorkflowStep` define authored automation.
- `WorkflowRun`, `StepRun`, and `StepLog` define execution history.
- `Agent` and `Integration` define AI and system automation inventory.
- `ApprovalRequest`, `ApprovalDecision`, and `AuditEvent` define governance.

## Delivery Phases After This Scaffold

1. Add auth and tenant-aware sessions.
2. Replace mock adapters with repository-backed read models.
3. Add route handlers and server actions for workflow CRUD and publishing.
4. Introduce queue-backed execution workers and durable step orchestration.
5. Add connector SDK boundaries, provider abstraction, and approval escalation policies.
