# Repository Guidelines

## Project Structure & Module Organization
`src/` contains runtime TypeScript: [`src/server.ts`](/Users/ben/projects/neo-skills/src/server.ts) is the MCP entrypoint and `src/hooks/` holds CLI safety hooks such as `secret-guard.ts`. `bin/` contains the installer CLI and shared helpers. `skills/<skill-name>/` is the main content surface for contributors; each skill centers on a `SKILL.md` file and may also include `reference/` docs or reusable `templates/`. Tests live in `test/*.test.js`. `dist/` is generated output from Bun builds and should not be edited manually.

## Build, Test, and Development Commands
Use `npm install` for local setup; CI uses `npm ci`. Run `bun run dev` for quick local iteration against `src/server.ts`. Run `bun run build` to bundle the server and hooks into `dist/`, and `bun run typecheck` for strict TypeScript validation without emitting files. Use `npm test` to run the Node test suite (`node --test`). After a build, `npm start` smoke-tests the bundled server from `dist/server.js`.

## Coding Style & Naming Conventions
Use ESM modules, 2-space indentation, and keep code ASCII unless a file already uses localized text. Follow the existing style of the file you touch instead of reformatting unrelated lines; current JS utilities mostly use single quotes, while some TS sources use double quotes. Prefer `camelCase` for functions and variables, `UPPER_SNAKE_CASE` for shared constants, and `kebab-case` for skill directories and hook filenames (for example, `neo-python`, `secret-guard.ts`). Keep comments brief and only where intent is not obvious.

## Testing Guidelines
Add or update tests whenever you change installer behavior, filesystem layout, or hook logic. Place tests in `test/` and name them `*.test.js`. Mirror existing patterns: use temp directories, assert on exit codes, and verify real files were created. There is no published coverage threshold, but PR CI must pass both `npm test` and `bun run build`.

## Commit & Pull Request Guidelines
Follow the Conventional Commits pattern already used in history: `feat:`, `fix:`, `docs:`, `test(ci):`, `refactor(skills):`. Keep subjects short and imperative; add a scope when it clarifies impact. PRs against `develop` trigger the validation workflow, while merges to `main` feed the `release-please` release flow. In each PR, summarize behavior changes, list the commands you ran, and link the related issue when applicable.

## Security & Content Notes
Do not commit secrets, sample credentials, or unsafe prompts. If you change secret-detection behavior, review both `src/hooks/secret-guard.ts` and `hooks/hooks.json`. When updating a skill, keep its `SKILL.md`, references, and any user-facing docs aligned.
