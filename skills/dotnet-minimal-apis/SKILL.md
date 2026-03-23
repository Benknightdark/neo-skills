---
name: dotnet-minimal-apis
version: "1.1.0"
category: "Web"
description: "開發高效能、輕量級 .NET Minimal API 的專家指引。涵蓋路由群組、端點過濾器與適合現代服務的輕量化實作模式。"
compatibility: "Requires ASP.NET Core 6+, supports up to .NET 10.0 for full features."
---

# Minimal APIs

## Trigger On

- building new HTTP APIs in ASP.NET Core
- creating lightweight microservices
- choosing between Minimal APIs and controllers
- organizing endpoints with route groups
- implementing validation and filters

## Workflow

1. **Perceive (Perception Phase):**
   - Use `grep_search` to find `MapGet`, `MapPost`, `MapGroup` in `Program.cs` or extension files.
   - Detect if the project uses `.AddOpenApi()` (.NET 9+) or `Swashbuckle` (.NET 8 and earlier).
   - Check for `IEndpointRouteBuilder` extensions to locate endpoint definitions outside `Program.cs`.
2. **Reason (Planning Phase):**
   - Decide if a new endpoint should be in `Program.cs` or a new extension class.
   - Choose between `TypedResults` (strongly-typed) and `Results` (dynamic).
   - Produce a **Minimal API Implementation Plan** (in Traditional Chinese) covering Routes, DTOs, and Filters.
3. **Act (Execution Phase):**
   - Apply the changes using extension methods for better organization.
   - Use `TypedResults` for all new endpoints to ensure type safety.
   - Add proper OpenAPI metadata (`.WithName`, `.WithSummary`).
4. **Validate (Validation Phase):**
   - Verify parameter binding (Query, Header, Body, Form).
   - Ensure `CancellationToken` is supported for long-running tasks.
   - Check if the OpenAPI spec matches the implementation.

## Best Practices & Patterns

### Modern OpenAPI (.NET 9+)
```csharp
builder.Services.AddOpenApi(); // .NET 9+ Native support

app.MapOpenApi(); // Map the spec endpoint

app.MapGet("/products", GetProducts)
    .WithName("GetProducts")
    .WithSummary("取得所有產品");
```

### Form Binding & Anti-forgery (.NET 8+)
```csharp
app.MapPost("/todo", async (HttpContext context, [FromForm] Todo todo) => 
{
    // Native support for Form binding and Anti-forgery
    return TypedResults.Ok(todo);
}).DisableAntiforgery(); // Use carefully
```

### Keyed Services (.NET 8+)
```csharp
app.MapGet("/service/{id}", ([FromKeyedServices("my-service")] IMyService service) => 
{
    return TypedResults.Ok(service.GetData());
});
```

### Organizing Larger APIs (Extension Method Pattern)
```csharp
public static class ProductEndpoints
{
    public static RouteGroupBuilder MapProductEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/products").WithTags("Products");
        group.MapGet("/", GetAll);
        return group;
    }
}
// In Program.cs: app.MapProductEndpoints();
```

## Documentation

- [Minimal APIs Overview](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/minimal-apis?view=aspnetcore-10.0)
- [Filters in Minimal APIs](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/minimal-apis/min-api-filters?view=aspnetcore-10.0)

### References

- [patterns.md](references/patterns.md) - detailed route groups, filters, TypedResults patterns, and testing
- [anti-patterns.md](references/anti-patterns.md) - common Minimal API mistakes to avoid

## Deliver

- **Minimal API Implementation Plan:** A brief summary of routes, DTOs, and logic (in Traditional Chinese).
- **Clean Code:** Organized endpoints using extension methods and `TypedResults`.
- **OpenAPI Documentation:** Proper metadata for all endpoints.

## Validate

- Endpoints return correct status codes (REST conventions).
- Validation filters catch invalid input.
- `CancellationToken` is correctly propagated.
- Handlers are testable and dependencies are explicitly injected.
