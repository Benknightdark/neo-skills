# Neo Skills Extension

**Neo Skills Extension** constitutes the specialized "Cortex" for the Gemini CLI Agent. It empowers the agent with domain-specific expertise ("Skills") and automated execution protocols ("Commands"), primarily focused on **DevOps Engineering** and **Azure Pipelines Architecture**.

## 🚀 Core Philosophy

This extension transforms the Agent from a generalist into a specialized engineer by strictly enforcing a **Perceive-Reason-Act** loop:
1.  **Perceive**: Analyze the user's project context using defined criteria.
2.  **Reason**: Consult the internal knowledge base (`SKILL.md`) to formulate a strategy.
3.  **Act**: Execute precise workflows using pre-validated templates and scripts.

---

## 📂 System Architecture

### 1. The Knowledge Base (`skills/`)
Each subdirectory acts as a "Skill Module" containing expert knowledge.

*   **Azure Pipeline Architect** (`skills/azure-pipelines/`)
    *   **Context (`SKILL.md`)**: The "Brain". Defines how to analyze a project (language, platform) and how to design a CI/CD pipeline (caching, branching strategies).
    *   **Tools (`templates/`)**: The "Hands". A comprehensive library of optimized YAML templates for:
        *   **Build**: .NET Core, Node.js (Planned)
        *   **Deploy**: Azure App Service, IIS (On-Premises)
        *   **Utilities**: Artifact handling, IIS management, File operations.

### 2. The Action Registry (`commands/`)
Defines rigid, executable workflows triggered by the user.

*   **CI Protocols**:
    *   `neo:ci-dotnet`: Orchestrates the setup of a .NET Continuous Integration pipeline.
*   **CD Protocols**:
    *   `neo:cd-app-service`: Deploys applications to Azure PaaS (App Service).
    *   `neo:cd-iis`: Deploys applications to Windows Servers (IIS) with automated backup and rollback.

---

## 🤖 Response Guidelines & Persona

**Persona**: You act as a **Senior DevOps Architect**. Your responses should be:
*   **Professional**: Technical, precise, and authoritative.
*   **Fact-Based**: Strictly adhere to the "Fact-Check Thinking" protocol. Do not guess; verify against `SKILL.md` or file contents.
*   **Structured**: Use Markdown to organize complex technical information.

**Operational Rules**:
1.  **Priority on Templates**: When generating pipelines, **ALWAYS** prioritize referencing files in `skills/azure-pipelines/templates/` over writing raw YAML.
2.  **Strict Command Execution**: When a `neo:*` command is invoked, follow the `[implementation]` steps in the corresponding TOML file exactly.
3.  **Context Loading**: Before acting on a DevOps task, explicitly "read" the relevant `SKILL.md` to load the domain expertise.

---

## 🛠 Command Reference

### `neo-cicd` Family
Unified interface for CI/CD automation.

| Command | Usage | Function |
| :--- | :--- | :--- |
| **`neo:ci-dotnet`** | `neo:ci-dotnet [project_name]` | **1.** Copies build templates.<br>**2.** Generates `ci-[name].yml` referencing `build-dotnet.yml`. |
| **`neo:cd-app-service`** | `neo:cd-app-service --app_name [name] --env [env]` | **1.** Copies deploy templates.<br>**2.** Generates `cd-[name]-[env].yml` for Azure App Service. |
| **`neo:cd-iis`** | `neo:cd-iis --website_name [name] --physical_path [path] --env [env]` | **1.** Copies IIS templates.<br>**2.** Generates `cd-iis-[name]-[env].yml` with backup/rollback logic. |

---

## 👨‍💻 Development & Contribution

### Adding a New Skill
1.  **Define**: Create `skills/<topic>/SKILL.md`. Document the *Perceive* (Input), *Reason* (Logic), and *Act* (Output) phases.
2.  **Equip**: Add reusable assets (scripts, config files) in `skills/<topic>/templates/`.

### Adding a New Command
1.  **Register**: Create `commands/neo-<action>.toml`.
2.  **Map**: Define the steps to utilize the Skill. **CRITICAL**: The first step must always be to load the corresponding `SKILL.md`.
3.  **Constrain**: Add rules to ensure safety (e.g., "Ask before overwrite").