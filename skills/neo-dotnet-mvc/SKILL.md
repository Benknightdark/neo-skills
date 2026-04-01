---
name: neo-dotnet-mvc
version: "1.0.0"
category: "Framework"
description: "開發 ASP.NET Core MVC 應用程式的專家指引。支援從 .NET 6 (LTS) 到 .NET 10 (LTS) 的現代開發模式，涵蓋視圖模型、標籤協助程式、視圖元件與伺服器端渲染的最佳實踐。"
compatibility: "Supports .NET 6.0 through 10.0 environments. Requires .NET SDK installed locally."
---

# .NET MVC Expert Skill

## Trigger On
- The user requests to create, debug, refactor, or review ASP.NET Core MVC applications.
- The project contains `Views` and `Controllers` directories and inherits from `Controller` (not `ControllerBase`).
- The target framework is .NET 6.0 (LTS) and above.
- There is a need to optimize Server-Side Rendering (SSR) performance or improve view organizational structure.

## Workflow
1. **Perceive (Architecture Awareness):**
   - Check `.csproj` to identify `TargetFramework`.
   - Analyze `Views/Shared` to confirm existing configurations for layouts and partial views.
   - Identify whether Tag Helpers and static resource versioning are enabled.
2. **Reason (Planning Phase):**
   - Evaluate whether complex Partial Views need to be migrated to View Components.
   - Determine whether custom Tag Helpers are needed to simplify UI logic.
   - Choose an appropriate ViewModel organization method based on project scale.
3. **Act (Execution Phase):**
   - Write high-quality controllers and strongly-typed views.
   - Implement data validation (Data Annotations) and integrate them into ViewModels.
   - Configure and use Tag Helpers to ensure the semantic correctness of forms and links.
4. **Validate (Standard Validation):**
   - Validate whether page rendering conforms to the expected HTML structure.
   - Check whether model validation correctly operates on both the frontend and backend.
   - Ensure Antiforgery tokens are correctly applied to all state-modifying requests.

## Feature Roadmap (.NET 6 - 10)

### .NET 6 & 7 (Foundation)
- **Tag Helpers**: Declarative HTML attribute extensions.
- **View Components**: Logic-driven UI block modularization.
- **Cache Tag Helper**: Server-side view fragment caching.
- **Nullable Views**: Better Razor null safety support.

### .NET 8 & 9 (Productivity)
- **Blazor Integration**: Hybrid development support for MVC and Blazor components.
- **Antiforgery Improvements**: Global anti-forgery automatic validation optimization.
- **Keyed Services in Controllers**: Finer-grained dependency injection support.
- **Native AOT for MVC**: Metadata compilation optimization tailored for AOT.

### .NET 10+ (Cutting Edge)
- **Extension Members for IHtmlHelper**: Extending view helper functions.
- **Advanced Serialization in Views**: Performance optimization for large view models.

## Coding Standards
- **Strongly Typed Views**: All views must have an explicit `@model`.
- **ViewModel Separation**: Strictly prohibit exposing database entities directly to views.
- **Naming**: View models must end with `ViewModel`, action methods prioritize asynchronous patterns.
- **Formatting**: Follow the Allman style and use Tag Helpers instead of HTML Helpers.

## Deliver
- **Version-Optimized MVC Code**: Provide modernized controllers, models, and views suitable for the target version.
- **UI Architecture Suggestions**: Provide design suggestions for view components and Tag Helpers.
- **Validation Logic**: Provide a complete model validation and error prompting implementation plan.

## Validate
- Ensure the code complies with C# 10+ syntax standards.
- Validate endpoints correctly handle model validation failures and return form states.
- Confirm static resources and scripts are correctly cached via `asp-append-version`.

## Documentation
### Official References
- [Overview of ASP.NET Core MVC](https://learn.microsoft.com/en-us/aspnet/core/mvc/overview)
- [Tag Helpers in ASP.NET Core](https://learn.microsoft.com/en-us/aspnet/core/mvc/views/tag-helpers/intro)
- [View components in ASP.NET Core](https://learn.microsoft.com/en-us/aspnet/core/mvc/views/view-components)

### Internal References
- [MVC Coding Style and Naming Conventions](reference/coding-style.md)
- [MVC Anti-Patterns and Best Practices](reference/anti-patterns.md)
- [MVC Modern Patterns Guide](reference/patterns.md)
