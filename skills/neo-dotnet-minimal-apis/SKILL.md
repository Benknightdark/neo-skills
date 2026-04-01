---
name: neo-dotnet-minimal-apis
version: "1.0.0"
category: "Framework"
description: "開發高效能、輕量級 .NET Minimal API 的專家指引。支援從 .NET 6 (LTS) 到 .NET 10 (LTS) 的現代開發模式，涵蓋路由群組、端點過濾器與符合 OpenAPI 規範的強型別回應。"
compatibility: "Supports .NET 6.0 through 10.0 environments. Requires .NET SDK installed locally."
---

# .NET Minimal APIs Expert Skill

## Trigger On
- The user requests to create, debug, refactor, or review .NET Minimal APIs.
- The project's `Program.cs` contains `WebApplication.CreateBuilder(args)` and is not configured with a Controllers directory.
- The target framework is .NET 6.0 (LTS) and above.
- There is a need to optimize API performance or simplify Web API architecture.

## Workflow
1. **Perceive (Architecture Awareness):**
   - Check `.csproj` to identify `TargetFramework`.
   - Analyze `Program.cs` to distinguish whether it uses simple endpoints or adopts a Module-based or Vertical Slice organization.
   - Identify whether OpenAPI (Swagger) support has been configured.
2. **Reason (Planning Phase):**
   - Evaluate whether "Route Groups" need to be introduced to optimize organizational structure.
   - Determine whether to use "Endpoint Filters" to handle cross-cutting concerns (such as parameter validation).
   - Choose the most appropriate syntax based on the .NET version (e.g., `TypedResults` in .NET 7+).
3. **Act (Execution Phase):**
   - Write clean, high-performance Minimal API code, prioritizing Lambdas or extension methods.
   - Implement strong typing and DTOs (prioritize using `record`).
   - Integrate dependency injection, avoiding the Service Locator pattern.
4. **Validate (Standard Validation):**
   - Validate whether the endpoints correctly return expected HTTP status codes.
   - Check whether the generated OpenAPI documentation is complete.
   - Ensure asynchronous operations correctly pass the `CancellationToken`.

## Feature Roadmap (.NET 6 - 10)

### .NET 6 & 7 (Foundation)
- **Minimal Hosting**: Simplified startup process and top-level statements.
- **Route Groups**: Use `MapGroup` to consolidate prefixes and authentication.
- **Endpoint Filters**: Implement interception logic within Minimal APIs.
- **Typed Results**: Improved unit testing and Swagger support.

### .NET 8 & 9 (Productivity)
- **Antiforgery**: Built-in anti-forgery token support.
- **Form Binding**: Support for `[FromForm]` parameter binding.
- **HybridCache**: High-performance multi-level caching support.
- **OpenAPI Improvements**: Better OpenAPI code generation.

### .NET 10+ (Cutting Edge)
- **Native AOT Optimization**: AOT-optimized compilation tailored for Minimal APIs.
- **Enhanced Middleware Patterns**: New middleware designed for lightweight architectures.

## Coding Standards
- **Clean Routing**: Prioritize using extension methods to modularize routes.
- **Strong Typing**: Prioritize using `TypedResults` and `Results<T1, T2>`.
- **Async Safety**: Always accept and pass down `CancellationToken`.
- **DI Best Practices**: Services should be defined directly in the Handler parameters.

## Deliver
- **Version-Optimized API Code**: Provide the most appropriate modern API code based on the target .NET version.
- **Modular Architecture**: Provide structural suggestions for extracting `Program.cs` routes into extension methods.
- **OpenAPI Configuration**: Provide comprehensive Swagger/OpenAPI configuration suggestions.

## Validate
- Ensure the provided code executes correctly in a .NET 6+ environment.
- Validate endpoint security (authentication, authorization, Antiforgery).
- Check if the code complies with high-performance best practices for Minimal APIs (e.g., avoiding closures, reducing allocations).

## Documentation
### Official References
- [Minimal APIs Overview](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/minimal-apis)
- [Route groups and filters](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/minimal-apis/route-handlers)
- [Typed responses in Minimal APIs](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/minimal-apis/responses)

### Internal References
- [Minimal APIs Coding Style and Naming Conventions](reference/coding-style.md)
- [Minimal APIs Anti-Patterns and Best Practices](reference/anti-patterns.md)
- [Minimal APIs Modern Patterns Guide](reference/patterns.md)
