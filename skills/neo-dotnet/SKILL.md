---
name: neo-dotnet
description: >
  Use this skill when the user asks broad .NET questions or the project contains
  .sln/.csproj files and the exact ASP.NET/EF/C# subdomain is not yet clear. Detect
  the SDK/project shape, run or recommend .NET CLI commands, and route to Minimal
  APIs, Web API, MVC, Tag Helper, EF Core, or C# skills when appropriate.
compatibility: "Supports .NET 6.0 through .NET 11.0+. Requires .NET SDK installed on the local machine."
metadata:
  version: "1.1.0"
  category: "Framework"
---

# .NET Core Routing Skill

## Overview
This skill serves as the unified entry point for the .NET development environment. It ensures the system environment meets the requirements for modern .NET development, and has the capability to analyze user requirements, generate corresponding command-line operations, and route to the appropriate domain expert skills.

## Core Responsibilities (Perceive & Act)

1. **Environment Detection and Version Validation**
   - Run `dotnet --version` to check the currently installed SDK version.
   - **Mandatory requirement**: Only **.NET 6 or higher** is supported (including .NET 8 LTS, .NET 9, .NET 10 LTS, and .NET 11 STS). If a version lower than .NET 6 is detected, prompt the user to upgrade.
   - For `net11.0` target frameworks, verify developer environment has the .NET 11 SDK installed.

2. **Execute Appropriate .NET CLI**
   - Provide or execute modern CLI commands based on the detected version and project state.
   - Take advantage of modern tooling improvements:
     - In .NET 11+, the Native AOT CLI host and MSBuild server significantly reduce invocation latency.
     - Build and run: `dotnet build`, `dotnet run`
     - Test: `dotnet test` (with multi-architecture and cross-platform testing enhancements in .NET 11)
     - Package management: `dotnet add package`, `dotnet tool restore`

3. **Requirement Analysis and Dynamic Skill Routing**
   - Determine the involved domain based on the user's specific problem or project architecture.
   - If the user's task falls into the following specific domains, prepare to use or recommend the corresponding sub-skill:
     - **`neo-csharp`**: When the requirement involves writing, refactoring, or modernizing C# language code (C# 10 through C# 15, Union Types, pattern matching, async safety).
     - **`neo-dotnet-minimal-apis`**: When the requirement is for lightweight routing development, high-performance microservices, and Controllers are not used.
     - **`neo-dotnet-webapi`**: When the requirement is for traditional RESTful API development following the controller pattern.
     - **`neo-dotnet-mvc`**: When the requirement involves Server-Side Rendering (SSR), Razor views, and ViewModels.
     - **`neo-dotnet-tag-helper`**: When the requirement is for developing custom Razor Tag Helpers using pure C# (without CSHTML), focusing on reusable UI components and logic.
     - **`neo-dotnet-ef-core`**: When the requirement involves database migrations, Linq query optimization, model mapping, or EF Core 11 vector search.

## Usage Guidelines
When this skill is triggered, please prioritize checking the SDK environment, then answer the user's .NET-related questions. If the problem is found to belong to one of the professional domains mentioned above, proactively suggest and prepare to delegate it to the corresponding expert skill for processing.

## Documentation

### Official References
- [.NET 11 Overview & What's New](https://learn.microsoft.com/en-us/dotnet/core/whats-new/dotnet-11)
- [.NET CLI Tools Overview](https://learn.microsoft.com/en-us/dotnet/core/tools/)
