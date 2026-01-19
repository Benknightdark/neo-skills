# Neo Skills Extension

**Neo Skills Extension** is a specialized configuration and knowledge base for the Gemini CLI agent. It extends the agent's capabilities by providing structured "Skills" (expert knowledge) and "Commands" (automated workflows), specifically focusing on DevOps and Engineering tasks.

## Project Overview

This project serves as a "brain extension" for the AI agent, allowing it to:
1.  **Understand** complex domains (like Azure DevOps) through structured `SKILL.md` files.
2.  **Execute** precise, multi-step actions through `commands/*.toml` definitions.
3.  **Reuse** high-quality templates to ensure consistency across projects.

## Directory Structure

*   `gemini-extension.yaml`: The extension manifest file defining the project identity.
*   `skills/`: The knowledge base. Each subdirectory represents a specialized domain.
    *   `azure-pipelines/`: The **Azure Pipeline Architect** skill.
        *   `SKILL.md`: Defines the "Perceive-Reason-Act" loop for designing pipelines.
        *   `templates/`: A library of optimized, reusable YAML templates for Azure DevOps (Build, Deploy, Utils).
*   `commands/`: The action registry. Contains TOML files defining executable commands.
    *   `neo-ci-dotnet.toml`: Automates .NET CI pipeline setup.
    *   `neo-cd-app-service.toml`: Automates Azure App Service deployment setup.
    *   `neo-cd-iis.toml`: Automates IIS deployment setup.

## Core Capabilities

### 1. Azure Pipeline Architect (`skills/azure-pipelines`)
This is an expert-level skill designed to generate enterprise-grade CI/CD pipelines.
*   **Perception**: Scans project structure (languages, frameworks) and `templates/` directory.
*   **Reasoning**: Determines optimal strategies for caching, branching, and multi-stage deployment.
*   **Action**: Generates YAML configurations that strictly reference the modular templates in `skills/azure-pipelines/templates/`.

### 2. Automation Commands (`commands/`)
The project defines strict automation workflows to ensure best practices are applied automatically.

| Command | Prefix | Description |
| :--- | :--- | :--- |
| `neo:ci-dotnet` | `neo-cicd` | Sets up a .NET CI pipeline. Copies templates to `.azure-pipelines/` and generates `ci-*.yml`. |
| `neo:cd-app-service` | `neo-cicd` | Sets up a CD pipeline for Azure App Service. References `deploy-app-service.yml`. |
| `neo:cd-iis` | `neo-cicd` | Sets up a CD pipeline for On-Premises IIS. References `deploy-iis.yml` and handles backup/rollback logic. |

## Development Guidelines

### Adding a New Skill
1.  Create a directory in `skills/<skill-name>`.
2.  Add a `SKILL.md` file following the **Perceive-Reason-Act** structure.
3.  (Optional) Add supporting files (templates, docs) within the skill directory.

### Adding a New Command
1.  Create a TOML file in `commands/` (e.g., `commands/my-command.toml`).
2.  Define the `[command]` metadata (name, description).
3.  Define `[[parameters]]` for user input.
4.  Define `[implementation]` steps to guide the agent's execution.
5.  Define `[constraints]` to enforce safety and quality rules.
