---
name: skill-name-kebab-case
description: >
  Use this skill when the user wants to [intended task / user intent].
  It triggers when they mention [keywords / concepts / adjacent tasks],
  even if they do not explicitly say "[core domain]".
license: MIT
compatibility: Requires [system dependencies or specific agent client, e.g., Python 3.14+ and uv]
metadata:
  author: author-name
  version: "1.0.0"
---

# Skill Name

Briefly summarize the target task, scope, and expected outcome of this skill.

## Gotchas
* **Gotcha 1**: [Describe a highly specific, non-obvious, environment-dependent pitfall that models are likely to hit, rather than generic advice].
* **Gotcha 2**: [e.g., database soft-deletes, multi-system field name mapping, or silent health checks].

## Workflow Checklist
Progress:
- [ ] Step 1: Parse and Inventory (Load `references/schema.md` or execute `scripts/parse.py`).
- [ ] Step 2: Formulate Plan (Create a plan JSON and validate using `scripts/validate.py`).
- [ ] Step 3: Execute Task (Apply changes with idempotent actions).
- [ ] Step 4: Verify Results (Run tests and confirm output formatting).

## Detailed Guidelines

### Step 1 — Parse & Inventory
Instruct the agent how to analyze the environment:
1. Load `references/guidelines.md` for specific style rules.
2. Verify input arguments. If ambiguous, reject immediately with clear options.

### Step 2 — Validation Loop
Instruct the agent to execute a deterministic loop to prevent broken output:
1. Perform the edit.
2. Validate using a validation script:
   ```bash
   python3 scripts/validate.py "$TARGET_FILE"
   ```
3. If validation fails:
   - Carefully inspect error codes and diagnostics in `stderr`.
   - Revise target code/text.
   - Run validation again.
4. Do NOT proceed to the next step until validation completely passes.

### Step 3 — Plan-Validate-Execute
For batch, risky, or destructive actions:
1. Extract data structures into a planning file `plan.json`.
2. Compare plan fields against the schema.
3. Validate:
   ```bash
   python3 scripts/compare_schema.py plan.json references/schema.json
   ```
4. If valid, proceed with `--confirm` or `--force`.

## Output Templates

When presenting results, format exactly like this template:

```markdown
# [Task Title]

## Executive Summary
[Brief description of changes made]

## Applied Checklist
- [x] Change 1
- [x] Change 2

## Recommendations / Next Steps
1. [First actionable step]
2. [Second actionable step]
```
