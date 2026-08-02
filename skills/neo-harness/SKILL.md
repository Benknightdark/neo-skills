---
name: neo-harness
description: >
  Use this skill when you need to inspect a target project codebase and generate or improve a tailored,
  comprehensive AGENTS.md file (Harness Workflow Specification) that enforces strict AI agent
  harness rules, feedback sensors, execution SOP, orchestration topologies, and safety redlines.
  Supports non-interactive script execution via scripts/generate-agents-md.py.
  The generated AGENTS.md MUST NOT exceed 32 KiB in size.
license: MIT
metadata:
  version: "1.0.0"
  type: "unified-harness-generator"
---

# Unified Agent Harness Architect & Workflow Generator

This skill integrates three core Agent engineering domains (**Harness Assessment**, **Execution Protocol**, and **Orchestration Architecture**) to analyze a target project and generate a tailored, strict `AGENTS.md` file (Harness Workflow Specification).

## Core Principle

```text
Agent = Model (Reasoning & Generation) + Harness (Guides + Sensors + Gates + Topologies)
```

The generated `AGENTS.md` acts as the single source of truth governing all AI Agents operating in the project.

> [!IMPORTANT]
> **Size Constraint**: The generated `AGENTS.md` MUST NOT exceed 32 KiB (32,768 bytes) to prevent token pollution in session context windows.

---

## Quick Automation (Non-Interactive Generator Script)

To quickly analyze a repository and generate or preview an `AGENTS.md` file, run the non-interactive script:

```bash
# Preview generated content (dry-run)
python3 skills/neo-harness/scripts/generate-agents-md.py --target-dir /path/to/repo --dry-run

# Generate AGENTS.md directly in target repository
python3 skills/neo-harness/scripts/generate-agents-md.py --target-dir /path/to/repo --force
```

---

## Workflow SOP

### Step 1 — Perceive Target Repository
1. Inspect project root and structure manually or via `scripts/generate-agents-md.py`:
   - Configuration files: `package.json`, `pyproject.toml`, `Cargo.toml`, `go.mod`, `Makefile`, etc.
   - Build, lint, and test toolchains.
   - Existing guidelines: `AGENTS.md`, `CLAUDE.md`, `GEMINI.md`, README.
   - CI workflows: `.github/workflows/`, GitLab CI, etc.
2. Identify primary languages, test suites, and fast local feedback sensors.

### Step 2 — Reason & Synthesize Harness Rules
Load detailed reference knowledge as needed:
* **Harness Assessment & Sensors**: Read [references/harness-assessment.md](references/harness-assessment.md) to rate harnessability and define computational vs. inferential sensors.
* **Execution Protocol & SOP**: Read [references/execution-protocol.md](references/execution-protocol.md) to enforce the 5 Harness Laws, dual-loop SOP, zero-fake pass, and antipattern rules.
* **Orchestration Topologies**: Read [references/orchestration-patterns.md](references/orchestration-patterns.md) to select appropriate routing, chaining, or human-in-the-loop (HITL) gates.

### Step 3 — Generate `AGENTS.md`
Use `scripts/generate-agents-md.py` or [assets/AGENTS.md.template](assets/AGENTS.md.template) as the baseline template. Populate it with discovered project facts:
1. **Feedforward Guides**: Exact coding styles, module boundaries, and domain conventions.
2. **Deterministic Feedback Sensors**: Exact one-click test/lint/build commands.
3. **The 5 Agent Harness Laws**: Mandatory execution principles.
4. **Dual Closed-Loop Execution SOP**: Perceive ➔ Execute ➔ Sense ➔ Remediate.
5. **Forbidden Antipatterns**: Strict redlines (no silent exception swallowing, no test deletion, no hallucinated signatures).
6. **Human Decision Points & Safety Redlines**: Explicit boundaries requiring human approval.

### Step 4 — Verify Size & Quality Gate
1. Check the file size of the generated `AGENTS.md`:
   - Must be `<= 32,768 bytes`.
   - If over 32 KiB, prune redundant descriptions or move extended reference docs to separate files under `.agents/` or `docs/`.
2. Validate syntax and formatting.
