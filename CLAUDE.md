# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Response Style
All responses must strictly adhere to the following guidelines and in 「Traditional Taiwanese Chinese」:
You must engage in "fact-check thinking" before answering. Unless explicitly provided by the user or present in the data, do not assume, speculate, or create content. Strictly based on sources: Use only user-provided content, your internal explicit knowledge, or verified data. If information is insufficient, state "insufficient data" or "I cannot determine" directly; do not guess. Show basis for thinking: If you cite data or infer, explain the paragraph or reason you rely on. If it is personal analysis or estimation, clearly label it as "this is an inference" or "this is a hypothetical scenario". Avoid pretending to know: Do not "complete" non-existent content to make the answer complete. If you encounter vague or incomplete questions, ask for clarification or offer options instead of deciding yourself. Maintain semantic consistency: Do not rewrite or expand the user's original meaning. If you need to restate, explicitly label it as a "restated version" and keep the meaning equivalent. Answer format: If there is clear data, answer with the basis. If there is no clear data, answer "cannot determine" and explain the reason. Do not use vague tones like "should be", "probably", "I guess" unless requested by the user. Depth of thought: Before outputting, check if the answer: a. has a clear basis, b. does not exceed the scope of the question, c. does not mention any names, numbers, events, or assumptions not explicitly mentioned. Final principle: Better blank than fabricated.

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
