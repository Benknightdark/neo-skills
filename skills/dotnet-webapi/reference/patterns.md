# ASP.NET Core Web API Patterns

## 1. Architectural Patterns

### Clean Architecture
Decouple business logic from external dependencies (databases, UI, frameworks).

- **Domain**: Entities, Value Objects, Domain Exceptions.
- **Application**: Commands & Queries (CQRS), Interfaces, DTOs, Validation.
- **Infrastructure**: Database implementation (EF Core), External API clients.
- **API (Web)**: Controllers, Filters, Middleware.

### CQRS with MediatR
Use **MediatR** to decouple the request from the handler.

```csharp
[HttpPost]
public async Task<ActionResult<int>> Create(CreateProductCommand command)
{
    var id = await _mediator.Send(command);
    return CreatedAtAction(nameof(GetById), new { id }, id);
}

// Handler
public class CreateProductHandler(IAppDbContext context) : IRequestHandler<CreateProductCommand, int>
{
    public async Task<int> Handle(CreateProductCommand command, CancellationToken ct)
    {
        var product = new Product { Name = command.Name, Price = command.Price };
        context.Products.Add(product);
        await context.SaveChangesAsync(ct);
        return product.Id;
    }
}
```

## 2. Controller & Action Patterns

### Thin Controllers
Controllers should only handle routing, model binding, and returning results.

```csharp
[ApiController]
[Route("api/[controller]")]
public class ProductsController(IProductService service) : ControllerBase
{
    [HttpGet("{id}")]
    public async Task<ActionResult<ProductResponse>> Get(int id)
    {
        var product = await service.GetByIdAsync(id);
        return product != null ? Ok(product) : NotFound();
    }
}
```

### Result Pattern Integration
Use a `Result<T>` type to handle business errors without exceptions.

```csharp
[HttpPost]
public async Task<ActionResult> Create(CreateProductRequest request)
{
    var result = await service.CreateAsync(request);
    
    return result.IsSuccess 
        ? CreatedAtAction(nameof(GetById), new { id = result.Value.Id }, result.Value)
        : result.Error.ToActionResult(); // Extension to map Result.Error to ObjectResult
}
```

## 3. Error Handling Patterns

### Global Problem Details
Use standardized **RFC 7807 Problem Details** for all error responses.

```csharp
// Program.cs
app.UseExceptionHandler(); // Maps exceptions to ProblemDetails

// Controller
if (id <= 0)
{
    return Problem(
        detail: "Product ID must be greater than zero.",
        statusCode: StatusCodes.Status400BadRequest,
        title: "Invalid ID");
}
```

## 4. Performance & Data Patterns

### Read-Only Queries (AsNoTracking)
Improve performance for GET requests by disabling change tracking.

```csharp
public async Task<List<ProductResponse>> GetAllAsync(CancellationToken ct)
{
    return await dbContext.Products
        .AsNoTracking()
        .Select(p => new ProductResponse(p.Id, p.Name))
        .ToListAsync(ct);
}
```

### Distributed Caching (IDistributedCache)
Cache expensive results across multiple server instances.

```csharp
public async Task<ProductResponse?> GetByIdAsync(int id)
{
    var cacheKey = $"product-{id}";
    var cached = await cache.GetStringAsync(cacheKey);
    
    if (cached != null) 
        return JsonSerializer.Deserialize<ProductResponse>(cached);

    var product = await dbContext.Products.FindAsync(id);
    if (product != null)
    {
        await cache.SetStringAsync(cacheKey, JsonSerializer.Serialize(product), 
            new DistributedCacheEntryOptions { SlidingExpiration = TimeSpan.FromMinutes(10) });
    }
    
    return product;
}
```

## 5. Security & Versioning

### API Versioning (Asp.Versioning.Http)
Prioritize URL versioning for clear client expectations.

```csharp
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/[controller]")]
public class ProductsController : ControllerBase { ... }
```

### Rate Limiting (Microsoft.AspNetCore.RateLimiting)
Protect your API from abuse and DDoS attacks.

```csharp
// Program.cs
builder.Services.AddRateLimiter(options =>
{
    options.AddFixedWindowLimiter("fixed", opt =>
    {
        opt.PermitLimit = 100;
        opt.Window = TimeSpan.FromMinutes(1);
    });
});

// Controller
[EnableRateLimiting("fixed")]
public class ProductsController : ControllerBase { ... }
```
