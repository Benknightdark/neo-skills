# Neo Skills Extension

**Neo Skills Extension** is a specialized extension for the Gemini CLI, designed to standardize and automate DevOps workflows. It acts as a repository of expert "Skills" and executable "Commands," enabling the AI agent to perform complex engineering tasks with precision.

## 🌟 Features

*   **Skill Management**: Structured knowledge bases for specific domains (e.g., Azure Pipelines).
*   **Automated Workflows**: Pre-defined commands to execute complex tasks in one go.
*   **Template Library**: A collection of optimized, production-ready YAML templates.

## 🚀 Available Commands

### CI/CD Automation (`neo-cicd`)

| Command | Description |
| :--- | :--- |
| **`neo:ci-dotnet [project_name]`** | Sets up a complete .NET Continuous Integration pipeline. Automatically detects solution files and configures build caching. |
| **`neo:cd-app-service --app_name [name]`** | Configures a Continuous Deployment pipeline for Azure App Service. Supports multi-stage deployment. |
| **`neo:cd-iis --website_name [name]`** | Configures a Continuous Deployment pipeline for On-Premises IIS. Includes automated backup, file deployment, and rollback mechanisms. |

### Core Utilities

- **`list-skills`**: List all available skills in the current extension.
- **`new-skill`**: Scaffold a new skill directory structure.

## 📂 Project Structure

```text
.
├── gemini-extension.yaml  # Extension manifest
├── GEMINI.md              # AI Context & Operational Rules
├── commands/              # Executable command definitions (TOML)
│   ├── neo-ci-dotnet.toml
│   ├── neo-cd-app-service.toml
│   └── neo-cd-iis.toml
└── skills/                # Knowledge Base & Templates
    └── azure-pipelines/
        ├── SKILL.md       # The "Brain": Logic & Reasoning
        └── templates/     # The "Hands": Reusable YAML assets
```

## 📦 Installation

1.  Clone this repository.
2.  Link it to your Gemini CLI configuration or use it directly within your project workspace.

## 🤝 Contribution

1.  **Skills**: Add new domains under `skills/` (e.g., `skills/docker/`).
2.  **Commands**: Define new workflows in `commands/` using TOML format.
3.  **Documentation**: Ensure `SKILL.md` follows the **Perceive-Reason-Act** pattern.