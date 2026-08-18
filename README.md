# Neo Skills

[![test-on-develop](https://github.com/Benknightdark/neo-skills/actions/workflows/test-on-develop.yml/badge.svg)](https://github.com/Benknightdark/neo-skills/actions/workflows/test-on-develop.yml)
[![npm version](https://img.shields.io/npm/v/@moon791017/neo-skills.svg)](https://www.npmjs.com/package/@moon791017/neo-skills)

<p align="center">
  <img src="images/banner.png" alt="Neo Skills extension banner" width="100%">
</p>

**Neo Skills** 提供可安裝的 AI Agent 技能模組。每個技能以 `SKILL.md` 定義，涵蓋語言、框架、DevOps、Code Review、需求釐清、Agent 治理與文字潤飾。支援 Agent Skills 的工具可以在需要時載入完整規則，不必把所有規則放進單一系統提示詞。

專案包含：

- `skills/`：內建技能模組。
- `bin/install-skills.js`：將技能同步至 Antigravity CLI 的全域技能目錄。
- `bin/install-system-instructions.js`：將系統提示詞安裝至 Claude Code、Copilot CLI、Codex 或 Antigravity 的指導檔。
- `scripts/check-skills-syntax.py`：非互動式技能結構與語法驗證工具。

## 適合誰

- 希望 AI Agent 遵守專案規範的開發者。
- 希望將常用工作流程整理成可重複觸發技能的團隊。
- 使用 Antigravity CLI、Codex、Claude Code、Copilot CLI 或其他相容 Agent Skills 工具的人。
- 需要以知識庫、範本、腳本和驗證支援 AI 輔助開發的人。

## 核心設計

| 機制 | 說明 |
| :--- | :--- |
| 漸進式揭露 | Agent 啟動時只讀取 `name` 與 `description`；需要技能時才載入完整 `SKILL.md` 與 references。 |
| 觸發導向描述 | 每個 skill 的 `description` 都標明使用時機，供 Agent 判斷何時載入。 |
| 外部知識庫 | 詳細規則放在 `references/` 或 `reference/`，避免主技能檔過長。 |
| 可重用資源 | `assets/`、`templates/` 與 `scripts/` 提供可直接使用的資源。 |
| 可驗證結構 | 使用 `scripts/check-skills-syntax.py` 檢查技能名稱、frontmatter 與基本規格。 |

## 內建技能

| 類別 | Skill | 使用時機 |
| :--- | :--- | :--- |
| Agent 治理 | `neo-harness` | 自動掃描專案環境，產生或更新專案專用的 AGENTS.md，並整合 Harness 評估、Workflow 與編排架構。 |
| 資訊安全 | `neo-iso-27001` | 依 ISO/IEC 27001 進行 ISMS 範圍、風險、證據、差距分析、稽核準備與改善計畫。 |
| 隱私管理 | `neo-iso-27701` | 依 ISO/IEC 27701 進行 PIMS、PII 角色、處理活動、隱私風險、證據與稽核準備。 |
| DevOps | `neo-azure-pipelines` | 建立、審查、除錯或現代化 Azure Pipelines YAML，尤其是 .NET build、Azure App Service 或 IIS 部署。 |
| 需求釐清 | `neo-clarification` | 將模糊、情緒化、片段式或截圖式需求整理成規格、驗收條件和待釐清問題。 |
| Code Review | `neo-code-review` | 檢查程式碼、PR/diff、bug 風險、安全性、效能與可維護性。 |
| 系統架構 | `neo-clean-architecture` | 依 Clean Architecture 原則設計、實作、審查或重構系統，劃分層級並移除特定技術依賴。 |
| C# | `neo-csharp` | 撰寫、審查、除錯或現代化 C#/.NET 程式碼，包含語言版本、NRT、records、pattern matching 與 async。 |
| C# | `neo-csharp-interface-generator` | 從 C# class 產生或更新 interface，並安全建立、追加或替換 interface block。 |
| .NET | `neo-dotnet` | 處理一般 .NET 問題；當子領域尚未確定時，先偵測 SDK/project shape，再導向合適技能。 |
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
| 技能開發 | `generate-skill` | 建立、更新、審查或最佳化 Agent Skill，包括規格、觸發描述、延伸資源、評估資料和設計模式。 |
| 可觀測性 | `neo-opentelemetry` | 解釋 OpenTelemetry 概念、規劃或審查 Collector 架構與設定、處理維運排障、安全、零程式 instrumentation 及相容性遷移。 |
| queue | `neo-rabbitmq` | 以 RabbitMQ 4.3 為預設，提供語言中立的訊息拓撲、Broker 營運、監控排障與效能優化指引。 |
| 文字潤飾 | `neo-stop-slop` | 去除繁中或英文中的 AI 腔、贅詞和公式化句式，適用於文件、註解、commit message 和 PR 說明。 |
| PR 產出 | `neo-pr` | 詢問或自動偵測 Repository 的來源與目標分支，擷取變更，產生重點式且自然的 PR Title 和 PR Description。 |

`generate-skill` 位於 `.agents/skills/`，可由 Agent Skills CLI 探索和安裝；其餘技能位於 `skills/`。

## 安裝

### Antigravity CLI 全域安裝

將 `skills/` 下的技能同步至 `~/.gemini/antigravity-cli/skills`：

```bash
npx -y @moon791017/neo-skills@latest
```

本地開發：

```bash
node bin/install-skills.js
```

### Agent Skills CLI 安裝

在目前專案安裝全部技能：

```bash
npx skills add Benknightdark/neo-skills --skill --all -y
```

在全域安裝全部技能：

```bash
npx skills add Benknightdark/neo-skills --skill --all -g -y
```

## 系統提示詞安裝

Agent Skills 規格會同步技能目錄；`AGENTS.md`、`CLAUDE.md`、Copilot instructions 或 Antigravity `agents.md` 等指導檔需要另外安裝。

```bash
npx -p @moon791017/neo-skills install-system-instructions --instructions technical-co-founder
```

指定 Agent 和專案路徑：

```bash
npx -p @moon791017/neo-skills install-system-instructions \
  --ai-agent codex \
  --instructions technical-co-founder \
  --project-path .
```

更新已安裝的提示詞：

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
| `technical-co-founder` | 讓 Agent 依 Discovery、Planning、Building、Polish、Handoff 流程協助交付產品。 |
| `git-commit` | 要求 commit message 遵守 Conventional Commits 1.0.0，並使用使用者偏好的語言。 |
| `fact-check` | 要求 Agent 根據來源與證據回答，資料不足時明確說不能確定。 |
| `minimal-output` | 要求 Agent 在執行建置、部署、測試和格式化時使用最小輸出，保留 Context 空間。 |

## 常用情境

| 想做的事 | 安裝技能 | 可以對 Agent 這樣說 |
| :--- | :--- | :--- |
| 設計 Azure Pipelines CI/CD | `neo-azure-pipelines` | `幫我建立 .NET 專案的 Azure Pipelines CI` |
| 審查目前變更 | `neo-code-review` | `請 review 目前 git diff` |
| 釐清模糊需求 | `neo-clarification` | `把這些零散需求整理成規格與待確認問題` |
| 設計乾淨架構 | `neo-clean-architecture` | `幫我用 Clean Architecture 設計訂單管理模組` |
| 寫 TypeScript 型別 | `neo-typescript` | `幫我設計這個 API response 的泛型型別` |
| 建 Vue 3 元件 | `neo-vue` | `幫我重構這個 SFC，避免響應式踩坑` |
| 建立 Agent 治理 | `neo-harness` | `幫我針對這個專案評估並產生 AGENTS.md` |
| 建立 sub-agent | `neo-sub-agent` | `幫我新增一個 Codex code-reviewer sub agent` |
| 規劃 OpenTelemetry | `neo-opentelemetry` | `幫我審查 Collector 架構、韌性、安全與零程式觀測方案` |
| 設計 RabbitMQ 系統 | `neo-rabbitmq` | `請分析 RabbitMQ Queue 堆積、叢集營運與效能瓶頸` |
| 去掉 AI 腔 | `neo-stop-slop` | `把這段 PR 說明改得自然、直接一點` |
