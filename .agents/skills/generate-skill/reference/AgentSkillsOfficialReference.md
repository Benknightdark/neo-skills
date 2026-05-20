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

## Core Model

An Agent Skill is a directory that contains at least one `SKILL.md` file. It packages specialized knowledge, workflows, scripts, references, templates, and other resources so an agent can load them only when needed.

Typical structure:

```text
skill-name/
|-- SKILL.md
|-- scripts/
|-- references/
|-- assets/
`-- evals/
```

Progressive disclosure is the core design principle:

1. Discovery: At startup, the agent reads only `name` and `description`.
2. Activation: When the task matches the `description`, the agent loads the full `SKILL.md`.
3. Execution: The agent follows `SKILL.md` and loads supporting files from `scripts/`, `references/`, `assets/`, or other folders only when needed.

Keep `SKILL.md` concise. Move large reference material, templates, and deterministic logic into support directories, then clearly state when the agent should load each file.

## `SKILL.md` Specification

`SKILL.md` must start with YAML frontmatter, followed by Markdown content. Do not put a heading, file path note, or any other text before the opening frontmatter delimiter.

Required fields:

- `name`: 1-64 characters; lowercase letters, numbers, and hyphens only; must not start or end with a hyphen; must not contain consecutive hyphens; should match the parent directory name.
- `description`: 1-1024 characters; describes what the skill does and when to use it.

Optional fields:

- `license`: License name or reference to a bundled license file.
- `compatibility`: 1-500 characters; include only when the skill has specific environment requirements, such as a target client, system tools, network access, or runtime version.
- `metadata`: Arbitrary key-value mapping; choose keys that are unlikely to conflict with other clients.
- `allowed-tools`: Space-separated list of pre-approved tools; experimental, and support varies by client.

Minimal example:

```markdown
---
name: csv-analyzer
description: Use this skill when the user needs to inspect, clean, summarize, or chart CSV data files.
---

# CSV Analyzer

