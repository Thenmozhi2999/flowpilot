# FlowPilot

FlowPilot is a full-stack MVP for an enterprise AI workflow automation platform.

The idea behind the project is simple:

- companies have many business processes that involve people, rules, approvals, and AI
- those processes are often manual, hard to track, and difficult to govern
- FlowPilot is a control layer where teams can create workflows, trigger runs, review approvals, and monitor operations in one place

This project was built as a realistic product foundation, not a toy demo.

## What This Project Does

FlowPilot helps teams manage AI-powered business workflows with visibility and control.

In the current MVP, users can:

- sign in as a workspace user
- view a dashboard of workflow activity
- create workflows
- edit workflow details
- open workflow detail pages
- trigger workflow runs
- approve or reject approval requests
- view governance and audit-related activity
- inspect agents and operations data stored in PostgreSQL

## Why I Built It

I built FlowPilot to show how an enterprise AI automation product can be structured in a real-world way.

Instead of building a small demo page, this project focuses on:

- modular architecture
- database-backed product flows
- workflow versioning concepts
- governance and approval handling
- operational visibility
- scalability for future enterprise features

## Tech Stack

- Next.js 15
- TypeScript
- Tailwind CSS 4
- Prisma ORM
- PostgreSQL
- Zod
- React Hook Form
- TanStack Query
- Radix UI

## Main Features Implemented

### 1. Platform UI

- Landing page
- Dashboard
- Workflows
- Workflow detail page
- Runs
- Agents
- Governance
- Settings

### 2. Workflow Management

- Create workflows
- Edit workflow metadata
- Open workflow detail pages
- Trigger workflow runs

### 3. Runtime and Governance

- Workflow runs stored in the database
- Step runs stored in the database
- Approval queue
- Approve / reject actions
- Audit event tracking

### 4. Workspace Access

- Login page using seeded workspace users
- Protected platform routes
- Sign out support

### 5. API Layer

- `GET /api/workflows`
- `GET /api/workflows/[workflowSlug]`
- `PATCH /api/workflows/[workflowSlug]`
- `POST /api/workflows/[workflowSlug]/runs`

## Project Structure

```text
src/
  app/           Next.js routes and layouts
  components/    Shared UI and app shell
  features/      Domain-focused modules and starter data
  lib/           Shared utilities, auth helpers, validation, db client
  server/        Repositories and server-side services
  styles/        Global styles
  types/         Shared TypeScript types
prisma/          Prisma schema and seed data
docs/            Architecture notes
```

## Database Design

The database is modeled for an enterprise workflow platform.

Core entities include:

- Users
- Organizations
- Workspaces
- Workspace members
- Workflows
- Workflow versions
- Workflow steps
- Workflow runs
- Step runs
- Approval requests
- Approval decisions
- Audit events
- Agents
- Integrations

This makes the MVP feel like a real product foundation rather than a static frontend.

## What We Built In Simple Words

If I explain this very simply:

- we built the frontend screens
- we connected them to a real PostgreSQL database
- we created the data structure for workflows, runs, approvals, and governance
- we made workflows editable
- we made runs triggerable
- we made approvals actionable
- we added a simple workspace login flow

So FlowPilot is no longer just a design or idea.
It is now a working MVP of the core product concept.

## What Is Finished

This project is finished as a strong MVP of the core concept.

That means:

- the concept works
- the architecture is real
- the database is real
- the app flows work
- the project is suitable for GitHub, portfolio use, and technical presentation

## What Is Not Finished Yet

This is not yet a fully complete enterprise SaaS product.

Future improvements would include:

- production authentication with passwords or SSO
- full RBAC and permission enforcement
- full workflow step editing
- visual workflow builder
- async background job execution engine
- real AI provider execution
- production integrations and secrets management
- notifications
- automated tests
- deployment and infrastructure setup

## Getting Started

1. Install dependencies

```bash
npm install
```

2. Create your environment file

```bash
copy .env.example .env
```

3. Generate Prisma client

```bash
npm run prisma:generate
```

4. Apply the database schema

```bash
npm run prisma:migrate
```

5. Seed the database

```bash
npm run db:seed
```

6. Start the app

```bash
npm run dev
```

## Demo Users

The MVP includes seeded workspace users for local testing:

- Mina Park
- Jordan Weiss
- Ava Shah

Use the login page to enter the app as one of these users.

## Architecture Notes

The project uses a modular monolith approach.

Why that matters:

- it keeps the app in one codebase for MVP speed
- it still separates responsibilities clearly
- it makes future growth into workers, auth services, and connectors easier

For more technical architecture details, see [docs/architecture.md](./docs/architecture.md).

## Summary

FlowPilot is a portfolio-quality MVP that demonstrates:

- product thinking
- system design
- enterprise data modeling
- full-stack development
- workflow orchestration concepts
- approval and governance patterns
- clean modular architecture

## Suggested GitHub Description

`FlowPilot is a full-stack MVP for an enterprise AI workflow automation platform built with Next.js, TypeScript, Prisma, and PostgreSQL.`

## Suggested LinkedIn Summary

Built `FlowPilot`, a full-stack MVP for an enterprise AI workflow automation platform. The project includes workflow creation and editing, database-backed runs, approval handling, governance views, protected workspace access, and a modular architecture using Next.js, TypeScript, Prisma, and PostgreSQL.
