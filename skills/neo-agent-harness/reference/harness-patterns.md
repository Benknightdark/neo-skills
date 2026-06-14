# Agent Harness Patterns

Use this reference when designing a complete agent harness plan or roadmap.

## Core Model

An agent harness is the system around the model that guides, checks, and improves agent work.

```text
Agent = Model + Harness
```

For coding agents, the useful outer harness includes:

- Project instructions and task workflows.
- Skills, templates, examples, and architectural rules.
- Local verification commands and CI stages.
- Hooks, linters, static analysis, and security checks.
- AI review, architecture review, test-quality review, and human decision points.
- Production feedback such as logs, SLOs, user journeys, and support signals.

The goal is not full human removal. The goal is to reduce repeated review toil and direct human attention to product, risk, architecture, and tradeoff decisions.

## Feedforward Guides

Feedforward guides shape agent output before it acts.

Common examples:

- `AGENTS.md`, `CLAUDE.md`, `GEMINI.md`, Copilot instructions.
- Coding standards and style references.
- Architecture docs, ADRs, dependency rules, module maps.
- Task-specific skills and how-to guides.
- Service templates, scaffolds, fixtures, and examples.
- API docs, domain vocabulary, data contracts, and non-functional requirements.

Good feedforward guides are:

- Specific enough to prevent repeated mistakes.
- Short enough to be loaded often.
- Close to the code they govern.
- Kept in sync with tests, CI, and review expectations.

## Feedback Sensors

Feedback sensors observe work after the agent acts and provide correction signals.

Fast computational sensors:

- Typecheck.
- Unit tests and focused integration tests.
- Lint and format checks.
- Build checks.
- Static analysis.
- Dependency and secret scanning.
- Architecture boundary tests.

Slower or inferential sensors:

- AI code review.
- Architecture review.
- Test-quality review.
- Security reasoning review.
- Log and incident analysis.
- Behaviour or UX review against user journeys.

Prefer fast deterministic sensors during local development. Reserve inferential sensors for semantic judgment, riskier changes, and later review stages.

## Regulation Categories

### Maintainability Harness

Purpose: keep the codebase easy for humans and agents to understand and change.

Signals:

- Duplicate code.
- Excessive complexity.
- Naming or style drift.
- Missing or weak tests.
- Hard-to-review diffs.
- Over-engineered or brute-force fixes.

Useful controls:

- Format, lint, typecheck, tests.
- Complexity and dependency analysis.
- Code review skill.
- Refactoring guides and examples.

### Architecture Fitness Harness

Purpose: keep the system aligned with its intended structure and quality attributes.

Signals:

- Module boundary violations.
- API inconsistency.
- Performance regression.
- Observability gaps.
- Security or compliance drift.
- Deployment fragility.

Useful controls:

- Architecture docs and ADRs.
- Fitness functions and structural tests.
- Contract tests.
- Performance budgets.
- Logging and tracing standards.
- CI gates for risky paths.

### Behaviour Harness

Purpose: verify that the product does what stakeholders need.

Signals:

- Ambiguous requirements.
- Tests that only mirror implementation.
- Missing acceptance criteria.
- Broken user journeys.
- Manual test steps that are not captured.

Useful controls:

- User stories with acceptance criteria.
- Approved fixtures or golden examples where appropriate.
- End-to-end smoke tests for critical flows.
- Domain expert review for high-impact behaviour.
- Manual exploration checklist when automation is weak.

Do not assume AI-generated tests prove behaviour correctness. Behaviour harnesses need clear human intent and high-quality examples.

## Harnessability Assessment

Rate harnessability by evidence:

- **High**: clear structure, strong typing, reliable tests, CI, documented rules, repeatable build, clear ownership.
- **Medium**: some tests and rules exist, but coverage, architecture docs, or validation commands are incomplete.
- **Low**: weak tests, unclear structure, hidden conventions, inconsistent frameworks, no reliable local checks, or high technical debt.

Common improvement sequence:

1. Make setup, test, typecheck, and build commands explicit.
2. Document project rules in the agent instruction file.
3. Add fast computational checks before adding AI review.
4. Add architecture or domain-specific sensors for repeated failures.
5. Add inferential review for semantic quality and risk.
6. Feed recurring failures back into guides, tests, hooks, or skills.

## Maturity Roadmap

### Level 1: Basic Control

- Agent can find project rules.
- Local validation commands are documented.
- Secret and destructive-action rules are clear.
- Human reviews all significant changes.

### Level 2: Fast Self-Correction

- Agent runs focused tests, typecheck, lint, and build after changes.
- Failure messages are actionable.
- Repeated mistakes become guides or checks.
- CI repeats the local quality gates.

### Level 3: Architecture-Aware Development

- Agent understands module boundaries and service topology.
- Architecture fitness checks catch drift.
- Review process checks performance, observability, and deployability.
- Templates encode common project shapes.

### Level 4: Harness Improvement Loop

- Agent reviews CI, review comments, and incidents to propose harness improvements.
- Humans prioritize and approve harness changes.
- Low-risk improvements can be automated after repeated success.
- Harness quality itself is reviewed regularly.

### Level 5: Loop-Driven Development

- Harness is driven by scheduled automations, no longer relying on manual triggers.
- Multiple agents work in parallel across isolated worktrees.
- Generation and verification are handled by separate agents (maker/checker separation).
- Connectors let the loop directly operate issue trackers, PRs, CI, and notification channels.
- A state file persists progress across conversations; each run resumes from where the last one stopped.
- The human role shifts from in-the-loop line-by-line review to on-the-loop supervision: designing loops, sampling outputs, and evolving the harness.
- Comprehension debt, cognitive surrender, and unattended verification risks are explicitly assessed and managed.
- High-risk changes are forced out of the loop to await human decisions.

Prerequisites: Level 4 harness improvement loop is running stably, CI is reliable, and review processes are mature.
Note: Loop engineering is still an emerging practice. Start with low-risk, repetitive tasks.
