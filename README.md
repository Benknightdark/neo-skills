# Neo Skills

[![test-on-develop](https://github.com/Benknightdark/neo-skills/actions/workflows/test-on-develop.yml/badge.svg)](https://github.com/Benknightdark/neo-skills/actions/workflows/test-on-develop.yml)
[![npm version](https://img.shields.io/npm/v/@moon791017/neo-skills.svg)](https://www.npmjs.com/package/@moon791017/neo-skills)

<p align="center">
  <img src="images/banner.png" alt="leak-hunter repository secret scanner banner" width="100%">
</p>

**Neo Skills** 是一個專為現代 **AI Agent** 設計的**企業級全方位能力擴充套件**。本專案基於 Model Context Protocol (MCP) 與標準化代理治理架構 (Agent Harness)，為 AI 代理安裝高可靠、可插拔的「專家技能模組 (Skills)」，使其不僅僅是個聊天機器人，而是能深度融入本地開發與運維環境，轉化為具備「感知-推理-行動 (Perceive-Reason-Act)」自主決策能力的**跨領域專家**。

無論是複雜的 DevOps 自動化（Azure Pipelines）、代碼品質安全審查、需求還原與分析釐清，或是多語系的現代化開發，Neo Skills 都能透過模組化的外部知識庫、AI 專用非互動式腳本與品質評估集 (Evals)，讓 AI 代理在安全、受控的 Harness 治理下，成為您最強大的全能數位助手。

## 🚀 核心願景

本專案作為 AI Agent 的「大腦皮層 (Cortex)」，旨在打造一個**全能型 Agent 框架**，透過以下機制提升 AI 的專業度：

1. **領域專精 (Skills)**：可擴充的專家知識庫 (`SKILL.md`)。目前已內建 DevOps 模組，未來將持續擴增更多領域。
2. **標準化範本 (Templates)**：提供預先驗證的自動化腳本與模板，確保產出的一致性與可靠性。
3. **架構思維**：強制執行「感知 (Perceive) -> 推理 (Reason) -> 行動 (Act)」的決策迴圈，避免 AI 產生幻覺，確保解決方案的精準度。

## ✨ 目前內建技能 (Built-in Skills)

### 1. Azure Pipelines 架構師

自動化設計與生成符合微軟最佳實踐的 CI/CD 流程。

* **CI 自動化**：針對 .NET 專案生成建置管線，整合單元測試與構件發佈。
* **CD 自動化**：
  * **Azure App Service**：部署至Azure App Service。
  * **IIS On-Premises**：部署至地端 IIS 伺服器，包含備份與復原機制。

### 2. Code Review 專家

* **智能審查**：針對程式碼變更進行多面向 (正確性、安全性、效能、可讀性) 的深度審查。

### 3. .NET / C# 開發專家

* **C# 現代語法專家 (`skills/neo-csharp`)**：跨版本 C# 專家 (10-14+)，專注於現代化語法、強型別與高效能開發模式。
* **.NET 核心路由 (`skills/neo-dotnet`)**：環境偵測與統一入口，自動將任務委派給最合適的子領域專家。
* **.NET Minimal APIs 專家 (`skills/neo-dotnet-minimal-apis`)**：專注於高效能微服務、路由群組與 Typed Results。
* **.NET Web API 專家 (`skills/neo-dotnet-webapi`)**：提供控制器模式下的架構設計、Problem Details 與異常處理指引。
* **.NET MVC 專家 (`skills/neo-dotnet-mvc`)**：處理伺服器端渲染 (SSR)、視圖模型與標籤協助程式的最佳實踐。
* **EF Core 專家 (`skills/neo-dotnet-ef-core`)**：專注於資料庫建模、移轉管理與 Linq 查詢優化。
* **.NET Tag Helper 專家 (`skills/neo-dotnet-tag-helper`)**：開發 ASP.NET Core 自定義 Tag Helper 的專家指引，專注於純 C# 實作與異步渲染最佳實踐。
* **Interface 生成器**：針對 C# Class 自動生成符合規範的 Interface，並支援智慧檔案覆蓋功能。

### 4. Python 開發與環境管理專家

* **Python 3.10+ 專家 (`skills/neo-python`)**：專注於 Python 3.10 至 3.14 的現代語法特性、型別安全與非同步開發。
* **環境管理專家 (`skills/neo-python-manager`)**：智慧偵測與管理 Python 專案環境，支援 uv, Poetry, venv/pip 並提供自動化安裝建議。

### 5. Swift 開發專家

* **Swift 5.0+ 專家 (`skills/neo-swift`)**：支援從基礎語法到 Swift 6 的現代開發模式，涵蓋 SwiftUI、Structured Concurrency、記憶體安全以及高效能 App 開發指引。
* **SwiftUI 專家 (`skills/neo-swift-ui`)**：支援 iOS 16.0+ 與 Swift 5.0+ 的現代開發模式，專注於 NavigationStack、Observation 框架、資料流架構及高效能視圖設計。

### 6. JavaScript 開發專家

* **JavaScript 現代語法專家 (`skills/neo-javascript`)**：跨版本 JavaScript 專家 (ES6 - ES2025+)，專注於現代化語法、模組系統與高效能開發模式。

### 7. TypeScript 開發專家

* **TypeScript 現代語法與型別安全 (`skills/neo-typescript`)**：專注於極致的型別安全、高可維護性與進階元程式設計（Meta-programming）。
  * **型別系統防線**：涵蓋進階條件型別 (Conditional Types)、映射型別 (Mapped Types) 與樣板字面值型別。
  * **互通性與配置最佳化**：深入調校 `tsconfig.json` 編譯選項，並徹底解決複雜的 ESM/CJS 互通性陷阱與執行期崩潰問題。
  * **泛型約束設計**：引導設計高靈活度的泛型與變量 (Variance) 處理。

### 8. Vue 開發專家

* **Vue 3 現代開發專家 (`skills/neo-vue`)**：專注於 Vue 3 Composition API (`<script setup>`)、Pinia 狀態管理與 Vue Router 4。嚴格遵循官方 Style Guide 與最佳實踐，並提供反模式 (Anti-Patterns) 的避坑指引。

### 9. Rust 開發專家

* **Rust 專家 (`skills/neo-rust`)**：用於開發、重構或審查 Rust 應用程式的專家技能，涵蓋 ownership、borrowing、Result/Option 與現代 Rust 設計模式。

### 10. 需求釐清助手

* **需求釐清**：系統化引導用戶釐清模糊需求，並將其轉化為結構化的規格文件（背景、功能、約束、驗收標準）。

### 11. AI 開發流程健檢

* **AI 助手開發治理 (`skills/neo-agent-harness`)**：檢查專案規則、測試、CI、審查流程與安全防護是否足夠清楚，協助 AI 助手更穩定、更安全地參與開發。

### 12. AI Tells / Slop 贅詞消除專家

* **文字去 AI 腔調 (`skills/neo-stop-slop`)**：消除中英文 AI 腔、贅詞與公式化囉唆句式，還原為乾淨、生動且簡煉的自然語言，並包含工程師註解、Git Commit 及 PR 說明的特化優化。

## 📂 系統架構

本專案主要由標準專家技能模組組成的知識庫所構成：

| 層次 | 目錄 | 描述 |
| :--- | :--- | :--- |
| **Knowledge Base** | `skills/` | **"大腦"**。包含各領域知識 (`SKILL.md`) 與可重用的模板 (`templates/`)。 |

## 📦 安裝與使用

Neo Skills 已全面升級並支援專屬的極簡安裝器，同時相容於 [agentskills.io](https://agentskills.io) 官方推薦的 **Agent Skills 開源標準規範**。

根據您的使用場景，可以選擇以下兩種最適合您的安裝方式：

---

### 一、一鍵同步全域技能（Antigravity CLI 專用，推薦）

如果您使用的是 **Antigravity CLI**，建議使用專門設計的 `neo-skills` 安裝工具（舊稱 `install-skills`）。這是一個極簡化的工具，會一鍵將本專案所有的專家技能，複製到您的全域路徑 `~/.gemini/antigravity-cli/skills` 中，同時自動過濾無關檔案（如 `.git`、`node_modules`、`.DS_Store` 等）。

#### 透過 npx 直接執行：
```bash
npx -y @moon791017/neo-skills@latest
```

#### 本地開發手動安裝：
如果您已複製本專案至本地，也可以直接在專案根目錄下執行：
```bash
node bin/install-skills.js
```

---

### 二、使用標準 Skills CLI 安裝（通用於專案或其他 AI Agent）

針對其他支援 [agentskills.io](https://agentskills.io) 標準規範的 AI 代理（如 Claude Code, Cursor, Copilot 等），您可以使用標準的 `skills` 包管理器。預設會安裝至當前專案，**若您希望將技能安裝至全域路徑，只需在指令後方加上 `-g` 參數**。

#### 1. 專案一鍵安裝所有技能（免互動勾選）：
```bash
npx skills add Benknightdark/neo-skills --all
```

> [!TIP]
> * **全域一鍵安裝**：若要將所有技能安裝至標準全域路徑下，只需加上 `-g`：`npx skills add Benknightdark/neo-skills --all -g`。
> * **命令行指定**：若只需安裝特定 Skill，可以使用 `--skill <名稱>`（例如 `npx skills add Benknightdark/neo-skills --skill neo-typescript,neo-vue`）。

#### 💡 終端機互動選單操作小秘訣：
如果您執行了不帶 `--all` 的預設互動選單命令 `npx skills add Benknightdark/neo-skills`：
1. **一鍵全選 (Select All)**：在選單畫面中直接按下鍵盤上的 **`a`** 鍵，即可立刻自動勾選所有的技能！
2. **反向選取 (Invert Selection)**：按下鍵盤上的 **`i`** 鍵，反向切換目前的所有勾選狀態。
3. **確認送出**：全選後按下 `Enter` 鍵即可一次完成安裝。

---

### 三、按需安裝特定技能

如果您只需要其中某幾項特定領域的專家技能，您可以使用 `--skill` 參數指定安裝：

| 內建專家技能 | 一鍵安裝指令 |
| :--- | :--- |
| **1. C# 語法專家** | `npx skills add Benknightdark/neo-skills --skill neo-csharp` |
| **2. .NET 核心路由** | `npx skills add Benknightdark/neo-skills --skill neo-dotnet` |
| **3. .NET Minimal APIs 專家** | `npx skills add Benknightdark/neo-skills --skill neo-dotnet-minimal-apis` |
| **4. .NET Web API 專家** | `npx skills add Benknightdark/neo-skills --skill neo-dotnet-webapi` |
| **5. .NET MVC 專家** | `npx skills add Benknightdark/neo-skills --skill neo-dotnet-mvc` |
| **6. EF Core 專家** | `npx skills add Benknightdark/neo-skills --skill neo-dotnet-ef-core` |
| **7. .NET Tag Helper 專家** | `npx skills add Benknightdark/neo-skills --skill neo-dotnet-tag-helper` |
| **8. C# Interface 生成器** | `npx skills add Benknightdark/neo-skills --skill neo-csharp-interface-generator` |
| **9. Python 3.10+ 專家** | `npx skills add Benknightdark/neo-skills --skill neo-python` |
| **10. Python 環境與依賴管理專家** | `npx skills add Benknightdark/neo-skills --skill neo-python-manager` |
| **11. Swift 5.0+ 專家** | `npx skills add Benknightdark/neo-skills --skill neo-swift` |
| **12. SwiftUI 專家** | `npx skills add Benknightdark/neo-skills --skill neo-swift-ui` |
| **13. JavaScript 專家** | `npx skills add Benknightdark/neo-skills --skill neo-javascript` |
| **14. TypeScript 專家** | `npx skills add Benknightdark/neo-skills --skill neo-typescript` |
| **15. Vue 3 現代開發專家** | `npx skills add Benknightdark/neo-skills --skill neo-vue` |
| **16. Rust 開發專家** | `npx skills add Benknightdark/neo-skills --skill neo-rust` |
| **17. DevOps (Azure Pipelines) 架構師** | `npx skills add Benknightdark/neo-skills --skill neo-azure-pipelines` |
| **18. Code Review 專家** | `npx skills add Benknightdark/neo-skills --skill neo-code-review` |
| **19. 需求分析與釐清助手** | `npx skills add Benknightdark/neo-skills --skill neo-clarification` |
| **20. AI 開發流程治理專家** | `npx skills add Benknightdark/neo-skills --skill neo-agent-harness` |
| **21. AI Tells/Slop 消除專家** | `npx skills add Benknightdark/neo-skills --skill neo-stop-slop` |

---

### 四、安裝系統提示詞 (`install-system-instructions`)

> [!IMPORTANT]
> **獨家加值特色功能**：由於 [agentskills.io](https://agentskills.io) 標準僅處理 `.agents/skills` 專案技能的目錄同步，**並未提供將核心系統提示詞（System Instructions）附加至 AI 代理引導檔** 的功能。
> 
> 為了解決這個問題，Neo Skills 專門保留並提供強大的系統提示詞安裝器 `install-system-instructions`。此 CLI 工具會自動掃描、建立，並在不破壞您既有檔案內容的前提下，將專家提示詞完美附加或更新至各 AI 代理的專屬引導檔中。

**語法：**

```bash
npx -p @moon791017/neo-skills install-system-instructions --instructions <key> [--ai-agent <name>] [--project-path <path>] [--replace-all]
```

**參數與引數說明：**

| 參數 | 必填 | 說明 |
| :--- | :---: | :--- |
| `--instructions <key>` | ✅ | 指定要安裝的系統提示詞（可用選項見下方列表）。 |
| `--ai-agent <name>` | 否 | 指定目標 Agent（`claude` / `copilot` / `codex` / `agy`）。省略時安裝至全部。 |
| `--project-path <path>` | 否 | 指定專案根目錄。省略時安裝至使用者的全域路徑。 |
| `--replace-all` | 否 | 若先前已安裝過該提示詞，則會將其移除後全新重裝，適合用於更新提示詞版本。 |

**系統引導檔路徑對照：**

| Agent | 全域引導檔路徑 | 專案引導檔路徑 |
| :--- | :--- | :--- |
| **Claude Code** | `~/.claude/CLAUDE.md` | `<project>/CLAUDE.md` |
| **Copilot CLI** | `~/.copilot/copilot-instructions.md` | `<project>/.github/copilot-instructions.md` |
| **Codex** | `~/.codex/AGENTS.md` | `<project>/AGENTS.md` |
| **Antigravity (AGY)** | `~/.gemini/antigravity-cli/instructions.md` | `<project>/agents.md` |

**支援的系統提示詞種類：**

| Key | 提示詞名稱 | 核心功能與扮演角色 |
| :--- | :--- | :--- |
| `technical-co-founder` | **Technical Co-Founder** | 讓 AI 扮演您的技術共同創辦人，以 Discovery → Planning → Building → Polish → Handoff 五階段框架，協助您從零打造可上線的真實產品。 |
| `git-commit` | **Git Commit Message Generator** | 智能分析暫存區變更，自動生成符合 Conventional Commits 規範的精確提交訊息，經確認後一鍵提交。 |
| `fact-check` | **Fact-Check Thinking** | 強制 AI 在回答前先進行「事實檢查思考」，嚴格依據來源與事實回答，避免臆測與捏造內容。 |

**實用範例：**

```bash
# 1. 一次安裝「技術共同創辦人」提示詞至全部支援的 AI Agent 全域引導檔
npx -p @moon791017/neo-skills install-system-instructions --instructions technical-co-founder -y

# 2. 安裝「技術共同創辦人」提示詞至 Claude Code 的專案級 CLAUDE.md
npx -p @moon791017/neo-skills install-system-instructions --ai-agent claude --instructions technical-co-founder --project-path . -y

# 3. 如果需要更新/覆蓋已安裝的 git-commit 提示詞，加上 --replace-all 進行重裝
npx -p @moon791017/neo-skills install-system-instructions --ai-agent claude --instructions git-commit --replace-all -y
```

---

## 💡 常用指令範例

您可以根據不同的開發與維運需求場景，快速安裝對應的專家技能，並直接對 AI 代理下達相關指令：

| 需求場景 | 所需專家技能 | 快速安裝指令 | 推薦咒語範例 |
| :--- | :--- | :--- | :--- |
| **設定 .NET CI Pipeline** | `neo-azure-pipelines` | `npx skills add Benknightdark/neo-skills --skill neo-azure-pipelines` | `幫這個專案設定 CI 流程` |
| **部署至 IIS On-Premises** | `neo-azure-pipelines` | `npx skills add Benknightdark/neo-skills --skill neo-azure-pipelines` | `部署到 IIS，站台名稱為 MySite` |
| **全方位程式碼深度審查** | `neo-code-review` | `npx skills add Benknightdark/neo-skills --skill neo-code-review` | `幫我 code review 剛才的修改` |
| **生成 C# Interface 介面** | `neo-csharp-interface-generator` | `npx skills add Benknightdark/neo-skills --skill neo-csharp-interface-generator` | `幫我針對這個 class 產生介面` |
| **TS 型別設計與 CJS/ESM 互通** | `neo-typescript` | `npx skills add Benknightdark/neo-skills --skill neo-typescript` | `解決 tsconfig 還有 ESM/CJS 互通性的問題` |
| **複雜/模糊需求釐清與規格化** | `neo-clarification` | `npx skills add Benknightdark/neo-skills --skill neo-clarification` | `我想做一個電商網站` |
| **AI 助手開發治理與流程健檢** | `neo-agent-harness` | `npx skills add Benknightdark/neo-skills --skill neo-agent-harness` | `幫我檢查這個專案怎麼讓 AI 助手開發得更穩、更安全` |
| **清除文案/註解/Commit 中的 AI 腔** | `neo-stop-slop` | `npx skills add Benknightdark/neo-skills --skill neo-stop-slop` | `消除這段話裡的 AI 腔贅詞，使其極簡直接` |

## 🛠 開發與測試指南

本專案支援本地測試與 NPM 打包。

### 前置需求

* **[Node.js](https://nodejs.org/) (v18+)**：基本執行環境。

### 快速開始

1. **安裝依賴**

    ```bash
    npm install
    ```

2. **執行單元測試**

    ```bash
    npm test
    ```
