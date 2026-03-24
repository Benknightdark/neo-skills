---
name: csharp
version: "1.4.0"
category: "Core"
description: "跨版本 C# 專家技能 (10, 11, 12, 13, 14+)。支援從 .NET 6 (LTS) 到 .NET 10 (LTS) 的現代開發模式，涵蓋 File-scoped namespaces 到 Extension Types 的全方位演進。"
compatibility: "Supports C# 10 through 14. Adaptive to .NET 6.0, 7.0, 8.0, 9.0, and 10.0 environments."
---

# Modern C# (10+) Expert Skill

## Trigger On
- The user asks to write, debug, refactor, or review C# code.
- The project directory contains `*.cs`, `*.csproj`, or single-file C# scripts.
- The target framework is .NET 6.0 (LTS) and above.
- Code modernization is needed (e.g., converting legacy nested namespaces to File-scoped namespaces).

## Workflow
1. **Perceive (Version Awareness):**
   - Check `.csproj` to identify `TargetFramework` and determine the syntax upper limit:
     - `net6.0`: C# 10 (File-scoped namespaces, Global usings).
     - `net7.0`: C# 11 (Raw string literals, Required members).
     - `net8.0`: C# 12 (Primary Constructors, Collection Expressions).
     - `net9.0`: C# 13 (`params` collections, `Lock` object).
     - `net10.0`: C# 14 (Extension members, `field` keyword).
2. **Reason (Planning Phase):**
   - Evaluate the modernization level of the current code to determine the refactoring strategy.
   - In lower version environments (like .NET 6), avoid using higher version syntax (like Primary Constructors), but prioritize using File-scoped namespaces.
   - In higher version environments, actively adopt new features to reduce boilerplate code.
3. **Act (Execution Phase):**
   - Write high-quality code, prioritizing "syntactic sugar" to improve readability.
   - Implement strong typing and immutable data structures (`record`, `record struct`).
   - Utilize **Interpolated string handlers** and **Span<T>** to optimize performance-sensitive paths.
4. **Validate (Standard Validation):**
   - Validate the safety of NRT (Nullable Reference Types).
   - Check if asynchronous operations correctly handle cancellation tokens (`CancellationToken`).
   - Ensure naming conventions comply with official .NET recommendations.

## Feature Roadmap (C# 10 - 14)

### C# 10 & 11 (Foundation)
- **File-scoped Namespaces:** Reduce indentation levels.
- **Global Using Directives:** Centralize common namespaces management.
- **Raw String Literals:** `"""..."""` easily handle multi-line and special characters.
- **Required Members:** Ensure required properties during object initialization.
- **List Patterns:** `if (list is [1, 2, ..])` powerful collection matching.

### C# 12 & 13 (Productivity)
- **Primary Constructors:** Simplify class-level dependency injection.
- **Collection Expressions:** Uniformly use `[1, 2, 3]` to initialize collections.
- **`params` Collections:** Method parameters support various collection types.
- **Implicit Span Conversion:** Handle memory-safe code more naturally.

### C# 14+ (Cutting Edge)
- **Extension Members:** Extension properties, operators, and static members.
- **`field` Keyword:** Directly access backing fields in property logic.
- **Null-conditional Assignment:** `target?.Property = value;`.
- **Scripting:** Support `dotnet run file.cs` for direct execution.

## Coding Standards
- **Clean Structure:** Prioritize using File-scoped namespaces.
- **Immutability:** Use `record` for Data Transfer Objects (DTO).
- **Performance:** Use `Span<T>` and `ReadOnlySpan<char>` in critical paths.
- **Async Safety:** Always pass `CancellationToken`, avoid `.Result` or `.Wait()`.

## Deliver
- **Version-Optimized Code:** Provide the most appropriate modernized syntax code based on the target C# version.
- **Modernization Insights:** Provide specific refactoring suggestions for upgrading from older C# syntax to new features (e.g., from nested namespaces to File-scoped namespaces).
- **Syntax Explanations:** Clearly explain the design intent and syntax advantages behind the new C# features used.

## Validate
- Ensure the provided code complies with the syntax specifications of the target C# version.
- Validate whether the code follows C# strong typing and Null safety (NRT) principles.
- Confirm the code has good readability and best practices at the pure C# language level (e.g., proper use of `Span<T>`, `record`, etc.).

## Documentation
### Official References
- [What's new in C# 14 (Extension Members, field keyword)](https://learn.microsoft.com/en-us/dotnet/csharp/whats-new/csharp-14)
- [What's new in C# 13 (params collections, Lock object)](https://learn.microsoft.com/en-us/dotnet/csharp/whats-new/csharp-13)
- [What's new in C# 12 (Primary Constructors, Collection Expressions)](https://learn.microsoft.com/en-us/dotnet/csharp/whats-new/csharp-12)
- [What's new in C# 11 (Raw String Literals, Required Members)](https://learn.microsoft.com/en-us/dotnet/csharp/whats-new/csharp-version-history#c-version-11)
- [What's new in C# 10 (File-scoped Namespaces, Global Usings)](https://learn.microsoft.com/en-us/dotnet/csharp/whats-new/csharp-version-history#c-version-10)
- [Nullable Reference Types](https://learn.microsoft.com/en-us/dotnet/csharp/nullable-references)

### Internal References
- [C# Coding Style and Naming Conventions Guide](reference/coding-style.md)
- [C# Anti-Patterns and Best Practices](reference/anti-patterns.md)
- [Modern C# Patterns Guide](reference/patterns.md)
