# Client Adapter Reference

Use this reference before writing any client-specific sub-agent/custom-agent file. If a user asks for a field not listed here and it is not discoverable in the local project, state that the data is insufficient.

## Neutral Spec
Use this shape as the internal planning format before rendering files:

```json
{
  "clients": ["claude", "codex", "copilot", "agy"],
  "scope": "project",
  "name": "code-reviewer",
  "description": "Reviews changed code for correctness, security, and missing tests.",
  "instructions": "You are a code reviewer...",
  "tools": ["Read", "Grep", "Glob"],
  "model": null,
  "output_contract": "Return findings first, with file paths and concrete evidence.",
  "validation": ["npm test"]
}
```

Use lowercase kebab-case for `name` to preserve cross-client compatibility.

## Claude Code

Verified format:
- Project path: `.claude/agents/<name>.md`
- User path: `~/.claude/agents/<name>.md`
- File type: Markdown with YAML frontmatter and Markdown body.
- Required frontmatter: `name`, `description`.
- Useful optional fields: `tools`, `disallowedTools`, `model`, `permissionMode`, `maxTurns`, `skills`, `mcpServers`, `memory`, `background`, `effort`, `isolation`, `color`.
- Body: system prompt for the subagent.

Default choices:
- Reviewer, planner, explorer: read-only tools.
- Implementation worker: only include edit/shell tools when requested.
- If model is unspecified, omit it so the subagent inherits the session default.

Example:

```markdown
---
name: code-reviewer
description: Reviews code for correctness, security, and missing tests.
tools: ["Read", "Grep", "Glob"]
---

You are a code reviewer...
```

## Codex

Verified format:
- Project path: `.codex/agents/<name>.toml`
- User path: `~/.codex/agents/<name>.toml`
- File type: standalone TOML custom agent file.
- Required fields: `name`, `description`, `developer_instructions`.
- Useful optional fields: `nickname_candidates`, `model`, `model_reasoning_effort`, `sandbox_mode`, `mcp_servers`, `skills.config`.
- Related global settings live under `[agents]` in Codex config, such as `max_threads`, `max_depth`, and `job_max_runtime_seconds`.

Default choices:
- Explorer/reviewer/planner: `sandbox_mode = "read-only"` when the user wants a non-mutating agent.
- Implementation worker: do not set `sandbox_mode` unless the user explicitly wants a different sandbox from the parent session.
- Keep `max_depth` at the default unless the user explicitly needs recursive delegation.

Example:

```toml
name = "code-reviewer"
description = "Reviews code for correctness, security, and missing tests."
sandbox_mode = "read-only"
developer_instructions = "Review code like an owner..."
```

## GitHub Copilot CLI

Verified format:
- Project path: `.github/agents/<name>.agent.md` or `.github/agents/<name>.md`
- User path: `~/.copilot/agents/<name>.agent.md`
- File type: Markdown with YAML frontmatter and Markdown body.
- Required frontmatter: `description`.
- Useful optional fields: `name`, `target`, `tools`, `model`, `disable-model-invocation`, `user-invocable`, `mcp-servers`, `metadata`.
- Tool aliases include `read`, `edit`, `search`, `execute`, `agent`, `web`, and `todo`; unsupported names are ignored by Copilot.

Default choices:
- Use `.agent.md` for clarity.
- Include `name` for human display, but rely on filename for the agent ID.
- Use `tools: ["read", "search"]` for reviewers and researchers unless edits are needed.

Example:

```markdown
---
name: code-reviewer
description: Reviews changed code for correctness, security, and missing tests.
tools: ["read", "search"]
---

You are a code reviewer...
```

## Antigravity CLI

Verified facts:
- Antigravity CLI supports runtime background subagents and an `/agents` panel.
- Antigravity CLI supports workspace skills in `.agents/skills/`.
- Antigravity CLI docs describe skills/plugins as the reusable customization path.

Insufficient data:
- No stable standalone custom sub-agent manifest format was verified for V1.

V1 adapter:
- Project path: `.agents/skills/<name>/SKILL.md`
- User/global path: `~/.gemini/antigravity-cli/skills/<name>/SKILL.md`
- Output type: Agent Skill delegation blueprint that instructs Antigravity to spawn or use a background specialist when appropriate.

Default choices:
- Label the output as a skill/delegation blueprint.
- Include clear conditions for when to delegate to a background subagent.
- Avoid claiming this creates a native Antigravity custom subagent manifest.

Example:

```markdown
---
name: code-reviewer
description: Reviews changed code in Antigravity CLI by delegating review work to a focused background agent when appropriate.
---

# Code Reviewer

Use this skill to run a focused code-review delegation...
```
