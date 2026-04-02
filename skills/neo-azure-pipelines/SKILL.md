---
name: neo-azure-pipeline-architect
version: "1.0.0"
category: "DevOps"
description: "根據微軟官方文件與專案需求，設計並生成符合最新標準的 Azure Pipelines YAML 腳本。優先使用模組化範本 (Templates)。"
compatibility: "Supports .NET 6.0 up to .NET 10.0."
---

# Azure Pipeline Script Design Specifications

## Perceive
1. Access and retrieve official documentation at `https://learn.microsoft.com/en-us/azure/devops/pipelines/?view=azure-devops` to obtain the latest YAML syntax architecture, Task update notes, and security best practices.
2. Identify the application's development language (e.g., .NET, Java, Python, Node.js) and its specific version requirements.
3. Identify the target deployment platform (e.g., Azure App Service, Azure Kubernetes Service, Function App, or on-premises servers).
4. Detect the project source code structure to confirm build tools (e.g., Maven, Gradle, Npm, NuGet) and testing frameworks.
5. Read security and compliance requirements, including Static Application Security Testing (SAST), package vulnerability scanning, and container image scanning.
6. Confirm environment variable requirements, secret information sources (e.g., Azure Key Vault), and Service Connection permissions.
7. **Proactively scan the `skills/neo-azure-pipelines/templates/` directory to identify existing reusable template resources. Includes:**
    *   **Build**: `build/build-dotnet.yml`
    *   **Deploy**: `deploy/deploy-app-service.yml`, `deploy/deploy-iis.yml`
    *   **Utils**: `util/clean-artifact.yml`, `util/extract-artifact.yml`, `util/iis/*.yml`, etc.

## Reason
1. Compare the latest versions in official documentation with existing configurations to determine if Task versions need updating (e.g., using Checkout@v1 vs. Checkout@v4).
2. Determine whether to adopt a multi-stage architecture based on project scale to achieve logical isolation of Build, Test, Staging, and Production.
3. Evaluate and design build caching strategies, optimizing dependency package folders to reduce execution time.
4. Design trigger mechanisms based on branching strategies, distinguishing trigger paths for Continuous Integration (CI) and Continuous Deployment (CD).
5. Determine the applicability of deployment strategies, such as Blue-Green, Canary, or Rolling Update.
6. Validate conditional execution syntax (Conditions) in Pipeline logic to ensure subsequent steps only execute on specific branches or after successful prerequisites.
7. **Prioritize using templates from `skills/neo-azure-pipelines/templates/` to assemble the Pipeline, rather than writing raw YAML from scratch.**
    *   If the project is .NET and needs deployment to IIS, combine `build-dotnet.yml` and `deploy-iis.yml`.
    *   If artifact manipulation is required, prioritize using `util/extract-artifact.yml`.

## Act

### General Output Standards
1. Output global YAML configuration scripts that comply with the latest Azure DevOps Schema standards.
2. Provide comprehensive parameter definitions to increase the flexibility and reusability of Pipeline execution.
3. Generate configuration recommendations for Environments and Approvals and Checks.
4. Output a list of Task resource references used in the script, labeling version numbers to ensure execution environment consistency.
5. Provide preventive comments and explanations for common execution errors (e.g., insufficient permissions, dependency conflicts).
6. **Use `template` syntax to reference selected template files and correctly pass required parameters. For example:**
   ```yaml
   - template: skills/neo-azure-pipelines/templates/build/build-dotnet.yml
     parameters:
       buildConfiguration: 'Release'
   ```

### CI Workflow: .NET Build Pipeline
When configuring a CI process for a .NET project:
1. Scan the project directory to identify the .NET version (e.g., .NET 6/8), project name, and solution file (`.sln`).
2. Check for any existing pipeline configurations.
3. Create the `.pipelines/templates/build/` and `.pipelines/templates/util/` directories.
4. Copy `build/build-dotnet.yml` and `util/clean-artifact.yml` templates to their respective locations.
5. Generate `azure-pipelines-ci.yml` in the project root, ensuring the structure uses proper `template` syntax with correct parameters.

### CD Workflow: Azure App Service Deployment
When configuring a CD process for Azure App Service:
1. Confirm the Azure App Service name, environment name (e.g., Production/Staging), and Service Connection name with the user or from the project context.
2. Identify the Build Artifact name.
3. Copy `deploy/deploy-app-service.yml` to the project's `.pipelines/templates/deploy/` directory.
4. Generate the deployment pipeline file (e.g., `azure-pipelines-cd-appservice.yml`) in the project root.
5. Ensure the YAML correctly configures `environment`, `strategy: runOnce`, and template calls.
6. Advise the user on setting up corresponding Environments and Approvals in Azure DevOps.

### CD Workflow: On-Premises IIS Deployment
When configuring a CD process for on-premises IIS:
1. Confirm IIS parameters: Website Name, Physical Path, Deployment Group name, and target environment.
2. Verify if the project requires specific ASP.NET Core environment settings.
3. Copy the entire `util/iis/` directory and the `deploy/deploy-iis.yml` template to the project's `.pipelines/templates/` directory.
4. Generate the deployment script (e.g., `azure-pipelines-cd-iis.yml`) in the project root, referencing `deploy-iis.yml` with parameters like `websiteName` and `physicalPath`.
5. Ensure the script integrates `iis-backup.yml` and `iis-rollback.yml` logic.
6. Explain the requirements for Service Connection permissions and Deployment Group configuration.