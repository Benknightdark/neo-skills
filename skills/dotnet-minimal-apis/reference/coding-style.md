# .NET Minimal APIs Coding Conventions

This guide aims to improve the development efficiency of Minimal APIs and ensure a high degree of consistency in endpoint and routing logic organization.

## 1. Routing Naming and Syntax

### 1.1 Route Templates
- **Kebab-case**: Route paths should prioritize lowercase letters separated by hyphens (e.g., `/api/v1/user-profiles`).
- **Parameter Naming**: Route parameter names should match the Handler's parameter names. Uppercase or lowercase can be used, but maintaining project consistency is recommended (e.g., `/{id}` matches `int id`).

### 1.2 Route Groups
- **Semantic Prefixes**: For endpoints sharing the same prefix or middleware, `MapGroup` must be used for logical grouping.
- **Isolated Declarations**: Avoid writing massive amounts of routes directly in `Program.cs`. It is recommended to extract group routes into separate files using extension methods.
  ```csharp
  // Recommended: Extracted into UserEndpoints.cs
  public static class UserEndpoints
  {
      public static IEndpointRouteBuilder MapUserEndpoints(this IEndpointRouteBuilder routes)
      {
          var group = routes.MapGroup("/users");
          group.MapGet("/", GetAllUsers);
          return routes;
      }
  }
  ```

---

## 2. Handlers

- **Anonymous Functions vs. Named Methods**: For single-line or simple logic, Lambdas can be used. If the logic exceeds 3 lines, it should be changed to static named methods or extracted into services.
- **Dependency Injection**: Inject services directly into the Handler parameters.
- **CancellationToken**: All asynchronous Handlers returning `Task` should prioritize accepting `CancellationToken` and passing it downstream.

---

## 3. Response Types (Results)

- **TypedResults**: To enhance OpenAPI (Swagger) static analysis capabilities, prioritize using `TypedResults` over `Results`.
- **Results<T1, T2>**: When an endpoint may return multiple status codes, use `Results<T1, T2>` to provide strong typing support.
  ```csharp
  public static async Task<Results<Ok<User>, NotFound>> GetUser(int id, IUserRepository repo)
  {
      var user = await repo.GetByIdAsync(id);
      return user is not null ? TypedResults.Ok(user) : TypedResults.NotFound();
  }
  ```

---

## 4. File Organization

- **Vertical Slice**: It is recommended to organize files by feature module rather than by class type (e.g., `Features/Users/UserEndpoints.cs`, `Features/Users/UserDto.cs`).
- **File-scoped Namespace**: Always use File-scoped Namespaces (C# 10+) to reduce nesting.
