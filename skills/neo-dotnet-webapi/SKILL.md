---
name: neo-dotnet-webapi
version: "1.0.0"
category: "Framework"
description: "開發 ASP.NET Core Web API (Controller-based) 的專家指引。支援從 .NET 6 (LTS) 到 .NET 10 (LTS) 的現代開發模式，涵蓋控制器設計、Problem Details、全域異常處理與 API 版本控制。"
compatibility: "Supports .NET 6.0 through 10.0 environments. Requires .NET SDK installed locally."
---

# .NET Web API Expert Skill

## Trigger On
- The user requests to create, debug, refactor, or review ASP.NET Core Web APIs.
- The project contains a `Controllers` directory and inherits from `ControllerBase`.
- The target framework is .NET 6.0 (LTS) and above.
- There is a need for API code modernization (e.g., migrating from Middleware exception handling to .NET 8+ `IExceptionHandler`).

## Workflow
1. **Perceive (Architecture Awareness):**
   - Check `.csproj` to identify `TargetFramework`.
   - Analyze project structure to confirm whether it uses N-Tier architecture or Vertical Slice.
   - Identify existing cross-cutting concern handling methods (filters, middleware).
2. **Reason (Planning Phase):**
   - Evaluate whether to introduce the "Problem Details" standard.
   - Determine whether to use the .NET 8+ global exception handling mechanism.
   - Choose an appropriate versioning strategy based on project scale.
3. **Act (Execution Phase):**
   - Write high-quality controllers compliant with `[ApiController]` conventions.
   - Implement strongly-typed and immutable DTOs (prioritize `record`).
   - Integrate dependency injection, prioritizing Primary Constructors (C# 12+).
4. **Validate (Standard Validation):**
   - Validate whether Action return types comply with `ActionResult<T>` specifications.
   - Check NRT (Nullable Reference Types) safety.
   - Ensure asynchronous operations correctly pass down `CancellationToken`.

## Feature Roadmap (.NET 6 - 10)

### .NET 6 & 7 (Foundation)
- **Controllers Architecture**: Traditional controller patterns and attribute routing.
- **Problem Details**: Unified error response standards.
- **Output Caching**: High-performance server-side caching.
- **Nullable Reference Types**: Comprehensive null safety support.

### .NET 8 & 9 (Productivity)
- **IExceptionHandler**: More elegant centralized exception handling.
- **Antiforgery**: Built-in anti-forgery support for Web APIs.
- **Keyed Services**: More flexible dependency injection options.
- **HybridCache**: Multi-level caching optimization.

### .NET 10+ (Cutting Edge)
- **Extension Members for Controllers**: Extending base controller functionality.
- **Enhanced Serialization**: JSON optimization for large payloads.

## Coding Standards
- **Strong Typing**: Prioritize `ActionResult<T>` to improve Swagger support.
- **NRT Compliance**: Strictly enforce Null safety to reduce runtime errors.
- **Async Best Practices**: Always accept and pass `CancellationToken`.
- **Naming**: Controller names must end with `Controller`, async methods must end with `Async`.

## Deliver
- **Version-Optimized Web API Code**: Provide modernized controllers and configurations suitable for the target version.
- **Architectural Insights**: Provide refactoring suggestions for N-Tier or Clean Architecture.
- **Security Recommendations**: Provide security suggestions regarding Problem Details and exception handling.

## Validate
- Ensure the code complies with C# 10+ modern syntax standards.
- Validate endpoints correctly return error formats compliant with RFC 7807.
- Confirm the code has no resource leaks in the tested environment (correct use of `using` and async).

## Documentation
### Official References
- [ASP.NET Core Web API Overview](https://learn.microsoft.com/en-us/aspnet/core/web-api/)
- [Handle errors in ASP.NET Core web APIs (Problem Details)](https://learn.microsoft.com/en-us/aspnet/core/web-api/handle-errors)
- [Controller action return types in ASP.NET Core web API](https://learn.microsoft.com/en-us/aspnet/core/web-api/action-return-types)

### Internal References
- [Web API Coding Style and Naming Conventions](reference/coding-style.md)
- [Web API Anti-Patterns and Best Practices](reference/anti-patterns.md)
- [Web API Modern Patterns Guide](reference/patterns.md)
