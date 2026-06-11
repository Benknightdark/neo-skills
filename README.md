# Neo Skills

[![test-on-develop](https://github.com/Benknightdark/neo-skills/actions/workflows/test-on-develop.yml/badge.svg)](https://github.com/Benknightdark/neo-skills/actions/workflows/test-on-develop.yml)
[![npm version](https://img.shields.io/npm/v/@moon791017/neo-skills.svg)](https://www.npmjs.com/package/@moon791017/neo-skills)

<p align="center">
  <img src="images/banner.png" alt="Neo Skills extension banner" width="100%">
</p>

**Neo Skills** 是一組給 AI Agent 使用的專家技能模組。它把語言、框架、DevOps、Code Review、需求釐清、Agent 治理與文字潤飾等工作流程包成可安裝的 `SKILL.md`，讓支援 Agent Skills 的工具能在需要時載入精準知識，而不是把所有規則塞進一段大型系統提示詞。

目前專案提供：

- `skills/`：23 個內建專家技能。
- `bin/install-skills.js`：同步技能到 Antigravity CLI 全域技能目錄。
- `bin/install-system-instructions.js`：把系統提示詞安裝到 Claude Code、Copilot CLI、Codex 或 Antigravity 的指導檔。
- `scripts/check-skills-syntax.py`：非互動式技能結構驗證工具。

## 適合誰

- 想讓 AI Agent 穩定遵守專案規範的開發者。
- 想把常用工作流程整理成可重複觸發技能的團隊。
- 使用 Antigravity CLI、Codex、Claude Code、Copilot CLI 或其他相容 Agent Skills 工具的人。
- 需要把 AI 輔助開發從「靠提示詞」提升到「有知識庫、範本、腳本、驗證」的人。

## 核心設計

| 機制 | 說明 |
| :--- | :--- |
| 漸進式揭露 | Agent 啟動時只讀 `name` 與 `description`；真正需要時才讀完整 `SKILL.md` 與 references。 |
| 觸發導向描述 | 每個 skill 的 `description` 都說明「何時使用」，提升自動觸發準確度。 |
| 外部知識庫 | 詳細規則放在 `references/` 或 `reference/`，避免主技能檔過長。 |
| 可重用資源 | 透過 `assets/`、`templates/` 與 `scripts/` 提供可落地的產出基礎。 |
| 可驗證結構 | 使用 `scripts/check-skills-syntax.py` 檢查技能名稱、frontmatter 與基本規格。 |

## 內建技能

| 類別 | Skill | 使用時機 |
| :--- | :--- | :--- |
| Agent 治理 | `neo-agent-harness` | 設計或改善 AI 輔助開發流程、AGENTS.md、技能、測試、CI、hooks、review loops 與人類決策點。 |
| DevOps | `neo-azure-pipelines` | 建立、審查、除錯或現代化 Azure Pipelines YAML，尤其是 .NET build、Azure App Service 或 IIS 部署。 |
| 需求釐清 | `neo-clarification` | 將模糊、情緒化、片段式、截圖式需求轉成規格、驗收條件或釐清問題。 |
| Code Review | `neo-code-review` | 進行程式碼審查、PR/diff review、bug 風險掃描、安全性、效能或可維護性檢查。 |
| 系統架構 | `neo-clean-architecture` | 設計、實作、審查或重構符合 Clean Architecture 原則的系統，劃分層級並排除特定技術依賴。 |
| C# | `neo-csharp` | 撰寫、審查、除錯或現代化 C#/.NET 程式碼，包含語言版本、NRT、records、pattern matching 與 async。 |
| C# | `neo-csharp-interface-generator` | 從 C# class 產生或更新 interface，並安全建立、追加或替換 interface block。 |
| .NET | `neo-dotnet` | 廣泛 .NET 問題或尚未確定子領域時，先偵測 SDK/project shape 並導向合適技能。 |
| .NET | `neo-dotnet-minimal-apis` | 建置或審查 ASP.NET Core Minimal APIs、route groups、endpoint filters、typed results 或 OpenAPI metadata。 |
| .NET | `neo-dotnet-webapi` | 建置或審查 controller-based ASP.NET Core Web API、Problem Details、API versioning 與 DTO。 |
| .NET | `neo-dotnet-mvc` | 建置或審查 ASP.NET Core MVC、Razor views、ViewModels、Tag Helpers、View Components 與 SSR workflows。 |
| .NET | `neo-dotnet-tag-helper` | 設計、實作或審查 ASP.NET Core custom Tag Helpers、TagBuilder、強型別屬性與 `ProcessAsync`。 |
| .NET | `neo-dotnet-ef-core` | 處理 EF Core models、DbContext、migrations、LINQ、change tracking、provider 與 data access review。 |
| JavaScript | `neo-javascript` | 撰寫、審查、除錯或現代化 browser、Node.js 或 pure JS 程式碼與 ESM/CJS、async、DOM/runtime 問題。 |
| Python | `neo-python` | 撰寫、審查、除錯或架構 Python 3.10+ 程式碼、型別、dataclasses、async、測試與可維護性。 |
| Python | `neo-python-manager` | 判斷 uv、Poetry、venv 或 pip，安裝/更新依賴、同步虛擬環境或診斷 lock file。 |
| Rust | `neo-rust` | 撰寫、重構、除錯或審查 Rust、Cargo、ownership、borrowing、lifetime、Result/Option、unsafe 或效能問題。 |
| Swift | `neo-swift` | 撰寫、審查、除錯或現代化 Swift、structured concurrency、memory safety、protocols/generics 與 SwiftUI integration。 |
| SwiftUI | `neo-swift-ui` | 建置、重構或審查 SwiftUI apps/views、NavigationStack、Observation/state flow、previews、accessibility 與效能。 |
| TypeScript | `neo-typescript` | 處理 TypeScript、tsconfig、strict mode、泛型、conditional/mapped/template literal types、ESM/CJS 與 runtime boundaries。 |
| Vue | `neo-vue` | 建置、除錯、重構或審查 Vue 3、SFC、Composition API、Pinia、Vue Router、Vite 與 Vue+TypeScript。 |
| Agent 架構 | `neo-sub-agent` | 設計、建立、審查或轉換 sub-agent、custom agent、worker/reviewer/planner agent 或 multi-agent workflow。 |
| 文字潤飾 | `neo-stop-slop` | 去除繁中或英文中的 AI 腔、贅詞、公式化句式，支援文件、註解、commit message 與 PR 說明。 |

## 安裝

### Antigravity CLI 全域安裝

同步所有技能到 `~/.gemini/antigravity-cli/skills`：

```bash
npx -y @moon791017/neo-skills@latest
```

本地開發時可直接執行：

```bash
node bin/install-skills.js
```

### Agent Skills CLI 安裝

安裝全部技能：

```bash
npx skills add Benknightdark/neo-skills --all
```

安裝到全域：

```bash
npx skills add Benknightdark/neo-skills --all -g
```

只安裝指定技能：

```bash
npx skills add Benknightdark/neo-skills --skill neo-typescript,neo-vue
```

## 系統提示詞安裝

Agent Skills 規格同步的是技能目錄；`AGENTS.md`、`CLAUDE.md`、Copilot instructions 或 Antigravity `agents.md` 這類指導檔需要另外安裝。

```bash
npx -p @moon791017/neo-skills install-system-instructions --instructions technical-co-founder
```

指定 Agent 與專案路徑：

```bash
npx -p @moon791017/neo-skills install-system-instructions \
  --ai-agent codex \
  --instructions technical-co-founder \
  --project-path .
```

更新已安裝過的同一段提示詞：

```bash
npx -p @moon791017/neo-skills install-system-instructions \
  --ai-agent codex \
  --instructions git-commit \
  --project-path . \
  --replace-all
```

### 支援的 Agent 指導檔

| Agent | 全域路徑 | 專案路徑 |
| :--- | :--- | :--- |
| Claude Code | `~/.claude/CLAUDE.md` | `<project>/CLAUDE.md` |
| Copilot CLI | `~/.copilot/copilot-instructions.md` | `<project>/.github/copilot-instructions.md` |
| Codex | `~/.codex/AGENTS.md` | `<project>/AGENTS.md` |
| Antigravity CLI | `~/.gemini/antigravity-cli/instructions.md` | `<project>/agents.md` |

### 支援的系統提示詞

| Key | 用途 |
| :--- | :--- |
| `technical-co-founder` | 讓 Agent 以 Discovery、Planning、Building、Polish、Handoff 流程協助打造可交付產品。 |
| `git-commit` | 要求 commit message 遵守 Conventional Commits 1.0.0，並使用使用者偏好的語言。 |
| `fact-check` | 要求 Agent 根據來源與證據回答，資料不足時明確說不能確定。 |

## 常用情境

| 想做的事 | 安裝技能 | 可以對 Agent 這樣說 |
| :--- | :--- | :--- |
| 設計 Azure Pipelines CI/CD | `neo-azure-pipelines` | `幫我建立 .NET 專案的 Azure Pipelines CI` |
| 審查目前變更 | `neo-code-review` | `請 review 目前 git diff` |
| 釐清模糊需求 | `neo-clarification` | `把這些零散需求整理成規格與待確認問題` |
| 設計乾淨架構 | `neo-clean-architecture` | `幫我用 Clean Architecture 設計訂單管理模組` |
| 寫 TypeScript 型別 | `neo-typescript` | `幫我設計這個 API response 的泛型型別` |
| 建 Vue 3 元件 | `neo-vue` | `幫我重構這個 SFC，避免響應式踩坑` |
| 改善 AI 開發流程 | `neo-agent-harness` | `評估這個專案讓 coding agent 協作的可靠度` |
| 建立 sub-agent | `neo-sub-agent` | `幫我新增一個 Codex code-reviewer sub agent` |
| 去掉 AI 腔 | `neo-stop-slop` | `把這段 PR 說明改得自然、直接一點` |

## 開發

```bash
npm install
npm test
python3 scripts/check-skills-syntax.py --dir skills
```

## 維護技能

新增或修改 skill 時，請同步檢查：

1. `SKILL.md` 第一行是 `---`。
2. frontmatter 有 `name` 與觸發導向的 `description`。
3. `name` 與資料夾名稱一致。
4. 深度內容放進 `references/` 或 `reference/`，範本放進 `assets/` 或 `templates/`，可執行流程放進 `scripts/`。
5. 腳本必須非互動式，stdout 只輸出可解析資料，診斷輸出到 stderr。
6. README 的技能清單與實際 `skills/` 內容一致。
7. 執行 `python3 scripts/check-skills-syntax.py --dir skills` 與 `npm test`。

## License

MIT
