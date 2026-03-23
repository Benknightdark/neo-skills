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
1. Detect the real stack first:
   - target frameworks and SDK version
   - `LangVersion`
   - project SDKs and workload hints
   - hosting model and app entry points
   - test framework and runner
   - analyzers, formatters, coverage, and CI quality gates
2. Route to the narrowest platform skill as soon as the stack is known:
   - Web: `dotnet-aspnet-core`, `dotnet-minimal-apis`, `dotnet-webapi`
3. If more than one specialized skill applies, prefer the one closest to the user-visible behavior first, then pull in the quality or tooling skill second.
4. Do not stop at this skill once a narrower match exists. This skill should classify and hand off, not become a generic dumping ground.
5. After code changes, validate with the repository's actual build, test, and quality workflow instead of generic `.NET` commands.

## Routing Heuristics
- If the repo contains `Microsoft.NET.Sdk.Web`, start from a web skill, not generic `.NET`.
- If the repo contains Blazor, Razor Components, or `.razor` pages, prefer `dotnet-blazor`.
- If the repo contains `package.json`, frontend lint configs, or browser-facing asset pipelines inside the `.NET` solution, prefer the dedicated frontend analysis skills instead of generic `.NET`.
- If the user asks about “which skill should I use?”, answer with the narrowest matching skill and explain why in one short sentence.
- If no narrower skill matches, keep the work here and stay explicit about the missing specialization.

## Deliver
- the correct specialized skill choice for the task
- repo-compatible code or documentation changes that stay aligned with the detected stack
- validation evidence that matches the real project runner and quality toolchain

## Validate
- the chosen downstream skill actually exists in the catalog
- platform assumptions match project SDKs, packages, and workloads
- generic guidance has been replaced by framework-specific guidance whenever possible
- runner-specific commands are not mixed incorrectly
- language or runtime features are only used when the repo supports them

## Documentation
### References
- [`references/routing.md`](references/routing.md)
- Decision tree for routing tasks to specialized .NET skills, including app model classification and cross-cutting concern handling.
- [`references/detection.md`](references/detection.md)
- Project detection patterns for identifying SDK types, target frameworks, workloads, language versions, and app models.
