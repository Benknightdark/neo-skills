# .NET Web API Anti-Patterns & Best Practices

This document lists common mistakes in Controller-based Web API development and their corresponding correct practices.

## 1. Controller Organization

### 1.1 Avoid Fat Controllers
**Problem**: Writing massive amounts of business logic, database access, or complex validation directly in controller actions.

- **Bad**: Action exceeds 20 lines and includes direct manipulation of `DbContext` code.
- **Good**: Encapsulate business logic into a Service layer or use MediatR (CQRS pattern), making the Action only responsible for orchestrating requests and responses.

### 1.2 Avoid Ignoring the `[ApiController]` Attribute
**Problem**: Omitting this attribute requires manual model validation handling using `if (!ModelState.IsValid)`.

- **Good**: Always apply `[ApiController]` on API controllers.

---

## 2. Async & Resources

### 2.1 Avoid Ignoring `CancellationToken`
- **Problem**: Failing to pass cancellation tokens in long-running queries; server resources remain uselessly occupied when clients cancel connections.
- **Good**: Action parameters should include `CancellationToken ct`, passing it down to async database operations or external HTTP calls.

### 2.2 Avoid Synchronously Reading the Request Body
- **Problem**: Synchronously reading the Body blocks the thread.
- **Good**: Use framework-provided asynchronous parameter binding.

---

## 3. Security & Exceptions

### 3.1 Avoid Returning Sensitive Exception Messages
- **Problem**: Directly returning `ex.StackTrace` to the client in production environments.
- **Good**: Use global exception handling to convert it into `ProblemDetails`, logging details only on the backend and returning a standard error format to the frontend.

### 3.2 Avoid Over-exposing Domain Models
- **Problem**: Directly returning database entity objects as responses, which might leak sensitive fields (like password hashes) or cause circular references.
- **Good**: Create dedicated `Response DTO`s and use AutoMapper or manual mapping.

---

## 4. Documentation

### 4.1 Ignoring Status Code Definitions
- **Problem**: Swagger UI only displays `200`, making it hard for frontend developers to know other error scenarios.
- **Good**: Use markers like `[ProducesResponseType(StatusCodes.Status404NotFound)]`.
