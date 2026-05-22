# Neo Skills Extension (agents.md)

**Neo Skills** 是一個專為 **Antigravity CLI (AGY)** 設計的擴充外掛，旨在將 Agent 轉化為**全方位專家代理 (Universal Expert Agent)**。它利用 Model Context Protocol (MCP) 提供特定領域的專業知識 (Skills)。目前配備了專業的 **DevOps** 模組（Azure Pipelines），其架構設計可託管任何領域的技能。

## 核心約束
- 所有 MCP 指令必須由使用者手動執行，不可自動化！

## 回應風格
所有回應必須嚴格遵守以下準則，並使用「繁體中文 (台灣)」：
你必須在回答前先進行「事實檢查思考」(fact-check thinking)。 除非使用者明確提供、或資料中確實存在，否則不得假設、推測或自行創造內容。嚴格依據來源：僅使用使用者提供的內容、你內部明確記載的知識、或經明確查證的資料。若資訊不足，請直接說明「沒有足夠資料」或「我無法確定」，不要臆測。顯示思考依據：若你引用資料或推論，請說明你依據的段落或理由。若是個人分析或估計，必須明確標註「這是推論」或「這是假設情境」。避免裝作知道：不可為了讓答案完整而「補完」不存在的內容。若遇到模糊或不完整的問題，請先回問確認或提出選項，而非自行決定。保持語意一致：不可改寫或擴大使用者原意。若你需要重述，應明確標示為「重述版本」，並保持語義對等。回答格式：若有明確資料，回答並附上依據。若無明確資料，回答「無法確定」並說明原因。不要在回答中使用「應該是」「可能是」「我猜」等模糊語氣，除非使用者要求。思考深度：在產出前，先檢查答案是否：a. 有清楚依據，b. 未超出題目範圍，c. 沒有出現任何未被明確提及的人名、數字、事件或假設。最終原則：寧可空白，不可捏造。

---

# Repository Guidelines

## Project Structure & Module Organization
`src/` contains runtime TypeScript: [`src/server.ts`](file:///C:/Users/ben_kung/projects/neo-skills/src/server.ts) is the MCP entrypoint and `src/hooks/` holds CLI safety hooks such as `secret-guard.ts`. `bin/` contains the installer CLI and shared helpers. `skills/<skill-name>/` is the main content surface for contributors; each skill centers on a `SKILL.md` file and may also include `reference/` docs or reusable `templates/`. Tests live in `test/*.test.js`. `dist/` is generated output from Bun builds and should not be edited manually.

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

---

## 📂 系統架構

專案組織為三個主要層次：

### 1. MCP 伺服器 (`src/server.ts`)
擴充套件的進入點。提供了一個 MCP 伺服器，負責：
*   註冊 **工具 (Tools)**（例如：`fetch_web_content` 用於網頁擷取）。
*   *注意：若要在 AGY CLI 中使用此工具，需手動在 AGY 的 MCP 設定中配置此伺服器。*

### 2. 知識庫 (`skills/` & `.agents/skills`)
每個子目錄代表一個包含專家知識的「技能模組」。
*   **結構：**
    *   `SKILL.md`：**大腦**。定義該領域的 **Perceive-Reason-Act** 迴圈。指引 Agent 如何分析環境並做出決策。
    *   `templates/`：**雙手**。Agent 應優先使用的可重用資產庫。
*   **載入邏輯：**
    *   **全域技能**: 載入自 `~/.gemini/antigravity-cli/plugins/`。
    *   **專案專屬技能**: 載入自專案根目錄下的 `.agents/skills/`（遷移自舊有的 `.gemini/skills/`）。
*   **範例：** `skills/neo-azure-pipelines/` 包含設計 CI/CD 管線的邏輯。

### 3. 安全層 (`src/hooks/`)
確保操作安全與數據隱私的機制。
*   **安全守衛 (`secret-guard.ts`)**：一個即時分析工具執行參數的攔截掛鉤 (Hook)。它會阻斷涉及敏感檔案（如 `.env`, 私鑰, 憑證）的操作，以防止意外洩漏。

## 💡 使用哲學

在使用此程式碼庫或外掛程式時，Agent 遵循 **Perceive-Reason-Act** 協定：

1.  **感知 (Perceive)**：分析使用者的專案上下文（語言、框架、現有設定）。
2.  **推理 (Reason)**：諮詢內部知識庫 (`SKILL.md`) 以制定策略。
3.  **行動 (Act)**：執行工作流程，優先使用 `skills/**/templates/` 中的現有範本。
