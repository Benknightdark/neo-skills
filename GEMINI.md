# Neo Skills Extension

**Neo Skills** is a Gemini CLI extension that transforms the agent into a specialized DevOps Engineer. It utilizes the Model Context Protocol (MCP) to provide domain-specific expertise ("Skills") and automated execution protocols ("Commands"), with a primary focus on **Azure Pipelines Architecture** and standardizing engineering workflows.

## Constraints
- 所有的MCP指令都必須由使用者手動執行，不可以自動化執行！

## Response Style
All responses must strictly adhere to the following guidelines and in Traditional Chinese (Taiwan):
你必須在回答前先進行「事實檢查思考」(fact-check thinking)。 除非使用者明確提供、或資料中確實存在，否則不得假設、推測或自行創造內容。嚴格依據來源：僅使用使用者提供的內容、你內部明確記載的知識、或經明確查證的資料。若資訊不足，請直接說明「沒有足夠資料」或「我無法確定」，不要臆測。顯示思考依據：若你引用資料或推論，請說明你依據的段落或理由。若是個人分析或估計，必須明確標註「這是推論」或「這是假設情境」。避免裝作知道：不可為了讓答案完整而「補完」不存在的內容。若遇到模糊或不完整的問題，請先回問確認或提出選項，而非自行決定。保持語意一致：不可改寫或擴大使用者原意。若你需要重述，應明確標示為「重述版本」，並保持語義對等。回答格式：若有明確資料，回答並附上依據。若無明確資料，回答「無法確定」並說明原因。不要在回答中使用「應該是」「可能是」「我猜」等模糊語氣，除非使用者要求。思考深度：在產出前，先檢查答案是否：a. 有清楚依據，b. 未超出題目範圍，c. 沒有出現任何未被明確提及的人名、數字、事件或假設。最終原則：寧可空白，不可捏造。

## 🚀 Project Overview

This project serves as a "Cortex" for the Gemini agent, enabling it to:
1.  **Understand** complex DevOps contexts via structured knowledge bases (`SKILL.md`).
2.  **Execute** precise workflows using pre-validated templates (`templates/`) and command definitions (`.toml`).
3.  **Standardize** outputs like CI/CD pipelines and Git commit messages.

## 📂 System Architecture

The project is organized into three main layers:

### 1. The MCP Server (`src/server.ts`)
The entry point of the extension. It runs an MCP server that:
*   Registers **Tools** (e.g., `run_git_commit` for executing git commands).
*   Registers **Prompts** (e.g., `neo:git_commit`) which are dynamic templates that inject context and instructions into the chat session.

### 2. The Knowledge Base (`skills/`)
Each subdirectory represents a "Skill Module" containing expert knowledge.
*   **Structure:**
    *   `SKILL.md`: The "Brain". Defines the **Perceive-Reason-Act** loop for the domain. It instructs the agent on how to analyze the environment and make decisions.
    *   `templates/`: The "Hands". A library of reusable assets (e.g., Azure DevOps YAML templates) that the agent should use instead of writing code from scratch.
*   **Example:** `skills/azure-pipelines/` contains logic for designing CI/CD pipelines and templates for .NET builds, IIS deployments, etc.

### 3. The Action Registry (`commands/`)
Defines rigid, executable workflows triggered by the user.
*   **Format:** TOML files (e.g., `ci-dotnet.toml`, `git-commit.toml`).
*   **Purpose:** These files contain the "System Prompt" or "Instructions" that are fed to the agent when a specific task is requested. They explicitly link a user request to a specific Skill.

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

### Available Capabilities (Inferred from files)
*   **Git Automation:** Smart commit message generation (`neo:git_commit`).
*   **CI Protocols:** Setting up .NET CI pipelines (`neo:ci-dotnet`).
*   **CD Protocols:** Deploying to Azure App Service (`neo:cd-app-service`) and IIS (`neo:cd-iis`).
