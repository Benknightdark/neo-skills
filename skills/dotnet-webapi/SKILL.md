---
name: dotnet-webapi
version: "1.1.0"
category: "Web"
description: "協助遵循最新產業最佳實踐來開發 ASP.NET Core Web API。涵蓋控制器設計、動作過濾器、問題詳情與 API 版本控制。"
compatibility: "Requires ASP.NET Core 6+, supports up to .NET 10.0."
---

# ASP.NET Core Web API

## Trigger On

- building new HTTP APIs using Controllers
- maintaining legacy or enterprise-grade controller-based APIs
- implementing cross-cutting concerns (logging, validation, error handling) in APIs
- refactoring logic from controllers to services
- implementing API versioning or security enhancements

## Workflow

1. **Perceive (Perception Phase):**
   - Use `grep_search` to locate `[ApiController]` and `[Route]` attributes.
   - Detect if the project uses `Startup.cs` or the modern `Program.cs` pattern.
   - Identify the dependency injection pattern (Standard vs. Primary Constructors).
   - Check for API Versioning packages (`Asp.Versioning.Http`).
2. **Reason (Planning Phase):**
   - Decide on the Controller structure (e.g., grouping by Domain).
   - Define Request/Response DTOs as `record` for immutability.
   - Produce a **Web API Implementation Plan** (in Traditional Chinese) covering Routes, DTOs, and Security requirements.
3. **Act (Execution Phase):**
   - Implement "Thin Controllers" delegating to services or MediatR.
   - Use **Primary Constructors** (.NET 8+) for cleaner dependency injection.
   - Apply `ProducesResponseType` and OpenAPI metadata.
   - Use `TypedResults` where appropriate (compatible with Controllers in modern .NET).
4. **Validate (Validation Phase):**
   - Ensure all public endpoints are documented via OpenAPI.
   - Verify `CancellationToken` propagation to all async calls.
   - Check that domain entities are NOT leaked in response types.
   - Confirm that validation filters are active and returning Problem Details.

## Best Practices & Patterns

### Modern Controller with Primary Constructors (.NET 8+)
```csharp
[ApiController]
[Route("api/[controller]")]
public class ProductsController(IProductService service, ILogger<ProductsController> logger) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<ProductResponse>>> GetAll(CancellationToken ct)
    {
        logger.LogInformation("Fetching all products");
        return Ok(await service.GetAllAsync(ct));
    }
}
```

### Problem Details & TypedResults
```csharp
[HttpPost]
[ProducesResponseType(StatusCodes.Status201Created)]
[ProducesResponseType(StatusCodes.Status400BadRequest)]
public async Task<Results<Created<ProductResponse>, BadRequest<ProblemDetails>>> Create(CreateProductRequest request)
{
    var result = await service.CreateAsync(request);
    return TypedResults.Created($"/api/products/{result.Id}", result);
}
```

### Keyed Services Injection (.NET 8+)
```csharp
[HttpGet("export")]
public IActionResult Export([FromKeyedServices("csv-exporter")] IExporter exporter)
{
    return File(exporter.Export(), "text/csv");
}
```

## Documentation

- [Controllers Overview](https://learn.microsoft.com/en-us/aspnet/core/web-api/?view=aspnetcore-10.0)
- [API Versioning Guide](https://github.com/dotnet/aspnet-api-versioning)

### References

- [patterns.md](reference/patterns.md) - architectural and performance patterns
- [anti-patterns.md](reference/anti-patterns.md) - common Web API mistakes to avoid

## Deliver

- **Web API Implementation Plan:** Summary of routes, DTOs, and filters (in Traditional Chinese).
- **Modern Controller Code:** Clean, thin controllers using Primary Constructors and async patterns.
- **Robust DTOs:** Record-based data transfer objects.
- **OpenAPI Integration:** Fully documented endpoints.

## Validate

- Endpoints return standard HTTP status codes.
- Problem Details (RFC 7807) are returned for all error cases.
- `CancellationToken` is propagated to the database layer.
- No business logic exists within the controller actions.
