# .NET Skill Routing Decision Tree

Use this guide to route .NET tasks to the most specific skill available.

## 1. App Model Classification

Identify the primary hosting or execution model:

- **Web / API**
  - Web API: `dotnet-webapi`
  - Minimal APIs: `dotnet-minimal-apis`
  - MVC: `dotnet-mvc`

## 2. Cross-Cutting Concerns

Even if an app model is identified, route specific concerns to these companion skills:

- **Quality & CI**
  - Code Review: `dotnet-code-review`
  - Static Analysis: `dotnet-code-analysis`
  - Testing: `dotnet-xunit`, `dotnet-mstest`, `dotnet-tunit`
  - Code Coverage: `dotnet-coverlet`, `dotnet-reportgenerator`

- **Standards & Formatting**
  - Style/Format: `dotnet-format`
  - Complexity analysis: `dotnet-complexity`

- **Modernization**
  - C# Language features: `dotnet-modern-csharp`
  - Project Setup: `dotnet-project-setup`

## 3. Decision Logic

1. **Specific over General**: If you see `Microsoft.NET.Sdk.Web`, do not use `dotnet`. Use a web-specific skill.
2. **Behavior over Tooling**: If the task is "Fix a bug in the API", use `dotnet-webapi`. If the task is "Add a unit test for the API", use `dotnet-webapi` first for context, then pull in `dotnet-xunit` logic.
3. **Legacy over Modern**: If the target framework is `.NET Framework 4.x`, use `dotnet-legacy-aspnet` or `dotnet-wcf`.
