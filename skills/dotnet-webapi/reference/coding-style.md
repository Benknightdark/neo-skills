# .NET Web API Coding Conventions

This guide is based on industry standards for ASP.NET Core Web API, aiming to improve organization and maintenance efficiency in the Controller-based pattern.

## 1. Controllers

### 1.1 Naming and Attributes
- **PascalCase**: All controller class names must use `PascalCase` and end with `Controller` (e.g., `UsersController`).
- **[ApiController]**: All API controllers must be marked with the `[ApiController]` attribute to enable automatic model validation, inferred parameter binding sources, and `ProblemDetails` responses.
- **[Route]**: It is recommended to use `[Route("api/[controller]")]` or explicit version paths (e.g., `[Route("api/v1/users")]`).

### 1.2 Action Methods
- **Semantic Naming**: Method names should reflect business intent (e.g., `GetUserAsync`), and asynchronous methods must end with `Async`.
- **HTTP Verbs**: Explicitly use `[HttpGet]`, `[HttpPost]`, `[HttpPut]`, `[HttpDelete]`, or `[HttpPatch]`.

---

## 2. Data Transfer

- **DTO Naming**: Use `Request` or `Response` as suffixes (e.g., `UserCreateRequest`, `UserSummaryResponse`).
- **Record Types**: For read-only data transfer objects, prioritize using `record` types.

---

## 3. Response Handling

- **ActionResult<T>**: Methods should return `Task<ActionResult<T>>`, which offers better type safety and Swagger support compared to `IActionResult`.
- **Standard Response Methods**:
  - `Ok(data)` (200)
  - `CreatedAtAction(...)` (201)
  - `NoContent()` (204)
  - `BadRequest(ModelState)` (400)
  - `NotFound()` (404)

---

## 4. Dependency Injection (DI) & Services

- **Constructor Injection**: Always use constructor injection for services (prioritize C# 12+ Primary Constructors).
- **Interface-Oriented**: Inject interfaces instead of concrete classes to facilitate unit testing.

---

## 5. File Organization and Namespaces

- **Vertical Slicing**: For large projects, it is recommended to organize folders by feature domain instead of the traditional Controllers/Models/Services layering.
- **File-scoped Namespace**: Always use File-scoped Namespaces (C# 10+).
