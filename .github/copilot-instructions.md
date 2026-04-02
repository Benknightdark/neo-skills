# Copilot Instructions for neo-skills

## Response Style
All responses must strictly adhere to the following guidelines and in 「Traditional Taiwanese Chinese」:
You must engage in "fact-check thinking" before answering. Unless explicitly provided by the user or present in the data, do not assume, speculate, or create content. Strictly based on sources: Use only user-provided content, your internal explicit knowledge, or verified data. If information is insufficient, state "insufficient data" or "I cannot determine" directly; do not guess. Show basis for thinking: If you cite data or infer, explain the paragraph or reason you rely on. If it is personal analysis or estimation, clearly label it as "this is an inference" or "this is a hypothetical scenario". Avoid pretending to know: Do not "complete" non-existent content to make the answer complete. If you encounter vague or incomplete questions, ask for clarification or offer options instead of deciding yourself. Maintain semantic consistency: Do not rewrite or expand the user's original meaning. If you need to restate, explicitly label it as a "restated version" and keep the meaning equivalent. Answer format: If there is clear data, answer with the basis. If there is no clear data, answer "cannot determine" and explain the reason. Do not use vague tones like "should be", "probably", "I guess" unless requested by the user. Depth of thought: Before outputting, check if the answer: a. has a clear basis, b. does not exceed the scope of the question, c. does not mention any names, numbers, events, or assumptions not explicitly mentioned. Final principle: Better blank than fabricated.

## Build & Development

```bash
# Install dependencies
npm install

# Build (clean → bundle server → bundle hooks → output to dist/)
bun run build

# Run TypeScript directly (no build required)
bun src/server.ts

# Type-check only (no emit)
bun run typecheck
```

There are no tests (`test` script exits 0 immediately). Build output goes to `dist/`.

The build has three steps defined in `package.json`:
- `build:server` — bundles `src/server.ts` → `dist/server.js`
- `build:hooks` — bundles `src/hooks/*.ts` → `dist/hooks/*.js`
- Both use `bun build ... --target node --minify`

## Architecture

**Neo Skills** is a Gemini CLI extension that exposes domain expertise over the Model Context Protocol (MCP). It is also an npm package with CLI installers that copy `skills/` into other AI agents' skill directories.

### Three layers

1. **MCP Server** (`src/server.ts`) — Single file that registers MCP `Tools` and `Prompts` using `@modelcontextprotocol/sdk`. Communicates over stdio (spawned by Gemini CLI). Currently provides the `fetch_web_content` tool (axios + cheerio).

2. **Knowledge Base** (`skills/`) — Each subdirectory is a Skill Module with:
   - `SKILL.md` — YAML front-matter (`name`, `description`, `category`) + **Perceive-Reason-Act** sections defining the agent's reasoning loop.
   - `reference/` — Optional reference docs (`patterns.md`, `anti-patterns.md`, `coding-style.md`).
   - `templates/` — Reusable code/config assets (e.g., Azure Pipelines YAML templates).

3. **Security Hook** (`src/hooks/secret-guard.ts`) — A `BeforeTool` hook registered in `hooks/hooks.json`. Intercepts **every** MCP tool call via stdin, scans raw input against sensitive file patterns (`.env`, `.pem`, `.key`, `id_rsa`, `credentials.json`, `launchSettings.json`, `secrets/`), returns `{decision: 'deny'}` if matched. Exit code 2 = fail-safe block (internal error).

### Extension wiring

`gemini-extension.json` ties everything together:
- Entry point: `dist/server.js` (MCP server)
- Context file: `GEMINI.md` (injected into every Gemini session)
- Hooks config: `hooks/hooks.json`

### Skill installer (npm package usage)

`bin/install-skills.js` (and agent-specific variants) use `bin/_utils.js` to copy `skills/` from the npm package into `~/.claude/skills` or `~/.copilot/skills`. New agents are added by registering in `AGENTS` in `_utils.js` and creating a corresponding `bin/install-{key}-skills.js`.

## Key Conventions

### Adding a new skill

1. Create `skills/neo-<name>/SKILL.md` with YAML front-matter and Perceive-Reason-Act sections.
2. Optionally add `skills/neo-<name>/templates/` and/or `skills/neo-<name>/reference/`.
3. If the skill needs an MCP Tool or Prompt, register it in `src/server.ts`, then rebuild.

### SKILL.md structure

```markdown
---
name: neo-skill-name
description: One-line description
category: devops | development | analysis | ...
---

## Perceive
(How to read the environment / gather context)

## Reason
(How to analyze and decide)

## Act
(What to output or execute)
```

### MCP tools: never auto-invoke

MCP tools **must never be called automatically** by the agent. The `run_git_commit` tool (and any future action tools) must only execute when the user explicitly requests it.

### Sensitive pattern obfuscation in secret-guard

The regex patterns in `src/hooks/secret-guard.ts` are string-concatenated at runtime to avoid being caught by static analysis on the hook itself. This is intentional — do not refactor them into plain string literals.

### Language

All user-facing commit messages, SKILL.md Act outputs, and prompt responses are written in **Traditional Chinese (Taiwan)**. Internal code comments may be in Chinese or English.

