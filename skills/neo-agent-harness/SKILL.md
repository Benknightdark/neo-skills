---
name: neo-agent-harness
description: >
  Use this skill when the user asks to improve AI-assisted development reliability,
  AGENTS.md, skills, tests, CI, hooks, review loops, or agent workflow governance.
  It designs feedforward guides, feedback sensors, verification gates, and human
  decision points from repository evidence.
---

# Agent Harness Architect Skill

## Trigger On
- The user asks to design or improve an AI agent development workflow.
- The user wants coding agents to be more reliable, safer, or easier to supervise.
- The user asks for AGENTS.md, skills, tests, CI, hooks, review loops, or project rules to be planned together.
- The task is about harness engineering, agent harnessability, feedback loops, or "humans on the loop".

## Core Principle
Treat agent-assisted development as a controlled engineering system. Do not only improve prompts; design the guides, sensors, verification steps, and human decision points that let agents work with higher confidence.

Use this skill for planning first. Do not modify files unless the user explicitly asks for implementation after the harness plan is clear.

## Perceive
1. Inspect the repository before asking questions:
   - Project instructions: `AGENTS.md`, `CLAUDE.md`, `GEMINI.md`, `.github/copilot-instructions.md`.
   - Skill or prompt assets: `skills/`, `.codex/skills/`, `.claude/skills/`, `.github/skills/`.
   - Validation commands: `package.json`, `pyproject.toml`, `Makefile`, CI workflow files, build scripts.
   - Safety and governance: hooks, linters, formatters, secret scanners, dependency scanners.
   - Existing documentation: README, architecture docs, ADRs, testing docs, contribution docs.
2. Identify the project type, primary languages, current test surface, CI status, and release/deploy path.
3. Separate discoverable repository facts from product or team preferences that require user confirmation.

## Reason
Analyze the project through these dimensions:

1. **Feedforward guides**
   - What should the agent know before editing?
   - Examples: project rules, coding style, architecture boundaries, task decomposition, testing strategy, domain vocabulary, safe file ownership.
2. **Feedback sensors**
   - What can check the agent's work after each change?
   - Examples: typecheck, tests, lint, build, static analysis, security checks, architecture tests, review agents, smoke tests.
3. **Control type**
   - Prefer computational controls for fast deterministic checks.
   - Use inferential controls for semantic review, architecture judgment, test-quality review, and risk assessment.
4. **Regulation category**
   - Maintainability: readability, duplication, complexity, style, testability.
   - Architecture fitness: module boundaries, performance, observability, security, deployability.
   - Behaviour: requirements, acceptance criteria, user journeys, fixtures, manual test points.
5. **Human role**
   - Move human effort from repeated low-level correction to high-value decisions: scope, product fit, risk acceptance, architectural tradeoffs, and harness evolution.

For detailed patterns and examples, read [reference/harness-patterns.md](reference/harness-patterns.md) when the task needs a full harness design, maturity model, or improvement roadmap. For the complete source article synthesis behind this skill, read [reference/agent-harness-engineering.md](reference/agent-harness-engineering.md) only when deeper conceptual background is needed.

## Act
Output in Traditional Chinese (Taiwan). Use this structure:

### 1. 現況盤點
- Summarize the repository facts discovered.
- Mention the current guides, sensors, and missing signals.

### 2. Harnessability 評估
- Rate the current harnessability as `低`, `中`, or `高`.
- Explain the rating with concrete evidence from the repository.

### 3. Feedforward Guides 設計
- List the rules, docs, skills, templates, or examples agents should receive before work starts.
- Mark each item as existing, needs update, or missing.

### 4. Feedback Sensors 設計
- List fast local checks, CI checks, security checks, semantic reviews, and manual checks.
- Distinguish computational from inferential checks.

### 5. 開發前改善清單
- Prioritize improvements as P0, P1, and P2.
- P0 must focus on changes that reduce repeated agent mistakes or prevent high-risk failures.

### 6. 人類決策點
- State where humans should stay on the loop.
- Identify decisions that should not be delegated fully to agents.

### 7. 驗證方式
- Provide exact commands or review steps when discoverable.
- If a command is unknown, state the missing fact instead of inventing one.

## Constraints
- Do not treat AI-generated tests as sufficient proof of behaviour correctness.
- Do not replace deterministic tooling with LLM judgment when a fast tool can check the same thing.
- Do not recommend broad automation before the project has reliable local validation commands.
- Do not propose fully autonomous changes for security, compliance, production deploys, or product-scope decisions.
- Keep the output actionable and tied to repository evidence.
