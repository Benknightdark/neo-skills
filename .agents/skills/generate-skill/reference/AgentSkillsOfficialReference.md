# Agent Skills Official Reference

This document summarizes the official Agent Skills documentation for creating and reviewing `SKILL.md` files. Treat the official specification as the source of truth. Existing design-pattern references in this skill are supporting material for workflow design and pattern selection.

## Official Sources

- [Documentation index](https://agentskills.io/llms.txt)
- [Agent Skills Overview](https://agentskills.io/home)
- [Specification](https://agentskills.io/specification)
- [Quickstart](https://agentskills.io/skill-creation/quickstart)
- [Best practices](https://agentskills.io/skill-creation/best-practices)
- [Optimizing descriptions](https://agentskills.io/skill-creation/optimizing-descriptions)
- [Evaluating skills](https://agentskills.io/skill-creation/evaluating-skills)
- [Using scripts](https://agentskills.io/skill-creation/using-scripts)
- [Adding skills support](https://agentskills.io/client-implementation/adding-skills-support)
- [Client Showcase](https://agentskills.io/clients)

---

## Core Model

An Agent Skill is a directory that contains at least one `SKILL.md` file. It packages specialized knowledge, workflows, scripts, references, templates, and other resources so an agent can load them only when needed.

Typical structure:
```text
skill-name/
├── SKILL.md          # Required: frontmatter + instructions
├── scripts/          # Optional: executable code (non-interactive)
├── references/       # Optional: detailed docs loaded on demand
├── assets/           # Optional: templates and static files
└── evals/            # Optional: trigger and quality eval fixtures
```

Progressive disclosure is the core design principle:
1. **Discovery**: At startup, the agent reads only `name` and `description` (~100 tokens per skill) to minimize context footprint.
2. **Activation**: When the user task matches the `description`, the agent loads the full `SKILL.md` instructions.
3. **Execution**: The agent follows the workflow and loads supporting resources from `scripts/`, `references/`, or `assets/` relative to the skill root *only when needed*.

---

## `SKILL.md` Specification

`SKILL.md` must start with YAML frontmatter, followed by Markdown content. Do not put any heading, file path note, or comments before the opening frontmatter delimiter `---`.

### Required Frontmatter Fields:
- `name`: 1-64 characters; lowercase letters, numbers, and hyphens only; must not start or end with a hyphen; must not contain consecutive hyphens; must match the parent directory name.
- `description`: 1-1024 characters; describes what the skill does and when to use it. Must be optimized for trigger reliability.

### Optional Frontmatter Fields:
- `license`: License name or reference to a bundled license file.
- `compatibility`: 1-500 characters; states environment requirements (e.g., specific client, OS tools, network access, runtime version).
- `metadata`: Arbitrary string-key to string-value map for client-specific properties.
- `allowed-tools`: Space-separated list of pre-approved tools (experimental).

### Minimal Example:
```markdown
---
name: csv-analyzer
description: >
  Analyze CSV and tabular data files — compute summary statistics, add derived columns,
  generate charts, and clean messy data. Use this skill when the user has a CSV, TSV,
  or Excel file and wants to explore or visualize the data, even if they don't explicitly
  mention "CSV".
---

# CSV Analyzer

Follow this workflow to process tabular files...
```

---

## Skill Creation Best Practices

Start from real expertise instead of asking a model to invent a generic skill. Synthesize from completed tasks, style guides, schemas, issues, or review comments.

### Key Principles:
* **Spend Context Wisely**: Add what the agent lacks (internal rules, uncommon gotchas); omit general knowledge the agent already knows (e.g., do not explain what a PDF is or how HTTP works). Keep `SKILL.md` under 500 lines and 5000 tokens.
* **Match Specificity to Fragility**: Give the agent freedom for flexible tasks, but be highly prescriptive (instructional sequence) for fragile, stateful, or consistency-sensitive tasks (e.g., database migrations).
* **Provide Defaults, Not Menus**: Designate a single clear default tool/approach rather than listing multiple equal options which cause decision paralysis.
* **Gotchas Sections**: Focus on non-obvious, environment-specific traps that defy reasonable assumptions (e.g., "The users table uses soft deletes; always append `WHERE deleted_at IS NULL`").

---

## `description` Trigger Design & Optimization

The `description` carries the entire burden of triggering under progressive disclosure.

### Triggering Best Practices:
* **Imperative Phrasing**: Use "Use this skill when..." rather than "This skill does...".
* **Focus on User Intent**: Match against what users ask for, not how the skill is implemented.
* **Be Pushy**: Explicitly state relevant contexts even if the user doesn't name the domain directly.

### Trigger Evals System:
1. **Eval Set**: Create about 20 realistic user prompts (10 should_trigger, 10 should_not_trigger).
2. **Near-Misses**: Design tough negative prompts that share concept keywords but actually require a different skill (e.g., `"Update Excel budget formulas"` is a near-miss for a CSV data analysis skill).
3. **Trigger Rate**: Run each prompt 3 times (due to LLM nondeterminism) to calculate a trigger rate. Threshold of 0.5 is a standard pass line.
4. **Train/Val Split**: Split queries into **60% Train Set** and **40% Validation Set**. Optimize the description based on Train Set failures, then use the untouched Validation Set to verify generalization and prevent overfitting.

---

## Output Quality Evaluation (Evals)

A skill must produce better outputs than the baseline without it. Set up a structured testing suite in `evals/evals.json`.

### `evals.json` Structure:
```json
{
  "skill_name": "csv-analyzer",
  "evals": [
    {
      "id": 1,
      "prompt": "Inspect monthly sales data in data/sales_2025.csv, find top 3 months and plot them.",
      "expected_output": "A bar chart showing top 3 months by revenue, with labeled axes and caption.",
      "files": ["evals/files/sales_2025.csv"],
      "assertions": [
        "The output includes a bar chart image file",
        "The chart displays exactly 3 months",
        "Both axes are labeled"
      ]
    }
  ]
}
```

### Evaluation Loop:
1. **Workspace Separation**: Create clean test environments (e.g., `iteration-N/with_skill/` vs `iteration-N/without_skill/`).
2. **Timing & Token Metrics**: Capture token counts and duration in `timing.json` to calculate token costs.
3. **Assertions**: Write concrete, countable, and observable assertions (e.g., "Output is valid JSON") instead of subjective claims. Use scripts for mechanical validation.
4. **LLM & Human Grading**: Evaluate assertions with LLM judges (citing concrete evidence) and review holistic traits (design, tone) manually. Record review results in `feedback.json`.
5. **Delta Analysis**: Aggregate results in `benchmark.json`. Evaluate delta metrics: `delta.pass_rate` (improvement) vs `delta.tokens` and `delta.time_seconds` (overhead cost).
6. **Blind Comparison**: Show both with-skill and baseline outputs to an LLM judge without labels to rate formatting and polish objectively.

---

## Script Design Principles

 deterministic, complex, or fragile steps must be extracted into robust scripts in `scripts/`.

### One-Off Commands:
- Pin exact versions (e.g., `npx eslint@9.0.0 --fix .` or `uvx ruff@0.8.0 check .`) for reproducible execution.
- Declare requirements in `compatibility` frontmatter.

### Self-Contained Scripts:
Scripts should declare dependencies inline to run on a single command without separate installation manifests:
* **Python (PEP 723)**: Specify TOML dependency block inside script headers; run with `uv run scripts/file.py`.
  ```python
  # /// script
  # dependencies = [
  #   "beautifulsoup4>=4.12",
  # ]
  # ///
  ```
* **Deno / Bun**: Specify exact versions directly in import paths (e.g., `cheerio@1.0.0` or `npm:cheerio@1.0.0`).
* **Ruby**: Use inline Gemfiles via `bundler/inline`.

### Agentic Command Line Interface (CLI) Design Rules:
1. **Strictly Non-Interactive**: Accept all input via arguments, environment variables, or stdin. **Interactive prompts (TTY inputs, confirm dialogs) will hang the agent indefinitely.** Return clear parameter-missing error messages with usage examples on missing parameters.
2. **Self-Documenting `--help`**: Provide a concise `--help` output describing purpose, options, and usage examples. This is how the agent learns the script's interface.
3. **Stdout / Stderr Separation**: 
   * **`stdout`**: Send ONLY clean, structured, programmatically parseable data (JSON, CSV, TSV).
   * **`stderr`**: Send progress indicators, logs, diagnostics, and warnings.
4. **Idempotency**: Ensure operations can be retried safely without failing on duplicates (e.g., "Create if not exists").
5. **Dry-Run Flag**: Provide `--dry-run` to preview destructive or stateful database/filesystem writes.
6. **Robust Exit Codes**: Return specific, documented non-zero exit codes for different error categories so the agent can self-correct.
7. **Output Truncation Prevention**: Large stdout outputs will be truncated by agent harnesses. Default to a summary, paginate, or require writing to a file using an `--output` flag.

---

## Client Implementation Notes

For client implementors adding skills support to an agent:

1. **Discovery Scopes**: Scan project-level (`<project>/.agents/skills/`) and user-level (`~/.agents/skills/`) paths. Project-level overrides user-level in name collisions.
2. **Project Trust gates**: Project-level skills are untrusted code. Prompt the user to trust the project directory before loading repository-specific skills.
3. **Lenient Parser**: Skip skills on missing description or completely corrupt YAML; log warnings but still load skills on cosmetic issues (e.g., name mismatches or trailing whitespace) for cross-client compatibility.
4. **System Prompt or Dedicated Tool**: Inject available skills catalog (name + description + location) in system prompt or embed in an `activate_skill` tool schema.
5. **Explicit Activation**: Support slash-command or mention syntax (e.g., `/pdf-processing`) to let users activate skills manually.
6. **XML Tag Wrapping**: Wrap skill content in descriptive tags (e.g., `<skill_content name="pdf-processing">...<skill_resources>scripts/extract.py</file></skill_resources></skill_content>`).
7. **Permission Allowlisting**: Allowlist files within active skill directories so reading reference docs or executing scripts does not trigger security prompts repeatedly.
8. **Context Compaction Protection (Durable Guidance)**: 
   > [!IMPORTANT]
   > When the conversation context fills up and older messages are pruned or summarized, **always protect active skill instructions from compaction**. Skill instructions are durable guidelines; pruning them silently degrades agent behavior mid-session.
9. **Subagent Session**: If supported, run complex skills in a focused subagent, returning only a summary to the parent context.
