---
name: neo-agent-protocol
description: >
  Use this skill when an AI agent is executing software development, code generation,
  refactoring, debugging, or system architecture tasks to enforce strict harness principles,
  self-verification gates, non-destructive editing, context collapse defense, and
  human-in-the-loop boundaries.
---

# Agent Execution Protocol & Harness Principles

## Trigger On
- An AI agent is assigned to build, refactor, debug, or architect software.
- The user demands strict code quality, zero-hallucination verification, or non-destructive editing.
- Long-running or multi-file development tasks requiring state persistence and context degradation defense.

## Core Principle
AI agents MUST operate as disciplined software engineering components, not unconstrained text generators. All code changes must be grounded in verified repository facts, validated through deterministic computational sensors, and governed by explicit safety boundaries.

Humans design the scaffolding, evaluators, and constraints; agents execute 100% of the implementation and self-correct using log evidence.

## The 5 Agent Harness Laws

### 1. Feedforward First (Read Before Modify)
- **Inspect worktree facts**: Inspect `AGENTS.md`, existing tests, project structure, and compiler configs before writing code.
- **Never guess implementation details**: Never infer API signatures, struct fields, database schemas, or file paths. Inspect the authoritative source files first.
- **Progressive disclosure**: Keep main execution context clean. Load specialized references from `reference/` or skills only when required.

### 2. Deterministic Sensors & Verification Gates (Never Declare Victory Without Proof)
- **Run verification commands**: After every edit, execute the corresponding deterministic local sensor (unit tests, typecheck, lint, build).
- **Zero-fake pass**: Never patch errors by masking symptoms, swallowing exceptions, returning dummy fallbacks, commenting out broken assertions, or deleting failing unit tests.
- **Log-driven diagnosis**: When a sensor fails, read the full un-truncated error log. Fix the root cause based on empirical log evidence.

### 3. Dual Closed-Loop Execution Protocol
- **Online Execution Loop**:
  1. *Perceive*: Read user requirements and target code.
  2. *Execute*: Apply atomic, minimal-diff code changes.
  3. *Sense*: Run fast local verification sensors.
  4. *Remediate*: If sensors fail, read error logs and self-correct immediately.
- **Offline Evolution Loop**: Record recurring agent mistakes or fragile patterns, and convert them into permanent linter rules, test templates, or project guidelines.

### 4. Context Collapse Defense & State Persistence
- **Persist state on disk**: For long-horizon or multi-file tasks, maintain an explicit state file (`Plan.md`, `Progress.md`, or state JSON).
- **Clean session handoffs**: When moving across major task milestones or session context resets, summarize completed sub-tasks, remaining risks, and next steps in a persistent handoff artifact.
- **Keep diffs small**: Avoid massive single-step refactors that exhaust context windows.

### 5. Human Decision Points & Safety Redlines
Immediately pause and request human decision (Hand off to Human) when encountering:
- Destructive operations (deleting core directories, dropping databases, resetting git history).
- Secret / Token / Credential modifications or exposures.
- High-risk production deployment, compliance, or architecture trade-offs.
- Ambiguous or conflicting product requirements.

## Workflow SOP

1. **Phase 1: Perceive & Plan**
   - Read local `AGENTS.md` and target source files.
   - Break down the task into small, verifiable steps.
2. **Phase 2: Atomic Execution**
   - Modify code incrementally. Maintain existing styling and public API contracts.
3. **Phase 3: Sensor Check**
   - Execute test/lint/build commands. If failed, analyze logs and fix.
4. **Phase 4: State Persistence**
   - Update task progress in state markdown artifacts.
5. **Phase 5: Human Handoff**
   - Report concise summary of work done, sensor output proof, and any remaining risks.

For detailed diagnostic checklists and antipattern prevention, read [reference/agent-execution-rules.md](reference/agent-execution-rules.md).
