---
name: dotnet
version: "1.0.0"
category: "Core"
description: "用於廣泛 .NET 工作的核心路由技能。首先根據應用模型與跨切點關注點對儲存庫進行分類，然後切換到最精確匹配的 .NET 技能，而不是停留在通用層級。"
compatibility: "Requires a .NET repository, solution, or project tree. Supports .NET 6.0 up to .NET 10.0."
---

# .NET Router Skill

## Trigger On
- the user asks for general `.NET` help without naming a narrower framework or tool
- implementing, debugging, reviewing, or refactoring C# or `.NET` code in a repo with multiple app models or frameworks
- deciding which `.NET` skill should own a task before editing code
- tasks that combine platform work with testing, quality, architecture, setup, or migration decisions

## Workflow
1. **Perceive (Perception Phase):**
   - Use `glob "**/*.csproj"` to locate project files.
   - Use `grep_search` to detect key patterns in `Program.cs` or `Startup.cs`.
   - Identify:
     - Target Framework (`<TargetFramework>`) and SDK version.
     - App Model (Web API, Minimal API, MVC, Worker, etc.).
     - Primary packages (EF Core, MediatR, etc.).
     - Test frameworks (xUnit, NUnit, MSTest).
2. **Reason (Routing Phase):**
   - Compare the detected stack against available specialized skills:
     - Web API: `dotnet-webapi`
     - Minimal APIs: `dotnet-minimal-apis`
     - MVC: `dotnet-mvc`
     - Generic C# / Interface Generation: `csharp-coding`
   - Produce a concise **Tech Stack Summary** (in Traditional Chinese) justifying the chosen route.
3. **Act (Execution Phase):**
   - Route to the narrowest platform skill as soon as the stack is known.
   - If more than one specialized skill applies, prefer the one closest to the user-visible behavior first.
   - Do not stop at this skill once a narrower match exists. This skill should classify and hand off.

## Routing Heuristics
- If the repo contains `Microsoft.NET.Sdk.Web` and uses `WebApplication.CreateBuilder`, route to `dotnet-minimal-apis` or `dotnet-webapi`.
- If the repo contains `Controllers` and `Views` folder with Razor files, route to `dotnet-mvc`.
- If the repo contains `package.json` or browser-facing assets inside the `.NET` solution, prefer dedicated frontend skills after the backend work is identified.
- If the user asks about “which skill should I use?”, answer with the narrowest matching skill and explain why in one short sentence.

## Deliver
- **Tech Stack Summary:** A brief summary of the detected environment (Framework, App Model, Quality Tools).
- **Correct Specialized Skill Choice:** Clear instruction on which skill to activate next.
- **Validation Evidence:** Brief explanation of why the chosen skill is the best fit for the repository.

## Validate
- The chosen downstream skill actually exists in the catalog.
- Platform assumptions match project SDKs, packages, and workloads.
- Language or runtime features (e.g., C# 12 Primary Constructors) are only used when the repo supports them.

## Documentation
### References
- [`references/routing.md`](references/routing.md)
- Decision tree for routing tasks to specialized .NET skills, including app model classification and cross-cutting concern handling.
- [`references/detection.md`](references/detection.md)
- Project detection patterns for identifying SDK types, target frameworks, workloads, language versions, and app models.
