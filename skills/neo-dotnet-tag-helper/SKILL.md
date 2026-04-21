# skills/neo-dotnet-tag-helper/SKILL.md
---
name: neo-dotnet-tag-helper
version: "1.0.0"
category: "Framework"
description: "開發 ASP.NET Core 6+ 自定義 Tag Helper 的專家指引。專注於純 C# 實作（無 CSHTML），支援強型別屬性、依賴注入與異步渲染（ProcessAsync）的最佳實踐。"
compatibility: "Supports .NET 6.0 through 10.0+ environments."
metadata:
  pattern: generator
  output-format: csharp
---

# .NET Tag Helper Expert Skill

## Trigger On
- The user requests to create, generate, or design a custom Razor Tag Helper in C#.
- The user wants to encapsulate complex HTML/UI logic into reusable custom tags without using Partial Views or CSHTML.
- The target framework is .NET 6.0 (LTS) and above.

## Workflow (Generator Pattern)

You are an expert C# Tag Helper generator. Follow these steps exactly to create robust, high-performance Tag Helpers.

### Step 1: Perceive & Gather Requirements (Inversion)
Before writing any code, ask the user to clarify the following if not already provided:
1. **Target HTML Tag**: What is the name of the custom tag in HTML? (e.g., `<my-button>`, `<user-card>`)
2. **Properties**: What parameters/attributes should this tag accept? (e.g., `theme`, `is-active`, `user-id`)
3. **Dependencies (DI)**: Does this tag need to query a database or call a service? (Needs Dependency Injection)
4. **Context**: Does it need to access `ViewContext` (e.g., to generate URLs or check model state)?

### Step 2: Reason & Design (Planning)
Based on the answers:
- **Class Naming**: Ensure the class name ends with `TagHelper` (e.g., `MyButtonTagHelper`).
- **Target Element**: Apply `[HtmlTargetElement("my-button")]`.
- **Properties**: Map HTML kebab-case attributes to C# PascalCase properties. Apply `[HtmlAttributeName("is-active")]` if necessary.
- **Method Selection**: 
  - If no IO/Async operations, override `Process`.
  - If using DI for database/API calls, override `ProcessAsync`.

### Step 3: Act (Code Generation)
Generate the complete C# class. **Strictly adhere to the following rules:**
1. Inherit from `Microsoft.AspNetCore.Razor.TagHelpers.TagHelper`.
2. Do **NOT** generate `.cshtml` files. All HTML must be constructed using `TagBuilder` inside the C# class.
3. If `ViewContext` is needed, use `[ViewContext]` and `[HtmlAttributeNotBound]`.
4. Manage content properly using `output.TagName`, `output.Attributes.SetAttribute`, and `output.Content.SetHtmlContent`.
5. Ensure Thread-Safety (do not store request-specific state in instance fields unless injected as scoped/transient).

### Step 4: Validate (Quality Check)
Review the generated code against these criteria before presenting it:
- Are all properties strongly typed?
- Is `TagBuilder` used instead of string concatenation for HTML elements?
- Is `ProcessAsync` used correctly if awaiting tasks?

## Deliverable
Present the C# code wrapped in a markdown code block. Briefly explain how to register it in `_ViewImports.cshtml` (e.g., `@addTagHelper *, YourAssemblyName`).

## Documentation
### Official References
- [Tag Helpers in ASP.NET Core](https://learn.microsoft.com/en-us/aspnet/core/mvc/views/tag-helpers/intro)
- [Authoring Tag Helpers](https://learn.microsoft.com/en-us/aspnet/core/mvc/views/tag-helpers/authoring)

### Internal References
- [Tag Helper Coding Style & Advanced Patterns](reference/coding-style.md)
- [Tag Helper Coding Conventions](reference/patterns.md)
- [Tag Helper Anti-Patterns](reference/anti-patterns.md)
