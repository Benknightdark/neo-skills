# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Install dependencies
npm install

# Build (clean + bundle server + hooks)
bun run build

# Development mode (run TypeScript directly via Bun)
bun src/server.ts

# Type check only
bun run typecheck
```

There are no tests (`test` script exits 0). Build output goes to `dist/`.

## Architecture

**Neo Skills** is a Gemini CLI extension that exposes domain expertise via MCP (Model Context Protocol). It runs as a Node.js MCP server (`dist/server.js`) spawned by Gemini CLI, communicating over stdio.

### Four layers

1. **MCP Server** (`src/server.ts`) — Registers MCP Tools and Prompts. Tools execute actions (e.g., spawning a `git commit` subprocess). Prompts are dynamic templates injected into the chat session.

2. **Knowledge Base** (`skills/`) — Each subdirectory is a Skill Module:
   - `SKILL.md` — Defines the **Perceive-Reason-Act** loop: how to analyze context, reason about it, and act. This is the "brain" of the skill.
   - `templates/` — Reusable code/config assets the agent should prefer over generating from scratch.

3. **Action Registry** (`commands/neo/*.toml`) — TOML files that map user-invoked commands to system-prompt instructions. Each file has a `description` and a `prompt` field (with `{{args}}` placeholder). These link a user request to a specific Skill.

4. **Security Hook** (`src/hooks/secret-guard.ts`) — A `BeforeTool` hook that intercepts every MCP tool call. It scans arguments for sensitive file patterns (`.env`, `.pem`, `.key`, `credentials.json`, `id_rsa`, etc.) and returns `{decision: 'deny'}` if found. Exit code 2 is a fail-safe for internal errors.

### Extension wiring

`gemini-extension.json` declares the extension: entry point is `dist/server.js`, context file is `GEMINI.md`, and hooks are in `hooks/hooks.json`.

### Adding a new skill

1. Create `skills/<name>/SKILL.md` with YAML front-matter (`name`, `description`, `category`) and Perceive-Reason-Act sections.
2. Optionally add `skills/<name>/templates/` for reusable assets.
3. If the skill needs a user-invocable command, create `commands/neo/<name>.toml` with `description` and `prompt`.
4. Register the prompt (and any tools) in `src/server.ts`, then rebuild.

### Key constraint

MCP tools must **never** be called automatically by the agent. The `run_git_commit` tool in particular must only be invoked when the user explicitly requests it.
