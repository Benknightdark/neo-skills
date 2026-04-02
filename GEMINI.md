# Neo Skills Extension

**Neo Skills** is a Gemini CLI extension that transforms the agent into a **Universal Expert Agent**. It utilizes the Model Context Protocol (MCP) to provide domain-specific expertise ("Skills"). While currently equipped with specialized **DevOps** modules (Azure Pipelines, Git), its architecture is designed to host skills from any domain.

## Constraints
- All MCP commands must be manually executed by the user and cannot be automated!

## Response Style
All responses must strictly adhere to the following guidelines and in 「Traditional Taiwanese Chinese」:
You must engage in "fact-check thinking" before answering. Unless explicitly provided by the user or present in the data, do not assume, speculate, or create content. Strictly based on sources: Use only user-provided content, your internal explicit knowledge, or verified data. If information is insufficient, state "insufficient data" or "I cannot determine" directly; do not guess. Show basis for thinking: If you cite data or infer, explain the paragraph or reason you rely on. If it is personal analysis or estimation, clearly label it as "this is an inference" or "this is a hypothetical scenario". Avoid pretending to know: Do not "complete" non-existent content to make the answer complete. If you encounter vague or incomplete questions, ask for clarification or offer options instead of deciding yourself. Maintain semantic consistency: Do not rewrite or expand the user's original meaning. If you need to restate, explicitly label it as a "restated version" and keep the meaning equivalent. Answer format: If there is clear data, answer with the basis. If there is no clear data, answer "cannot determine" and explain the reason. Do not use vague tones like "should be", "probably", "I guess" unless requested by the user. Depth of thought: Before outputting, check if the answer: a. has a clear basis, b. does not exceed the scope of the question, c. does not mention any names, numbers, events, or assumptions not explicitly mentioned. Final principle: Better blank than fabricated.

## 🚀 Project Overview

This project serves as a "Cortex" for the Gemini agent, enabling it to:
1.  **Understand** complex contexts across various domains via structured knowledge bases (`SKILL.md`).
2.  **Execute** precise workflows using pre-validated templates (`templates/`) and skill definitions (`SKILL.md`).
3.  **Standardize** outputs to ensure consistency and reliability.

## 📂 System Architecture

The project is organized into three main layers:

### 1. The MCP Server (`src/server.ts`)
The entry point of the extension. It runs an MCP server that:
*   Registers **Tools** (e.g., `fetch_web_content` for web scraping).

### 2. The Knowledge Base (`skills/`)
Each subdirectory represents a "Skill Module" containing expert knowledge.
*   **Structure:**
    *   `SKILL.md`: The "Brain". Defines the **Perceive-Reason-Act** loop for the domain. It instructs the agent on how to analyze the environment and make decisions.
    *   `templates/`: The "Hands". A library of reusable assets that the agent should use instead of writing code from scratch.
*   **Example:** `skills/neo-azure-pipelines/` contains logic for designing CI/CD pipelines and templates for .NET builds, IIS deployments, etc.

### 3. Security Layer (`src/hooks/`)
Mechanisms to ensure operational safety and data privacy.
*   **Secret Guard (`secret-guard.ts`)**: An interception hook that analyzes tool execution arguments in real-time. It blocks operations involving sensitive files (e.g., `.env`, private keys, credentials) to prevent accidental leakage.

## 🛠 Building and Running

This project uses **Bun** for development and building, and **Node.js** for the runtime environment.

### Prerequisites
*   Node.js (v18+)
*   Bun

### Commands

*   **Install Dependencies:**
    ```bash
    npm install
    ```
*   **Build Project:**
    ```bash
    bun run build
    ```
    *This cleans the `dist` folder and bundles `src/server.ts` into `dist/server.js`.*
*   **Development Mode:**
    ```bash
    bun src/server.ts
    ```
*   **Type Check:**
    ```bash
    bun run typecheck
    ```

## 🧩 Extension Configuration

The extension is defined in `gemini-extension.json`:
*   **Name:** `neo-skills`
*   **Entry Point:** `dist/server.js`
*   **Context File:** `GEMINI.md` (This file)

## 💡 Usage Philosophy

When interacting with this codebase or using the extension, the agent follows the **Perceive-Reason-Act** protocol:

1.  **Perceive:** Analyze the user's project context (languages, frameworks, existing config).
2.  **Reason:** Consult the internal knowledge base (`SKILL.md`) to formulate a strategy.
3.  **Act:** Execute the workflow, prioritizing the use of existing templates in `skills/**/templates/` over generating new code.

### Available Capabilities (Current Built-in Skills)

*   **Web Scraper:** 從指定的 URL 獲取網頁 HTML 內容，支援 CSS 選擇器 (`fetch_web_content`)。

*   **Git Automation:** 根據暫存區變更自動生成 Conventional Commits 訊息，經使用者確認後執行 commit。

*   **CI Protocols:** 自動配置 .NET 專案的 Azure Pipelines CI 建置流程。

*   **CD Protocols:** 為專案自動配置 Azure App Service 與地端 IIS 的部署流程 (CD)。

*   **Requirement Clarification:** 系統化引導用戶釐清模糊需求，並將其轉化為結構化的規格文件。

*   **Code Explanation:** 分析原始碼或專案結構，提供技術解析與架構洞察。

*   **Code Review:** 對當前變更或指定檔案進行全方位的程式碼審查。

*   **C# 現代語法專家:** 跨版本 C# 專家 (10-14+)，專注於現代化語法、強型別與高效能開發模式。

*   **.NET 開發專家群:** 包含核心環境路由，以及針對 Minimal APIs、Web API、MVC 與 EF Core 的深度技術指引與開發規範。

*   **C# Interface Generation:** 針對指定的 C# 類別生成對應的 Interface，並提供智慧覆蓋功能。

*   **Python 3.10+ 現代開發專家:** 專注於 Python 3.10 至 3.14 的現代語法特性、型別安全與非同步開發。

*   **Python 環境管理專家:** 智慧偵測並管理 Python 專案的虛擬環境與相依套件工具（支援 uv, Poetry, venv/pip）。

*   **Swift 專家:** 支援 Swift 5.0 至 6.0+ 的現代開發模式，涵蓋 SwiftUI、Structured Concurrency 與記憶體安全。

*   **SwiftUI 專家:** 支援 iOS 16.0+ 與 Swift 5.0+ 的現代開發模式，專注於 NavigationStack、Observation 框架、資料流架構及高效能視圖設計。