Use this workflow when working with CSV files...
```

The body has no strict format, but should usually include:

- Step-by-step workflow.
- Input and output examples.
- Common edge cases.
- Clear conditions for when to load a reference, asset, or script.

Quality bar:

- Keep the main `SKILL.md` under 500 lines and around 5000 tokens when possible.
- Put detailed material in `references/`, with each reference focused on one topic.
- Use paths relative to the skill root, such as `references/api-errors.md` and `scripts/validate.py`.
- Avoid multi-level reference chains. `SKILL.md` should directly point to the support files the agent may need.

## Directory Roles

`scripts/` is for reusable, fragile, or deterministic logic. Scripts should be self-contained or clearly document dependencies, and they should provide useful error messages.

`references/` is for detailed documentation the agent can load on demand, such as API specs, schemas, team conventions, review checklists, and error-handling guides.

`assets/` is for static resources used in outputs, such as document templates, configuration templates, images, and data files.

`evals/` can store skill-quality test material, such as `evals/evals.json` and input files used by tests.

## Skill Creation Best Practices

Start from real expertise instead of asking a model to invent a generic skill from general knowledge. Useful source material includes:

- Existing runbooks, internal documentation, and style guides.
- API specs, schemas, and configuration files.
- Code review comments, issues, and incident records.
- Version-control patches and real failure cases.
- Reusable patterns extracted from completed tasks.

Content selection principles:

- Add information the agent lacks, will likely guess incorrectly, or must follow exactly.
- Remove generic knowledge the agent already has.
- Design the skill as a coherent unit. If the scope is too narrow, one task may require too many skills; if it is too broad, the skill will not trigger precisely.
- Provide a default approach instead of a menu of equal options. Mention alternatives briefly only when there is a clear exception case.
- Prefer reusable procedures over one-off answers for a single example.
- Be more prescriptive when operations are fragile, order-dependent, or consistency-sensitive. Leave more judgment to the agent for flexible tasks.

Useful structures:

- Gotchas: facts the agent is likely to miss and cannot easily infer.
- Templates: inline templates or `assets/` templates for stable output formats.
- Checklists: explicit task lists for multi-step workflows.
- Validation loops: do the work, validate, fix failures, and repeat until validation passes.
- Plan-validate-execute: for batch or destructive operations, produce and validate a plan before execution.

## `description` Trigger Design

`description` is the main signal the agent uses to decide whether to load a skill. It must explain both capability and usage conditions.

Writing principles:

- Use imperative phrasing, such as `Use this skill when...`.
- Describe the user's intent, not only the skill's internal implementation.
- Explicitly list relevant contexts, including cases where the user does not name the domain directly.
- Keep it concise. The official limit is 1024 characters.
- Avoid being so broad that the skill false-triggers, or so narrow that it fails to trigger when needed.

Use trigger eval queries to test the description:

- Aim for about 20 realistic user prompts.
- Include 8-10 should-trigger prompts and 8-10 should-not-trigger prompts.
- Should-trigger prompts should vary formality, length, explicitness, typos, and abbreviations.
- Should-not-trigger prompts should cover adjacent tasks where this skill should not apply.
- Run each query multiple times. Three runs is a reasonable starting point.
- Use trigger rate to judge stability. A 0.5 threshold is a reasonable initial default.
- Use a train/validation split to avoid overfitting the description to known prompts. A 60% train and 40% validation split is a reasonable default.

Example query shape:

```json
[
  {
    "query": "Can you clean this customers.csv and tell me how many emails are missing?",
    "should_trigger": true
  },
  {
    "query": "What is the quickest way to convert JSON to YAML?",
    "should_trigger": false
  }
]
```

## Output Quality Evaluation

A skill should not only trigger; it should produce better results than the baseline without the skill. Start with a small eval set and expand it over time.

`evals/evals.json` can include:

- `skill_name`
- Each eval's `id`
- Realistic `prompt`
- Human-readable `expected_output`
- Optional `files`
- Later, verifiable `assertions`

Basic loop:

1. Run the same prompt with the skill and without the skill. When improving an existing skill, use the old skill as the baseline.
2. Save outputs, timing data, and grading results for each run.
3. Record at least token count and duration in timing data.
4. Make assertions observable, verifiable, and not overly brittle.
5. Save concrete evidence for grading. Do not record subjective PASS/FAIL without evidence.
6. Use scripts for mechanically verifiable checks, such as JSON validity, file existence, row counts, or image dimensions.
7. Aggregate `benchmark.json` to compare pass rate, time, tokens, and delta.
8. Have a human review actual outputs for usability, tone, design quality, and completeness that assertions may miss.
9. Revise the skill based on results. Remove uninformative assertions and tighten ambiguous or unstable instructions.

## Script Design Principles

Skills may use one-off commands directly in `SKILL.md`, or place reusable and complex logic in `scripts/`.

One-off commands:

- Pin versions when using tools such as `uvx`, `pipx`, `npx`, `bunx`, `deno run`, or `go run`.
- State runtime or tool requirements in `SKILL.md`; use `compatibility` when appropriate.
- Move complex or error-prone commands into bundled scripts.

Bundled scripts:

- Reference scripts by paths relative to the skill root, such as `scripts/validate.sh`.
- List available scripts and their purposes in `SKILL.md`.
- Commands inside instructions should also treat paths as relative to the skill root.
- Python can use PEP 723 inline dependencies; `uv run scripts/file.py` is the recommended execution pattern.
- Deno can use `npm:` or `jsr:` specifiers.
- Bun can pin package versions in import paths.
- Ruby can use `bundler/inline` to declare gems.

Agent-friendly script requirements:

- Do not use interactive prompts. Accept all input through flags, environment variables, or stdin.
- Provide concise `--help` output with purpose, flags, and examples.
- Error messages should explain what went wrong, what was expected, and what to try next.
- Prefer structured stdout, such as JSON, CSV, or TSV.
- Send progress messages, warnings, and diagnostics to stderr.
- Make scripts idempotent because agents may retry commands.
- Reject ambiguous input with a clear error instead of guessing.
- Provide `--dry-run` for destructive or stateful operations.
- Use meaningful exit codes and document them in `--help`.
- Use safe defaults for risky operations, such as requiring `--confirm` or `--force`.

## Client Implementation Notes

When implementing skills support in an agent client, use this lifecycle:

1. Discover skills: scan project-level and user-level skills. Cloud or sandboxed agents may need a registry, upload mechanism, or bundled assets instead.
2. Parse `SKILL.md`: extract YAML frontmatter and Markdown body.
3. Validate leniently: skip skills with missing descriptions or completely unparseable YAML; warn but load when the name is mismatched or too long to improve cross-client compatibility.
4. Store metadata: at minimum, store `name`, `description`, and `location`; derive the skill root from `location`.
5. Disclose the catalog: expose only `name`, `description`, and optionally `location` to the model.
6. Activate skills: let the model read `SKILL.md`, or use a dedicated activation tool that returns skill content.
7. Support user-explicit activation: slash commands, mentions, or autocomplete can let users choose a skill directly.
8. Use structured wrapping when using an activation tool: wrap skill content in identifiable tags and list supporting files, but do not eager-load all resources.
9. Handle permissions: allowlist skill directories so reading references or scripts does not interrupt the workflow repeatedly.
10. Manage context: protect activated skill content from compaction, and avoid injecting the same skill repeatedly.
11. Consider subagent delegation: complex skills can run in a dedicated subagent when the client supports it, returning a summary to the main conversation.

The Client Showcase indicates that multiple agent products support Agent Skills. When generating a skill, still confirm the target client's actual skill directory, tool permissions, activation mechanism, and support for experimental fields.

## Pre-Output Checklist

Before creating or updating a skill, verify:

- The first line of `SKILL.md` is `---`; there is no file path or heading before the frontmatter.
- `name` is valid and matches the skill directory.
- `description` says when to use the skill and stays under 1024 characters.
- Optional frontmatter fields are included only when useful.
- The main body is an executable workflow, not generic best-practice prose.
- `SKILL.md` stays concise; long material goes in `references/`.
- Every reference, asset, and script is linked from `SKILL.md` with a clear loading condition.
- File paths are relative to the skill root.
- Stable output tasks include a template or checklist.
- Error-prone tasks include a validation loop.
- Scripts are non-interactive, support `--help`, provide structured output, and return clear errors.
- Important or publicly shared skills include trigger evals and output-quality evals.
