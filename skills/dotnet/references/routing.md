# .NET Skill Routing Decision Tree

Use this guide to route .NET tasks to the most specific skill available.

## 1. App Model Classification (Primary Skills)

Identify the primary hosting or execution model:

- **Web API (Controller-based)**: `dotnet-webapi`
- **Minimal APIs (Modern)**: `dotnet-minimal-apis`
- **MVC / Razor Pages**: `dotnet-mvc`
- **Generic C# / Refactoring**: `csharp-coding`

## 2. Cross-Cutting Concerns (Utility Skills)

Even if an app model is identified, use these for specific tasks:

- **CI/CD / Azure Pipelines**: `azure-pipelines`
- **Code Review**: `code-review`
- **Explanation / Architecture Analysis**: `explain`
- **Plan Generation**: `start-plan`

## 3. Decision Logic

1. **Specific over General**: If you see `Microsoft.NET.Sdk.Web`, do not use generic `dotnet`. Use `dotnet-webapi`, `dotnet-minimal-apis`, or `dotnet-mvc`.
2. **Behavior over Tooling**: If the task is "Add a controller", use `dotnet-webapi`. If the task is "Review the PR for this API", use `code-review` but keep the context of `dotnet-webapi`.
3. **Hybrid / Multi-Project Solutions**:
   - If a solution contains both an API and an MVC frontend, identify which project is the **target of the current change**.
   - If the task is global (e.g., "Change the target framework of all projects"), stay in `dotnet` (this router skill) to handle the orchestration.
   - For specific feature work, switch to the project-specific skill.

## 4. Modern vs. Legacy
- **.NET 6.0+**: Prefer `dotnet-minimal-apis` if `Program.cs` is using the Top-level statements and `WebApplication.CreateBuilder`.
- **.NET Framework 4.x**: Currently handled by `dotnet` (Router) as a fallback if no specific legacy skill exists.
