---
name: neo-dotnet
version: "1.0.0"
category: "Framework"
description: 用於廣泛 .NET 工作的核心路由技能。此技能將偵測本機安裝的 .NET SDK 版本（要求 .NET 6+），並根據使用者的問題，將任務引導或準備載入其他合適的子技能（例如 Minimal APIs, MVC, Web API, EF Core）。
compatibility: "Supports .NET 6.0 and above. Requires .NET SDK installed on the local machine."
---

# .NET Core Routing Skill

## Overview
This skill serves as the unified entry point for the .NET development environment. It ensures the system environment meets the requirements for modern .NET development, and has the capability to analyze user requirements, generate corresponding command-line operations, and route to the appropriate domain expert skills.

## Core Responsibilities (Perceive & Act)

1. **Environment Detection and Version Validation**
   - Run `dotnet --version` to check the currently installed SDK version.
   - **Mandatory requirement**: Only **.NET 6 or higher** is supported. If a version lower than .NET 6 is detected, prompt the user to upgrade.

2. **Execute Appropriate .NET CLI**
   - Provide or execute modern CLI commands based on the detected version and project state.
   - Examples:
     - Build and run: `dotnet build`, `dotnet run`
     - Test: `dotnet test`
     - Package management: `dotnet add package`, `dotnet tool restore`

3. **Requirement Analysis and Dynamic Skill Routing**
   - Determine the involved domain based on the user's specific problem or project architecture.
   - If the user's task falls into the following specific domains, please **prepare to load or suggest the user switch to** the corresponding sub-skill (please note that these sub-skills may not be implemented yet; inform the user of the future implementation direction):
     - **`neo-dotnet-minimal-apis`**: When the requirement is for lightweight routing development, high-performance microservices, and Controllers are not used.
     - **`neo-dotnet-webapi`**: When the requirement is for traditional RESTful API development following the controller pattern.
     - **`neo-dotnet-mvc`**: When the requirement involves Server-Side Rendering (SSR), Razor views, and ViewModels.
     - **`neo-dotnet-tag-helper`**: When the requirement is for developing custom Razor Tag Helpers using pure C# (without CSHTML), focusing on reusable UI components and logic.
     - **`neo-dotnet-ef-core`**: When the requirement involves database migrations, Linq query optimization, or model mapping.

## Usage Guidelines
When this skill is triggered, please prioritize checking the SDK environment, then answer the user's .NET-related questions. If the problem is found to belong to one of the four professional domains mentioned above, proactively suggest and prepare to delegate it to the corresponding expert skill for processing.

## Documentation

### Official References
- [.NET CLI Tools Overview](https://learn.microsoft.com/en-us/dotnet/core/tools/)
