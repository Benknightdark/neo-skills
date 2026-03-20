# ASP.NET Core Web API Latest Development Patterns Guide

This guide integrates core patterns and best practices for the latest Web API development.

---

## 1. Architectural Patterns

### Clean Architecture
*   **Core Goal**: Decouple business logic from external dependencies (databases, UI, frameworks).
*   **Structural Recommendations**:
    *   **Domain**: Entities, Value Objects, Domain Exceptions.
    *   **Application**: Commands & Queries (CQRS), Interfaces, DTOs, Validation.
    *   **Infrastructure**: Database implementation (EF Core), External API clients.
    *   **API (Web)**: Controllers or Minimal API endpoints, Middleware.

### CQRS with MediatR
*   **Approach**: Use **MediatR** for decoupling the request from the handler.
*   **Advantages**: Separates read and write logic, improving system scalability and readability.

---

## 2. API Development Patterns

### Minimal APIs
*   **Advantages**: Reduces boilerplate code, faster startup times.
*   **Pattern**: Use `MapGroup` for grouping related endpoints, and `TypedResults` for improved type safety.

### Result & Error Handling (Problem Details)
*   **Approach**: Use the **Result Pattern** (e.g., `Result<T>`) to handle business errors without exceptions.
*   **Standard**: Use `TypedResults.Problem()` to return standardized **RFC 7807 Problem Details**.
*   **Middleware**: Use `app.UseExceptionHandler()` to catch unhandled exceptions globally and convert them to Problem Details.

### API Versioning
*   **Approach**: Use the `Asp.Versioning.Http` package.
*   **Pattern**: Prioritize URL Versioning (e.g., `/api/v1/...`) for better compatibility and clear client expectations.

---

## 3. Performance & Data Patterns

### Distributed Caching
*   **Approach**: Use `IDistributedCache` for shared state or expensive computations.
*   **Best Practice**: Implement a strategy to handle cache invalidation and potential race conditions.

### Eager Loading & No-Tracking
*   **Approach**: Use `.AsNoTracking()` for read-only queries to save memory.
*   **Performance**: Use `.Include()` carefully to avoid "Cartesian Product" issues (use `.AsSplitQuery()` for large joins in EF Core).

### Asynchronous Streams (IAsyncEnumerable)
*   **Approach**: Return `IAsyncEnumerable<T>` directly from the API for streaming large datasets.
*   **Scenario**: Reduces server memory footprint and improves client perceived performance.

---

## 4. Security Patterns

### JWT & Refresh Token Rotation
*   **Pattern**: Use short-lived Access Tokens (e.g., 5-15 mins) and one-time-use Refresh Tokens stored in HttpOnly cookies to mitigate XSS/CSRF risks.

### Rate Limiting & Security Headers
*   **Approach**: Use `Microsoft.AspNetCore.RateLimiting`.
*   **Best Practice**: Enforce **HSTS**, **Content-Security-Policy**, and **X-Frame-Options** via middleware.

### Secret Management
*   **Local**: Use `dotnet user-secrets`.
*   **Production**: Use Key Vault solutions via Configuration Providers.
