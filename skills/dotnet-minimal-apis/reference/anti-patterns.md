# Minimal APIs Anti-Patterns

Avoid these common mistakes when building Minimal APIs.

## 1. Bloated `Program.cs`

Do not put hundreds of routes and business logic directly in `Program.cs`. Use `MapGroup` and extension methods to keep the entry point clean.

## 2. Sync-over-Async

Avoid using synchronous database calls or long-running CPU-bound work in API handlers. Always prefer `async/await`.

## 3. Ignoring `CancellationToken`

Failing to pass `CancellationToken` to downstream services can lead to wasted resources when a client cancels the request.

```csharp
// BAD
app.MapGet("/data", async (IDataService service) => await service.GetDataAsync());

// GOOD
app.MapGet("/data", async (IDataService service, CancellationToken ct) => await service.GetDataAsync(ct));
```

## 4. Mixing Results & TypedResults

Be consistent. Using `TypedResults` everywhere makes unit testing significantly easier. Avoid returning generic `IResult` when more specific types are known.

## 5. Manual Error Responses

Avoid manually building `400 Bad Request` or `500 Error` responses with custom JSON. Use `TypedResults.Problem()` or `TypedResults.ValidationProblem()` to adhere to **RFC 7807 Problem Details** standard.

## 6. Over-dependence on Controllers

Do not try to force Controller logic into Minimal APIs or vice versa. Use Minimal APIs for what they excel at: high-performance, lightweight services.
