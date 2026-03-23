# Neo Skills (Gemini CLI Extension)

**Neo Skills** 是專為 Gemini CLI 設計的**全方位能力擴充套件**。本專案透過 Model Context Protocol (MCP) 架構，為 AI 代理安裝可插拔的「技能模組 (Skills)」，使其不僅僅是一個聊天機器人，而是能轉化為具備「感知-推理-行動」能力的**多領域專家**。

無論是 DevOps 自動化、軟體架構設計，或是未來的資料分析與專案管理，Neo Skills 都能透過掛載不同的知識庫與工具，讓 Gemini 成為您最強大的全能助手。

## 🚀 核心願景

本專案作為 Gemini Agent 的「大腦皮層 (Cortex)」，旨在打造一個**全能型 Agent 框架**，透過以下機制提升 AI 的專業度：

1.  **領域專精 (Skills)**：可擴充的專家知識庫 (`SKILL.md`)。目前已內建 DevOps 模組，未來將持續擴增更多領域。
2.  **標準化執行 (Commands)**：提供預先驗證的自動化腳本與模板，確保產出的一致性與可靠性。
3.  **架構思維**：強制執行「感知 (Perceive) -> 推理 (Reason) -> 行動 (Act)」的決策迴圈，避免 AI 產生幻覺，確保解決方案的精準度。

## ✨ 目前內建技能 (Built-in Skills)

### 1. Azure Pipelines 架構師
自動化設計與生成符合微軟最佳實踐的 CI/CD 流程。
*   **CI 自動化 (`neo:ci-dotnet`)**：針對 .NET 專案生成建置管線，整合單元測試與構件發佈。
*   **CD 自動化**：
    *   **Azure App Service (`neo:cd-app-service`)**：部署至Azure App Service。
    *   **IIS On-Premises (`neo:cd-iis`)**：部署至地端 IIS 伺服器，包含備份與復原機制。

### 2. 智慧 Git 助手
*   **Smart Commit (`neo:git_commit`)**：根據 `git diff` 暫存區內容，自動生成符合 Conventional Commits 規範的提交訊息。

### 3. Code Review 專家
*   **智能審查 (`neo:code-review`)**：針對程式碼變更進行多面向 (正確性、安全性、效能、可讀性) 的深度審查。

### 4. 程式碼解釋助手
*   **技術解析 (`neo:explain`)**：深入分析原始碼或專案結構，提供高階用途摘要、邏輯流程分解以及核心元件說明。

### 5. .NET / C# 開發專家
*   **Web API 專家 (`skills/dotnet-webapi`)**：協助遵循最新產業最佳實踐來開發 ASP.NET Core Web API。
*   **Minimal APIs 專家 (`skills/dotnet-minimal-apis`)**：提供高效能、輕量級 .NET Minimal API 的開發指引。
*   **MVC 專家 (`skills/dotnet-mvc`)**：針對使用 Razor 視圖的 ASP.NET Core MVC 應用程式提供專家指引。
*   **Interface 生成器 (`neo:dotnet-gen-interface`)**：針對 C# Class 自動生成符合規範的 Interface，並支援智慧檔案覆蓋功能。

### 6. Python 開發與環境管理專家
*   **Python 3.10+ 專家 (`skills/python`)**：專注於 Python 3.10 至 3.14 的現代語法特性、型別安全與非同步開發。
*   **環境管理專家 (`skills/python-manager`)**：智慧偵測與管理 Python 專案環境，支援 uv, Poetry, venv/pip 並提供自動化安裝建議。

### 7. 需求釐清助手
*   **需求釐清 (`neo:clarification`)**：系統化引導用戶釐清模糊需求，並將其轉化為結構化的規格文件（背景、功能、約束、驗收標準）。

### 7. 安全守衛 (Security Guard)
*   **主動防護 (`secret-guard.ts`)**：作為 CLI 的中介軟體 (Hook)，自動攔截並掃描所有工具執行的參數。若偵測到敏感資訊（如 `.env` 檔案、私鑰、AWS 憑證等）將強制阻擋執行，防止機密外洩。

## 📂 系統架構

本專案由三個核心層次組成，支援無限擴充：

| 層次 | 目錄 | 描述 |
| :--- | :--- | :--- |
| **MCP Server** | `src/server.ts` | 擴充套件的進入點，負責註冊 Tool 與 Prompt，處理與 Gemini CLI 的通訊。 |
| **Knowledge Base** | `skills/` | **"大腦"**。包含各領域知識 (`SKILL.md`) 與可重用的模板 (`templates/`)。 |
| **Action Registry** | `commands/` | **"指令集"**。定義了使用者可呼叫的具體指令 (TOML 格式)，將請求映射至特定的 Skill。 |
| **Security Layer** | `src/hooks/` | **"安全守衛"**。攔截並掃描工具執行參數，防止敏感資訊 (如私鑰、密碼) 外洩。 |

## 📦 安裝與使用

此擴充套件設計用於 Gemini CLI 環境。

### 安裝方式

您可以使用以下指令直接從 GitHub 遠端安裝並啟用自動更新：

```bash
gemini extension install https://github.com/Benknightdark/neo-skills --auto-update
```

或在 `gemini-extension.json` 中手動進行本地配置：

```json
{
  "name": "neo-skills",
  "description": "Neo Tools MCP Server",
  "mcpServers": {
    "neo-skills": {
      "command": "node",
      "args": ["${extensionPath}/dist/server.js"]
    }
  }
}
```

### 常用指令範例

在 Gemini CLI 中，您可以直接呼叫以下指令：

*   **生成 Commit Message**：
    > "幫我 commit 這些變更" 或 `/neo:git-commit`
*   **設定 .NET CI Pipeline**：
    > "幫這個專案設定 CI 流程" 或 `/neo:ci-dotnet`
*   **部署至 IIS**：
    > "我要部署到 IIS，站台名稱是 MySite" 或 `/neo:cd-iis`
*   **釐清模糊需求**：
    > "我想做一個電商網站" 或 `/neo:clarification`
*   **程式碼審查**：
    > "幫我 code review 剛才的修改" 或 `/neo:code-review`
*   **生成 C# Interface**：
    > "幫我針對這個 class 產生介面" 或 `/neo:dotnet-gen-interface`

## 🛠 開發指南

本專案使用 **Bun** 進行開發與建置。

### 前置需求
*   [Node.js](https://nodejs.org/) (v18+)
*   [Bun](https://bun.sh/)

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