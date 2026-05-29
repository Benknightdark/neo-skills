# Sub-Agent Design Reference

This reference summarizes verified sub-agent design principles for developer CLIs and multi-agent workflows. Use it when designing a new agent role, deciding if delegation is appropriate, or reviewing an existing agent setup.

## Basis
- Agent Skills specification: a skill is a directory with `SKILL.md`; `name` and `description` drive discovery; detailed instructions should use progressive disclosure.
- Claude Code subagents: subagents run in isolated context windows with their own prompt, tool access, permissions, and optional model.
- Codex subagents: Codex can spawn specialized agents in parallel and collect results; custom agents live in standalone TOML files.
- GitHub Copilot CLI custom agents: custom agents are Markdown profiles that can be invoked manually, by prompt, or by inference.
- Antigravity CLI docs: background subagents are runtime workers, while custom reusable behavior is documented through skills/plugins. No stable standalone custom sub-agent manifest was verified for V1.
- ADK and LangGraph workflow docs: common patterns include routing, sequential pipelines, parallel fan-out/gather, evaluator-optimizer, and human-in-the-loop gates.

## Good Sub-Agent Jobs
- **Explorer**: read-only codebase mapping, dependency tracing, API discovery, log summarization.
- **Planner**: research and produce an implementation plan without editing.
- **Reviewer**: inspect diffs or files for correctness, security, tests, and regressions.
- **Executor**: perform bounded implementation from a clear spec.
- **Test runner**: run builds/tests and return failures with concise diagnostics.
- **Docs researcher**: verify current API behavior from official docs and return citations.
- **Migration auditor**: inspect many modules independently and return structured risk notes.

## Decision Rules
- Use sub-agents for context isolation, parallel independent work, specialized repeated roles, scoped permissions, or fresh review.
- Use the main conversation for small fixes, tightly sequential work, tasks needing repeated user clarification, or same-file edits.
- Use a skill instead of a sub-agent when the goal is reusable instructions inside the main context.
- Use a workflow/pipeline when order matters more than autonomy.

## Design Patterns

### Coordinator / Router
A main agent routes tasks to named specialists. Use when user requests fall into clear categories and each specialist has a distinct description.

Required decisions:
- Routing descriptions must be mutually distinguishable.
- The coordinator owns final synthesis unless the client uses handoff semantics.
- Specialists must return concise, structured outputs.

### Parallel Fan-Out / Gather
Run multiple independent agents at the same time and combine results. Use for module audits, multi-area research, PR review dimensions, or batch checks.

Required decisions:
- Each worker must have independent input.
- Avoid parallel writes to the same files.
- Cap concurrency when the client supports it.
- Ask workers to return fixed fields so synthesis is cheap.

### Sequential Pipeline
Run agents in a fixed order: explore -> plan -> implement -> test -> review. Use when each stage produces an artifact the next stage consumes.

Required decisions:
- Define the artifact passed between stages.
- Stop at human approval gates for product scope, destructive actions, migrations, and production changes.
- Do not pretend a later reviewer can recover missing context if the prior artifact is vague.

### Generator / Critic
One agent generates an artifact and another reviews it. Use for plans, docs, tests, migrations, prompts, and generated configuration.

Required decisions:
- Reviewer criteria must be explicit.
- The critic should cite evidence and avoid style-only feedback unless it hides risk.
- The parent agent decides whether to apply changes.

### Human-In-The-Loop
Use for irreversible operations, security changes, permissions, production deploys, and broad rewrites.

Required decisions:
- State exactly what requires user approval.
- Background agents should fail safely when they cannot ask for approval.
- The final output must distinguish completed work from pending approvals.

## Prompt Design Checklist
- Start with a single role sentence.
- Include "use when" behavior in the description, not only the body.
- State allowed scope and explicit non-goals.
- State expected inputs from the parent agent.
- State output shape: summary, findings, changed files, commands, risks, next steps.
- Include permission constraints in the agent config when the client supports them.
- Prefer read-only tools for planning, review, research, and audit agents.
- Include validation commands only when they are discoverable or user-provided.

## Anti-Patterns
- A catch-all "senior engineer" agent with all tools and no narrow trigger.
- Many overlapping specialists whose descriptions compete for the same prompts.
- Background agents that require frequent questions.
- Parallel agents editing the same files.
- Recursive delegation without a hard depth/concurrency limit.
- Agents that return full logs instead of summaries and cited evidence.
- Client-specific fields copied across tools without checking support.

## Review Checklist
- The agent can be named in one sentence.
- The description contains concrete trigger words users will actually type.
- Permissions are minimal for the job.
- The output contract is stable enough for the parent agent to synthesize.
- The agent states what it must not do.
- The design includes a validation or acceptance signal.
