# .NET Minimal APIs Modern Patterns

This document introduces recommended development patterns in the Minimal APIs domain for .NET 6 to 10+.

## 1. Architectural Patterns

### 1.1 Module-based Configuration
**Recommendation**: Use extension methods to extract routing configuration from `Program.cs`, keeping the startup file clean.
```csharp
// Program.cs
app.MapUserEndpoints();
app.MapOrderEndpoints();
```

### 1.2 Endpoint Filters (.NET 7+)
**Recommendation**: Use filters to handle cross-cutting logic (like validation, logging), instead of writing duplicate code within Handlers.
```csharp
group.MapPost("/", CreateUser)
     .AddEndpointFilter<ValidationFilter<UserDto>>();
```

---

## 2. Data Transfer and Validation

### 2.1 Use Record for DTOs
**Recommendation**: Combine with the `[AsParameters]` attribute to simplify the Handler's parameter list.
```csharp
// Use [AsParameters] to map from multiple sources
app.MapGet("/search", ([AsParameters] SearchCriteria criteria) => { ... });

public record SearchCriteria(string? Query, int Page = 1, int PageSize = 10);
```

### 2.2 Typed Results (.NET 7+)
**Recommendation**: Use `Results<T1, T2>` to enhance Swagger's automatic documentation capabilities and the convenience of unit testing.

---

## 3. Security and Documentation

### 3.1 OpenAPI (Swagger) Integration
**Recommendation**: Use `.WithOpenApi()` and `.WithName()` to explicitly mark endpoints.
```csharp
app.MapGet("/users", () => ...)
   .WithName("GetUsers")
   .WithOpenApi(operation => 
   {
       operation.Summary = "Get all users";
       return operation;
   });
```

### 3.2 Antiforgery (.NET 8+)
**Recommendation**: Use `.DisableAntiforgery()` or `.ValidateAntiforgery()` directly in Minimal APIs.

---

## 4. Performance Optimization

### 4.1 HybridCache (.NET 9+)
**Recommendation**: Use `HybridCache` instead of `IDistributedCache` for better serialization performance and to prevent cache stampedes.

### 4.2 Static Endpoint Optimization
**Recommendation**: For endpoints that do not depend on the request context, use static Lambdas to reduce closure allocations.
```csharp
app.MapGet("/health", static () => "Healthy");
```
