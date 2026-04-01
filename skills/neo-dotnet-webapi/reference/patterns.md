# .NET Web API Modern Patterns

This document introduces recommended development patterns in the Controller-based mode for .NET 6 to 10+.

## 1. Error Handling and Response Formats

### 1.1 Problem Details (RFC 7807)
**Recommendation**: Unified use of `ProblemDetails` to handle error responses. In .NET 7+, call `builder.Services.AddProblemDetails()` in `Program.cs`.

### 1.2 Global Exception Handler (IExceptionHandler) - .NET 8+
**Recommendation**: Implement the `IExceptionHandler` interface to centrally handle uncaught exceptions, replacing the legacy Middleware approach.

---

## 2. Parameter Binding and Validation

### 2.1 Complex Type Binding
**Recommendation**: Make good use of `[FromRoute]`, `[FromQuery]`, `[FromBody]`, and `[FromHeader]` to explicitly define binding sources.

### 2.2 FluentValidation Integration
**Recommendation**: Combine with `FluentValidation` for complex model validation, separating validation logic from DTO definitions.

---

## 3. Architectural Design

### 3.1 API Versioning (Asp.Versioning.Http)
**Recommendation**: Use the official versioning package to support multiple coexisting versions via URL or Header.
```csharp
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/[controller]")]
```

### 3.2 Action Filters
**Recommendation**: For cross-cutting concerns (like permission checks, logging), implement `IAsyncActionFilter`.

---

## 4. Documentation and Performance

### 4.1 Swagger/OpenAPI Enrichment
**Recommendation**: Use `[ProducesResponseType]` to mark all possible HTTP status codes and response types.

### 4.2 Output Caching - .NET 7+
**Recommendation**: Use `builder.Services.AddOutputCache()` to provide high-performance server-side caching, reducing pressure on controllers.

---

## 5. C# 14+ Forward-looking Patterns

### 5.1 Extension Types for Controllers
**Recommendation**: Leverage Extension Types to expand common auxiliary properties or methods for the base `ControllerBase`.
