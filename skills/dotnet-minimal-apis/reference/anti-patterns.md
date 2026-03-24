# .NET Minimal APIs Anti-Patterns & Best Practices

This document lists common mistakes in Minimal APIs development and their corresponding correct practices.

## 1. Routing & Organization

### 1.1 Avoid Fat `Program.cs`
**Problem**: Stuffing all routes, DI registrations, and middleware into `Program.cs`, leading to maintenance difficulties.

- **Bad**: Writing hundreds of lines of `app.MapGet` in a single file.
- **Good**: Use extension methods to split routes for different modules into separate files.

### 1.2 Avoid Ignoring Route Conflicts
**Problem**: Minimal APIs routing matching is extremely flexible; improper parameter definitions can lead to route conflicts.

- **Bad**: `/users/{id}` (int) and `/users/{name}` (string) existing simultaneously without constraints.
- **Good**: Use route constraints, e.g., `/users/{id:int}`.

---

## 2. Response Handling

### 2.1 Avoid Overusing Anonymous Type Responses
**Problem**: Returning `Results.Ok(new { id = 1 })` prevents Swagger from determining the response structure.

- **Bad**: Returning anonymous objects.
- **Good**: Define explicit `DTO`s or `Record`s and use `TypedResults`.

### 2.2 Avoid Ignoring `TypedResults`
- **Problem**: `Results.Ok()` returns an `IResult`, requiring casting in unit tests to verify the content.
- **Good**: Use `TypedResults.Ok(data)`, which returns `Ok<T>`, allowing direct testing of the `Value` property.

---

## 3. Performance & Async

### 3.1 Avoid Synchronous Blocking in Handlers
- **Problem**: Using synchronous APIs (like `File.ReadAllText`) inside Lambdas blocks the Thread Pool.
- **Good**: Always use `await` and asynchronous versions (like `File.ReadAllTextAsync`).

### 3.2 Forgetting to Pass `CancellationToken`
- **Problem**: When a user cancels a request (closes the browser), the backend continues to execute expensive queries.
- **Good**: Include `CancellationToken ct` in Handler parameters and pass it down to databases or HTTP clients.

---

## 4. Dependency Injection

### 4.1 Avoid Manually Retrieving Services from `app.Services` (Service Locator)
- **Bad**: `var service = app.Services.GetRequiredService<IMyService>();`.
- **Good**: Declare services directly in the Handler parameters to have the framework auto-inject them.

---

## 5. Documentation

### 5.1 Ignoring Status Code Attributes
- **Problem**: Swagger only displays `200 OK`, ignoring `404 NotFound` or `400 BadRequest`.
- **Good**: Use `.Produces<T>(StatusCodes.Status200OK)` or directly return `Results<T1, T2>`.
