# Minimal APIs Best Practices & Patterns

## 1. Modular Routing with `MapGroup`

Avoid putting all routes in `Program.cs`. Use extension methods to group related routes.

```csharp
public static class TodoEndpoints
{
    public static RouteGroupBuilder MapTodoEndpoints(this IEndpointRouteBuilder routes)
    {
        var group = routes.MapGroup("/todos");
        
        group.MapGet("/", GetAllTodos);
        group.MapGet("/{id}", GetTodoById);
        
        return group;
    }
    
    // Implementation methods
}
```

## 2. Using `TypedResults` for Testability & OpenAPI

Always prefer `TypedResults` over `Results` as it provides concrete return types that are easier to unit test and help OpenAPI tools generate better documentation.

```csharp
public static async Task<Ok<Todo>> GetTodoById(int id, TodoDbContext db)
{
    return await db.Todos.FindAsync(id) switch
    {
        Todo todo => TypedResults.Ok(todo),
        _ => TypedResults.NotFound()
    };
}
```

## 3. Global & Group Filters

Use Endpoint Filters for cross-cutting concerns like validation or logging.

```csharp
group.AddEndpointFilter(async (invocationContext, next) =>
{
    // Pre-execution logic
    var result = await next(invocationContext);
    // Post-execution logic
    return result;
});
```

## 4. Input Validation with FluentValidation

Integrate FluentValidation using filters to keep your handlers clean.

## 5. Dependency Injection

Minimal APIs support DI directly in the lambda/method parameters.

```csharp
app.MapGet("/users", (IUserService userService) => userService.GetUsers());
```
