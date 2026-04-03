# 🧠 Neo Skills

[![test-on-develop](https://github.com/Benknightdark/neo-skills/actions/workflows/test-on-develop.yml/badge.svg)](https://github.com/Benknightdark/neo-skills/actions/workflows/test-on-develop.yml)
[![npm version](https://img.shields.io/npm/v/@moon791017/neo-skills.svg)](https://www.npmjs.com/package/@moon791017/neo-skills)

![Neo Skills banner](https://raw.githubusercontent.com/Benknightdark/neo-skills/refs/heads/develop/images/banner.png)

**Neo Skills** 是專為現代 **AI Agent** 設計的**全方位能力擴充套件**。

本專案透過標準化的通訊架構，為 AI 代理安裝可插拔的「技能模組 (Skills)」，使其突破單純聊天機器人的限制，轉化為具備「**感知 (Perceive) - 推理 (Reason) - 行動 (Act)**」能力的**多領域專家**。

無論是 DevOps 自動化、軟體架構設計，或是未來的資料分析與專案管理，Neo Skills 都能透過掛載不同的知識庫與工具，讓 AI 成為您最強大的全能開發助手。

---

## 🚀 核心願景與架構

本專案作為 AI Agent 的「大腦皮層 (Cortex)」，支援無限擴充，系統主要由三個核心層次組成：

| 層次 | 目錄 / 模組 | 核心職責 |
| :--- | :--- | :--- |
| **Server** | `src/server.ts` | 擴充套件的進入點。負責註冊 Tools 並處理與 AI Agent CLI (MCP) 的底層通訊。 |
| **Knowledge Base** | `skills/` | 系統的 **"大腦"**。包含各領域專家知識 (`SKILL.md`) 與經過驗證的可重用模板 (`templates/`)。 |
| **Security Layer** | `src/hooks/` | 系統的 **"安全守衛"**。攔截並掃描工具執行參數，防止敏感資訊外洩。 |

---

## ✨ 內建專家技能 (Built-in Skills)

目前 Neo Skills 涵蓋了從 DevOps 到各語言開發的深度知識庫：

### 🛠️ DevOps & 工具鍊
*   **Azure Pipelines 架構師**：自動化設計符合微軟最佳實踐的 CI/CD 流程（包含 .NET 建置、App Service 與地端 IIS 部署/備份機制）。
*   **智慧 Git 助手**：分析 `git diff` 暫存區內容，自動生成符合 Conventional Commits 規範的高品質提交訊息。

### 💻 程式語言開發專家
*   **.NET / C# 生態系**：
    *   **C# 現代語法專家**：涵蓋 C# 10-14+ 現代化語法與強型別開發模式。
    *   **.NET 核心路由**：自動將任務精準委派給子領域專家 (Minimal APIs, Web API, MVC, EF Core)。
    *   **Interface 生成器**：針對 C# Class 智慧生成對應的 Interface，並支援檔案覆蓋更新。
*   **Python 開發專家**：專注於 Python 3.10-3.14 現代語法、非同步開發，並內建虛擬環境與套件工具 (uv, Poetry, venv) 的智慧管理。
*   **Swift / SwiftUI 專家**：支援 iOS 16.0+ 與 Swift 5.0+ 現代開發模式，涵蓋 Observation 框架與高效能視圖設計。
*   **JavaScript ES6+ 專家**：涵蓋 ES6 至 ES2025+ 最新標準，支援前端、Node.js 及 Razor 內嵌腳本環境。

### 🔍 程式碼與需求分析
*   **Code Review 專家**：針對程式碼變更，從正確性、安全性、效能與可讀性等多維度進行深度智能審查。
*   **程式碼解釋助手**：深入分析原始碼或專案結構，提供高階用途摘要、邏輯流程分解與核心元件說明。
*   **需求釐清助手**：系統化引導使用者釐清模糊的初始想法，並將其轉化為結構化的 PRD 規格文件。

---

## 📦 安裝與使用指南

Neo Skills 支援多款主流 AI Agent 的無縫整合。

### 1. Gemini CLI（官方擴充套件模式）
若是使用 [Gemini CLI](https://github.com/google-gemini/gemini-cli)，可直接透過擴充套件機制安裝，系統將自動保持最新：

```bash
gemini extension install https://github.com/Benknightdark/neo-skills --auto-update
```

### 2. 其他 AI CLI（Claude, Copilot, Codex）
針對其他 Agent，Neo Skills 提供了兩支內建的 CLI 工具，透過 `npx` 即可快速將技能模組與系統提示詞寫入對應的環境設定檔中。

#### A. 安裝技能模組 (`install-skills`)
將 `skills/` 專家知識庫同步至 Agent 的設定資料夾。

```bash
# 一次為所有支援的 Agent 安裝全域技能
npx -p @moon791017/neo-skills install-skills -y

# 僅為單一 Agent (如: claude) 安裝，並指定專案路徑
npx -p @moon791017/neo-skills install-skills --ai-agent claude --project-path /my/project -y
```

#### B. 安裝系統提示詞 (`install-system-instructions`)
將強大的角色定義（如：技術共同創辦人）注入 Agent 的指導檔（如 `CLAUDE.md`）。

```bash
# 將「Technical Co-Founder」角色設定寫入所有 Agent 的全域指導檔
npx -p @moon791017/neo-skills install-system-instructions --instructions technical-co-founder -y
```
*(💡 註：重複執行安裝指令是安全的，系統具備冪等性設計，會自動跳過已安裝的內容。)*

---

## 💬 常用對話 / 咒語範例

安裝完成後，您可以用自然語言直接喚醒對應的專家技能：

*   💡 **開發與架構：**
    *   `「我想做一個電商網站，請引導我釐清需求。」`
    *   `「幫我針對這個 C# class 產生對應的介面。」`
    *   `「分析這個專案的架構並解釋主要邏輯。」`
*   💡 **自動化與 DevOps：**
    *   `「幫我 review 剛才的程式碼修改，並列出安全性問題。」`
    *   `「幫我 commit 目前暫存區的變更。」`
    *   `「幫這個專案設定 Azure Pipelines 的 CI 流程。」`

---

## 🛠 參與開發

本專案使用 **Bun** 作為開發與建置工具。

### 前置環境
*   **[Node.js](https://nodejs.org/) (v18+)**：核心執行環境。
*   **[Bun](https://bun.sh/)**：用於開發、建置與執行 MCP Server。

### 開發指令

```bash
# 1. 安裝依賴
npm install

# 2. 開發模式 (執行 MCP Server 測試)
bun src/server.ts

# 3. 建置專案 (編譯 TypeScript 至 dist/)
bun run build

# 4. 類型檢查
bun run typecheck
```
