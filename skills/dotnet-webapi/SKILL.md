---
name: dotnet-webapi
version: "1.0.0"
category: "Web"
description: "協助遵循最新產業最佳實踐來開發 ASP.NET Core Web API。涵蓋控制器設計、動作過濾器、問題詳情 (Problem Details) 與 API 版本控制。"
compatibility: "Requires ASP.NET Core 6+, preferably .NET 8+."
---

# ASP.NET Core Web API

## Trigger On

- building new HTTP APIs using Controllers
- maintaining legacy or enterprise-grade controller-based APIs
- implementing cross-cutting concerns (logging, validation, error handling) in APIs
- refactoring logic from controllers to services
- implementing API versioning or security enhancements

## Documentation

- [Controllers Overview](https://learn.microsoft.com/en-us/aspnet/core/web-api/?view=aspnetcore-10.0)
- [Action Results](https://learn.microsoft.com/en-us/aspnet/core/web-api/action-return-types?view=aspnetcore-10.0)
- [Filters in Web API](https://learn.microsoft.com/en-us/aspnet/core/mvc/controllers/filters?view=aspnetcore-10.0)
- [Model Binding](https://learn.microsoft.com/en-us/aspnet/core/mvc/models/model-binding?view=aspnetcore-10.0)
- [API Versioning](https://github.com/dotnet/aspnet-api-versioning)

### References

- [patterns.md](reference/patterns.md) - detailed architectural, controller, and performance patterns
- [anti-patterns.md](reference/anti-patterns.md) - common Web API mistakes like fat controllers and mass assignment

## Workflow

1. **Analyze Environment**: Confirm ASP.NET Core version and architectural style (Controllers).
2. **Define DTOs**: Create separate request and response records to avoid exposing domain entities.
3. **Implement Controllers**: Use thin controllers that delegate business logic to services or MediatR.
4. **Apply Validation**: Use FluentValidation with action filters or global middleware.
5. **Handle Errors**: Implement global exception handling returning RFC 7807 Problem Details.
6. **Optimize Data**: Use `.AsNoTracking()` for read operations and propagate `CancellationToken`.

## Basic Patterns

### Controller Basics
```csharp
[ApiController]
[Route("api/[controller]")]
public class ProductsController(IProductService service) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<ProductResponse>>> GetAll(CancellationToken ct)
    {
        var products = await service.GetAllAsync(ct);
        return Ok(products);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<ProductResponse>> GetById(int id, CancellationToken ct)
    {
        var product = await service.GetByIdAsync(id, ct);
        return product != null ? Ok(product) : NotFound();
    }
}
```

### Action Filters
```csharp
public class ValidationFilter : IAsyncActionFilter
{
    public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        if (!context.ModelState.IsValid)
        {
            context.Result = new BadRequestObjectResult(context.ModelState);
            return;
        }
        await next();
    }
}
```

### Problem Details
```csharp
// In Program.cs
builder.Services.AddProblemDetails();

// In Controller
if (id <= 0)
{
    return TypedResults.Problem(
        detail: "ID must be a positive integer",
        statusCode: StatusCodes.Status400BadRequest,
        title: "Invalid Parameter");
}
```

## Anti-Patterns to Avoid

| Anti-Pattern | Why It's Bad | Better Approach |
|--------------|--------------|-----------------|
| Sync over Async | Thread starvation | Use `async/await` throughout |
| Mass Assignment | Security risk | Use DTOs for input |
| Fat Controllers | Hard to test | Use Service Layer or CQRS |
| Exposing Entities | Tight coupling | Use Response DTOs |
| Raw Exceptions | Leaks internals | Use Problem Details |
| N+1 Queries | Performance hit | Use Eager Loading (`Include`) |

## Deliver

- clean, thin Controllers delegating to services
- robust DTOs for input/output data transfer
- standardized error responses via Problem Details
- propagated `CancellationToken` for resource management
- comprehensive OpenAPI (Swagger) documentation

## Validate

- endpoints return appropriate HTTP status codes (200, 201, 400, 404, etc.)
- validation logic prevents invalid data from reaching the service layer
- database queries are optimized (no-tracking for reads)
- API documentation matches implementation
- controllers are free of business and persistence logic
