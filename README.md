# Neo Skills

[![test-on-develop](https://github.com/Benknightdark/neo-skills/actions/workflows/test-on-develop.yml/badge.svg)](https://github.com/Benknightdark/neo-skills/actions/workflows/test-on-develop.yml)

![Neo Skills banner](https://raw.githubusercontent.com/Benknightdark/neo-skills/refs/heads/develop/images/banner.png)


**Neo Skills** 是專為現代 **AI Agent** 設計的**全方位能力擴充套件**。本專案透過標準化的通訊架構，為 AI 代理安裝可插拔的「技能模組 (Skills)」，使其不僅僅是一個聊天機器人，而是能轉化為具備「感知-推理-行動」能力的**多領域專家**。

無論是 DevOps 自動化、軟體架構設計，或是未來的資料分析與專案管理，Neo Skills 都能透過掛載不同的知識庫與工具，讓 AI 成為您最強大的全能助手。

## 🚀 核心願景

本專案作為 AI Agent 的「大腦皮層 (Cortex)」，旨在打造一個**全能型 Agent 框架**，透過以下機制提升 AI 的專業度：

1.  **領域專精 (Skills)**：可擴充的專家知識庫 (`SKILL.md`)。目前已內建 DevOps 模組，未來將持續擴增更多領域。
2.  **標準化範本 (Templates)**：提供預先驗證的自動化腳本與模板，確保產出的一致性與可靠性。
3.  **架構思維**：強制執行「感知 (Perceive) -> 推理 (Reason) -> 行動 (Act)」的決策迴圈，避免 AI 產生幻覺，確保解決方案的精準度。

## ✨ 目前內建技能 (Built-in Skills)

### 1. Azure Pipelines 架構師
自動化設計與生成符合微軟最佳實踐的 CI/CD 流程。
*   **CI 自動化**：針對 .NET 專案生成建置管線，整合單元測試與構件發佈。
*   **CD 自動化**：
    *   **Azure App Service**：部署至Azure App Service。
    *   **IIS On-Premises**：部署至地端 IIS 伺服器，包含備份與復原機制。

### 2. 智慧 Git 助手
*   **Smart Commit**：根據 `git diff` 暫存區內容，自動生成符合 Conventional Commits 規範的提交訊息。

### 3. Code Review 專家
*   **智能審查**：針對程式碼變更進行多面向 (正確性、安全性、效能、可讀性) 的深度審查。

### 4. 程式碼解釋助手
*   **技術解析**：深入分析原始碼或專案結構，提供高階用途摘要、邏輯流程分解以及核心元件說明。

### 5. .NET / C# 開發專家
*   **C# 現代語法專家 (`skills/neo-csharp`)**：跨版本 C# 專家 (10-14+)，專注於現代化語法、強型別與高效能開發模式。
*   **.NET 核心路由 (`skills/neo-dotnet`)**：環境偵測與統一入口，自動將任務委派給最合適的子領域專家。
*   **.NET Minimal APIs 專家 (`skills/neo-dotnet-minimal-apis`)**：專注於高效能微服務、路由群組與 Typed Results。
*   **.NET Web API 專家 (`skills/neo-dotnet-webapi`)**：提供控制器模式下的架構設計、Problem Details 與異常處理指引。
*   **.NET MVC 專家 (`skills/neo-dotnet-mvc`)**：處理伺服器端渲染 (SSR)、視圖模型與標籤協助程式的最佳實踐。
*   **EF Core 專家 (`skills/neo-dotnet-ef-core`)**：專注於資料庫建模、移轉管理與 Linq 查詢優化。
*   **Interface 生成器**：針對 C# Class 自動生成符合規範的 Interface，並支援智慧檔案覆蓋功能。

### 6. Python 開發與環境管理專家
*   **Python 3.10+ 專家 (`skills/neo-python`)**：專注於 Python 3.10 至 3.14 的現代語法特性、型別安全與非同步開發。
*   **環境管理專家 (`skills/neo-python-manager`)**：智慧偵測與管理 Python 專案環境，支援 uv, Poetry, venv/pip 並提供自動化安裝建議。

### 7. Swift 開發專家
*   **Swift 5.0+ 專家 (`skills/neo-swift`)**：支援從基礎語法到 Swift 6 的現代開發模式，涵蓋 SwiftUI、Structured Concurrency、記憶體安全以及高效能 App 開發指引。
*   **SwiftUI 專家 (`skills/neo-swift-ui`)**：支援 iOS 16.0+ 與 Swift 5.0+ 的現代開發模式，專注於 NavigationStack、Observation 框架、資料流架構及高效能視圖設計。

### 8. JavaScript 現代語法專家
*   **JavaScript ES6+ 專家 (`skills/neo-javascript`)**：跨版本 JavaScript 專家 (ES6-ES2025+)，涵蓋從 Arrow Functions 到 Iterator Helpers 的全方位演進，支援瀏覽器、Node.js 及 HTML/Razor 內嵌腳本環境。

### 9. 需求釐清助手
*   **需求釐清**：系統化引導用戶釐清模糊需求，並將其轉化為結構化的規格文件（背景、功能、約束、驗收標準）。

### 10. 安全守衛 (Security Guard)
*   **主動防護 (`secret-guard.ts`)**：作為 CLI 的中介軟體 (Hook)，自動攔截並掃描所有工具執行的參數。若偵測到敏感資訊（如環境設定檔、私鑰、雲端憑證等）將強制阻擋執行，防止機密外洩。

## 📂 系統架構

本專案由三個核心層次組成，支援無限擴充：

| 層次 | 目錄 | 描述 |
| :--- | :--- | :--- |
| **Server** | `src/server.ts` | 擴充套件的進入點，負責註冊 Tool，處理與 AI Agent CLI 的通訊。 |
| **Knowledge Base** | `skills/` | **"大腦"**。包含各領域知識 (`SKILL.md`) 與可重用的模板 (`templates/`)。 |
| **Security Layer** | `src/hooks/` | **"安全守衛"**。攔截並掃描工具執行參數，防止敏感資訊外洩。 |

## 📦 安裝與使用

### 支援的 AI Agent

| Agent | CLI 工具 | 技能目錄 | 指導檔 |
| :--- | :--- | :--- | :--- |
| **Gemini** | [Gemini CLI](https://github.com/google-gemini/gemini-cli) | 透過擴充套件自動載入 | `GEMINI.md` |
| **Claude** | [Claude Code](https://docs.anthropic.com/en/docs/claude-code) | `.claude/skills/` | `CLAUDE.md` |
| **Copilot** | [GitHub Copilot CLI](https://docs.github.com/en/copilot) | `.copilot/skills/`（全域）<br>`.github/skills/`（專案） | `.copilot/copilot-instructions.md`（全域）<br>`.github/copilot-instructions.md`（專案） |
| **Codex** | [OpenAI Codex CLI](https://github.com/openai/codex) | `.codex/skills/` | `AGENTS.md` |

Neo Skills 提供兩個 CLI 工具，分別用於安裝**技能模組**與**系統提示詞**：

| 工具 | 用途 | 安裝目標 |
| :--- | :--- | :--- |
| `install-skills` | 將技能模組（`skills/`）複製到 Agent 的技能目錄 | 資料夾（如 `.claude/skills`） |
| `install-system-instructions` | 將系統提示詞寫入 Agent 的指導檔 | 單一檔案（如 `CLAUDE.md`） |

> 兩個工具皆支援 `--ai-agent` 與 `--project-path` 參數，邏輯一致。

---

### 一、Gemini CLI（擴充套件模式）

Gemini CLI 透過擴充套件機制直接安裝，**不需要**以下的 npx 指令：

```bash
gemini extension install https://github.com/Benknightdark/neo-skills --auto-update
```

---

### 二、安裝技能模組 (`install-skills`)

將 `skills/` 目錄下的所有技能模組複製到目標 AI Agent 的技能資料夾。

**語法：**

```
install-skills [--ai-agent <name>] [--project-path <path>]
```

**參數：**

| 參數 | 必填 | 說明 |
| :--- | :---: | :--- |
| `--ai-agent <name>` | 否 | 指定目標 Agent（`claude` / `copilot` / `codex`）。省略時安裝全部。 |
| `--project-path <path>` | 否 | 指定專案根目錄。省略時安裝至 `$HOME` 全域路徑。 |

**安裝路徑對照：**

| Agent | 全域路徑 | 專案路徑 |
| :--- | :--- | :--- |
| Claude | `~/.claude/skills/` | `<project>/.claude/skills/` |
| Copilot | `~/.copilot/skills/` | `<project>/.github/skills/` |
| Codex | `~/.codex/skills/` | `<project>/.codex/skills/` |

**範例：**

```bash
# 安裝指定 Agent 至全域
npx -p @moon791017/neo-skills install-skills --ai-agent claude -y

# 安裝指定 Agent 至專案
npx -p @moon791017/neo-skills install-skills --ai-agent copilot --project-path /my/project -y

# 一次安裝全部 Agent
npx -p @moon791017/neo-skills install-skills -y
```

---

### 三、安裝系統提示詞 (`install-system-instructions`)

將預定義的系統提示詞寫入 AI Agent 的指導檔。若指導檔已存在，會附加至最下方；若不存在，則自動建立。

**語法：**

```
install-system-instructions --instructions <key> [--ai-agent <name>] [--project-path <path>]
```

**參數：**

| 參數 | 必填 | 說明 |
| :--- | :---: | :--- |
| `--instructions <key>` | ✅ | 指定要安裝的系統提示詞（見下方種類表）。 |
| `--ai-agent <name>` | 否 | 指定目標 Agent（`claude` / `copilot` / `codex`）。省略時安裝至全部。 |
| `--project-path <path>` | 否 | 指定專案根目錄。省略時安裝至 `$HOME` 全域路徑。 |

**指導檔路徑對照：**

| Agent | 全域路徑 | 專案路徑 |
| :--- | :--- | :--- |
| Claude | `~/.claude/CLAUDE.md` | `<project>/CLAUDE.md` |
| Copilot | `~/.copilot/copilot-instructions.md` | `<project>/.github/copilot-instructions.md` |
| Codex | `~/.codex/AGENTS.md` | `<project>/AGENTS.md` |

**可用的系統提示詞種類：**

| Key | 名稱 | 說明 |
| :--- | :--- | :--- |
| `technical-co-founder` | Technical Co-Founder | 讓 AI 扮演技術共同創辦人，以 Discovery → Planning → Building → Polish → Handoff 五階段框架，協助您從零打造可上線的真實產品。 |

**範例：**

```bash
# 一次安裝至全部 Agent 的全域指導檔
npx -p @moon791017/neo-skills install-system-instructions \
  --instructions technical-co-founder -y

# 安裝至指定 Agent 的全域指導檔 (~/.claude/CLAUDE.md)
npx -p @moon791017/neo-skills install-system-instructions \
  --ai-agent claude --instructions technical-co-founder -y

# 安裝至專案的 CLAUDE.md
npx -p @moon791017/neo-skills install-system-instructions \
  --ai-agent claude --instructions technical-co-founder --project-path /my/project -y

# 安裝至專案的 .github/copilot-instructions.md
npx -p @moon791017/neo-skills install-system-instructions \
  --ai-agent copilot --instructions technical-co-founder --project-path /my/project -y
```

> **💡** 重複執行相同指令不會重複寫入，系統會自動偵測並跳過已安裝的提示詞。

## 💡 常用指令範例

您可以直接對 AI 代理下達以下指令或在對話中描述需求：

| 需求場景 | 推薦咒語範例 |
| :--- | :--- |
| **生成 Commit Message** | `幫我 commit 變更` |
| **設定 .NET CI Pipeline** | `幫這個專案設定 CI 流程` |
| **部署至 IIS** | `部署到 IIS，站台名稱為 MySite` |
| **需求釐清與規格化** | `我想做一個電商網站` |
| **全方位程式碼審查** | `幫我 code review 剛才的修改` |
| **生成 C# Interface** | `幫我針對這個 class 產生介面` |
| **技術解析與架構洞察** | `分析這個專案的架構` |

## 🛠 開發指南

本專案使用 **Bun** 進行開發與建置。

### 前置需求
*   **[Node.js](https://nodejs.org/) (v18+)**：基本執行環境。
*   **[Bun](https://bun.sh/)**：僅在**開發**、**建置**或執行 **Gemini MCP Server** 時需要。

### 快速開始

1.  **安裝依賴**
    ```bash
    npm install
    ```

2.  **開發模式 (Watch Mode)**
    直接執行原始碼進行測試：
    ```bash
    bun src/server.ts
    ```

3.  **建置專案**
    將 TypeScript 編譯並打包至 `dist/` 目錄：
    ```bash
    bun run build
    ```

4.  **類型檢查**
    ```bash
    bun run typecheck
    ```
