# Neo Skills Extension (agents.md)

**Neo Skills** 是一個專為 **Antigravity CLI (AGY)** 設計的擴充外掛，旨在將 Agent 轉化為**全方位專家代理 (Universal Expert Agent)**。它利用 Model Context Protocol (MCP) 提供特定領域的專業知識 (Skills)。目前配備了專業的 **DevOps**（Azure Pipelines）與 **Frontend/Backend** 多語系（.NET, Python, Swift, TypeScript/JavaScript, Rust, Vue）等領域的模組，其架構設計可託管任何領域的技能。

## 回應風格
- 使用「繁體中文 (台灣)」
- commit訊息必須是「繁體中文 (台灣)」

---

# Repository Guidelines

## Project Structure & Module Organization
`src/` contains runtime TypeScript: [`src/server.ts`](file:///Users/ben/Projects/neo-skills/src/server.ts) is the MCP entrypoint and `src/hooks/` holds CLI safety hooks such as `secret-guard.ts`. `bin/` contains the installer CLI and shared helpers. `skills/<skill-name>/` is the main content surface for contributors; each skill centers on a `SKILL.md` file and may also include `reference/` or `references/` docs, `assets/` templates, or reusable helper `scripts/`. Tests live in `test/*.test.js`. `dist/` is generated output from Bun builds and should not be edited manually.

## Build, Test, and Development Commands
Use `npm install` for local setup; CI uses `npm ci`. Run `bun run dev` for quick local iteration against `src/server.ts`. Run `bun run build` to bundle the server and hooks into `dist/`, and `bun run typecheck` for strict TypeScript validation without emitting files. Use `npm test` to run the Node test suite (`node --test`). After a build, `npm start` smoke-tests the bundled server from `dist/server.js`.

## Coding Style & Naming Conventions
Use ESM modules, 2-space indentation, and keep code ASCII unless a file already uses localized text. Follow the existing style of the file you touch instead of reformatting unrelated lines; current JS utilities mostly use single quotes, while some TS sources use double quotes. Prefer `camelCase` for functions and variables, `UPPER_SNAKE_CASE` for shared constants, and `kebab-case` for skill directories and hook filenames (for example, `neo-python`, `secret-guard.ts`). Keep comments brief and only where intent is not obvious.

### AI Helper Script Specifications (scripts/)
When writing scripts under `skills/<skill-name>/scripts/` or global helper scripts:
1.  **STRICTLY Non-Interactive**: Accept inputs only via command-line arguments (using `argparse`), environment variables, or stdin. **Do NOT use interactive prompts (like `input()` or TTY confirmation dialogs), as they will hang the agent indefinitely.**
2.  **Stdout & Stderr Separation**: Write diagnostic messages, progress logs, and errors to `stderr`. Write only clean, programmatically parseable data (such as JSON or CSV) to `stdout`.
3.  **Inline Dependencies (PEP 723)**: Python scripts must include an inline PEP 723 dependency block (e.g., `# /// script ...`) to enable self-contained runs via `uv run`.

## Testing Guidelines
Add or update tests whenever you change installer behavior, filesystem layout, or hook logic. Place tests in `test/` and name them `*.test.js`. Mirror existing patterns: use temp directories, assert on exit codes, and verify real files were created. There is no published coverage threshold, but PR CI must pass both `npm test` and `bun run build`.

## Commit & Pull Request Guidelines
Follow the Conventional Commits pattern already used in history: `feat:`, `fix:`, `docs:`, `test(ci):`, `refactor(skills):`. Keep subjects short and imperative; add a scope when it clarifies impact. PRs against `develop` trigger the validation workflow, while merges to `main` feed the `release-please` release flow. In each PR, summarize behavior changes, list the commands you ran, and link the related issue when applicable.

## Security & Content Notes
Do not commit secrets, sample credentials, or unsafe prompts. If you change secret-detection behavior, review both `src/hooks/secret-guard.ts` and `hooks/hooks.json`. When updating a skill, keep its `SKILL.md`, references, and any user-facing docs aligned.

---

## 📂 系統架構

專案組織為三個主要層次：

### 1. MCP 伺服器 (`src/server.ts`)
擴充套件的進入點。提供了一個 MCP 伺服器，負責：
*   註冊 **工具 (Tools)**（例如：`fetch_web_content` 用於網頁擷取）。
*   *注意：若要在 AGY CLI 中使用此工具，需手動在 AGY 的 MCP 設定中配置此伺服器。*

### 2. 知識庫 (`skills/` & `.agents/skills`)
每個子目錄代表一個包含專家知識的「技能模組」。
*   **結構與漸進式揭露 (Progressive Disclosure) 規範：**
    *   `SKILL.md`：**大腦**。定義該領域的 **Perceive-Reason-Act** 迴圈。**其第一行必須是 YAML frontmatter 分界符 `---`**，並包含正確的 `name`（必須與其父目錄名稱完全一致以利 Discovery 自動偵測）與 trigger-focused 的 `description`。
    *   `references/`：**深度知識**。將詳細的檢核表、分析框架或長文檔放於此處，僅在 Reason 階段依需求由 Agent 動態載入。
    *   `assets/`：**輸出範本**。提供標準的 Markdown 結構範本，降低 Token 開銷。
    *   `evals/`：**評估集**。必須包含 `evals.json` 與 `eval_queries.json` 用於檢測技能的觸發率與輸出品質。
*   **載入邏輯：**
    *   **全域技能**: 載入自 `~/.gemini/antigravity-cli/plugins/`。
    *   **專案專屬技能**: 載入自專案根目錄下的 `.agents/skills/`（遷移自舊有的 `.gemini/skills/`）。
*   **範例：** `skills/neo-azure-pipelines/` 包含設計 CI/CD 管線的邏輯，`skills/neo-typescript/` 包含 TypeScript 強型別與互通性最佳實踐。

### 3. 安全層 (`src/hooks/`)
確保操作安全與數據隱私的機制。
*   **安全守衛 (`secret-guard.ts`)**：一個即時分析工具執行參數的攔截掛鉤 (Hook)。它會阻斷涉及敏感檔案（如 `.env`, 私鑰, 憑證）的操作，以防止意外洩漏。

## 💡 使用哲學

在使用此程式碼庫或外掛程式時，Agent 遵循 **Perceive-Reason-Act** 協定：

1.  **感知 (Perceive)**：分析使用者的專案上下文（語言、框架、現有設定）。
2.  **推理 (Reason)**：諮詢內部知識庫 (`SKILL.md`) 以制定策略。
3.  **行動 (Act)**：執行工作流程，優先使用 `skills/**/templates/` 中的現有範本。
