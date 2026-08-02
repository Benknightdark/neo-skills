# Harness Assessment & Sensor Design

This reference provides harness evaluation, sensor classification, and maturity rating guidance for neo-harness.

## Core Model

An Agent Harness is the complete external control system wrapped around an LLM model:

```text
Agent = Model + Harness
```

A robust harness fulfills two primary objectives:
1. **Increase First-Time Accuracy**: Provide clear feedforward guidance before code generation.
2. **Enable Autonomous Remediation**: Provide fast, deterministic feedback sensors so the agent self-corrects before human review.

---

## 1. Feedforward Guides (Before Action)

Feedforward controls shape agent output before any edits occur:
- Project instruction files (`AGENTS.md`, `CLAUDE.md`, `GEMINI.md`).
- Coding style references, architecture documentation, module boundary maps.
- Task breakdown templates and domain vocabulary glossaries.

---

## 2. Feedback Sensors (After Action)

Feedback sensors evaluate generated code and provide correction signals.

### Computational Sensors (Fast & Deterministic)
Prefer computational sensors whenever available:
- **Type Checking**: `tsc`, `mypy`, `pyright`, `go vet`, `cargo check`.
- **Unit & Integration Tests**: `npm test`, `pytest`, `cargo test`, `go test`.
- **Linters & Formatters**: `eslint`, `flake8`, `ruff`, `prettier`.
- **Security & Dependency Scanners**: `npm audit`, `trivy`, secret scanners.

### Inferential Sensors (Semantic & Judgment)
Use inferential sensors when deterministic tools are insufficient:
- AI Code Reviews & LLM Judges.
- Architecture fitness reviews.
- Acceptance criteria verification.

---

## 3. Harnessability Maturity Model

Rate target repository harnessability as **Low**, **Medium**, or **High**:

| Rating | Characteristics | Required Actions |
| :--- | :--- | :--- |
| **Low (低)** | Missing test suites, no single-command test runner, ambiguous coding style, unconfigured linters. | Establish baseline test runners and lint commands before delegating multi-file agent tasks. |
| **Medium (中)** | Tests exist but run slowly; linters present but not enforced in CI; partial `AGENTS.md`. | Define exact fast-sensor commands in `AGENTS.md`; break tasks into atomic verifiable steps. |
| **High (高)** | Single-command fast test/lint/build runners; strict CI enforcement; clear module boundaries and explicit `AGENTS.md`. | Fully leverage autonomous closed-loop execution and scheduled/loop automations. |

---

## 4. Loop Primitives & State Persistence

When workflows extend beyond a single session:
1. **Automations**: Scheduled triggers for periodic maintenance or exploration.
2. **Worktrees**: Git worktree isolation for parallel agent executions.
3. **Skills**: Modularized domain knowledge in `SKILL.md`.
4. **Connectors**: External tools (CI, issue trackers, messaging).
5. **Sub-agents**: Separation of generation (Maker) and verification (Checker).
6. **State**: Disk-persisted progress tracking (`Plan.md`, `Progress.md`).
