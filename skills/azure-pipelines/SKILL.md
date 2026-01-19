---
name: azure-pipeline-architect
description: Design and generate Azure Pipelines YAML scripts that comply with the latest standards based on official Microsoft documentation and project requirements. Prioritize using modular Templates.
---

# Azure Pipeline Script Design Specifications

## Perceive
1. Access and retrieve official documentation at `https://learn.microsoft.com/en-us/azure/devops/pipelines/?view=azure-devops` to obtain the latest YAML syntax architecture, Task update notes, and security best practices.
2. Identify the application's development language (e.g., .NET, Java, Python, Node.js) and its specific version requirements.
3. Identify the target deployment platform (e.g., Azure App Service, Azure Kubernetes Service, Function App, or on-premises servers).
4. Detect the project source code structure to confirm build tools (e.g., Maven, Gradle, Npm, NuGet) and testing frameworks.
5. Read security and compliance requirements, including Static Application Security Testing (SAST), package vulnerability scanning, and container image scanning.
6. Confirm environment variable requirements, secret information sources (e.g., Azure Key Vault), and Service Connection permissions.
7. **Proactively scan the `skills/azure-pipelines/templates/` directory to identify existing reusable template resources. Includes:**
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
7. **Prioritize using templates from `skills/azure-pipelines/templates/` to assemble the Pipeline, rather than writing raw YAML from scratch.**
    *   If the project is .NET and needs deployment to IIS, combine `build-dotnet.yml` and `deploy-iis.yml`.
    *   If artifact manipulation is required, prioritize using `util/extract-artifact.yml`.

## Act
1. Output global YAML configuration scripts that comply with the latest Azure DevOps Schema standards.
2. Provide comprehensive parameter definitions to increase the flexibility and reusability of Pipeline execution.
3. Generate configuration recommendations for Environments and Approvals and Checks.
4. Output a list of Task resource references used in the script, labeling version numbers to ensure execution environment consistency.
5. Provide preventive comments and explanations for common execution errors (e.g., insufficient permissions, dependency conflicts).
6. **Use `template` syntax to reference selected template files and correctly pass required parameters. For example:**
   ```yaml
   - template: skills/azure-pipelines/templates/build/build-dotnet.yml
     parameters:
       buildConfiguration: 'Release'
   ```