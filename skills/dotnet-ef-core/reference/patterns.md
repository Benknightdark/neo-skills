# EF Core Modern Patterns

This document introduces recommended development patterns in the Entity Framework Core domain for .NET 6 to 10+.

## 1. Advanced Query Patterns

### 1.1 Split Queries (.NET 6+)
**Recommendation**: When dealing with complex relationships involving multiple `Include()`s, use `.AsSplitQuery()` to avoid the performance explosion caused by the "Cartesian product".

### 1.2 Compiled Queries
**Recommendation**: For hot-path queries that are executed frequently and are parameterized, use `EF.CompileAsyncQuery` to improve query efficiency.

---

## 2. Interceptors and Events

### 2.1 SaveChanges Interceptor
**Recommendation**: Implement a `SaveChangesInterceptor` to automatically handle audit fields (like `CreatedBy`, `CreatedAt`), ensuring the separation of business logic and data persistence concerns.

### 2.2 Query Interceptors (.NET 8+)
**Recommendation**: Use interceptors to dynamically modify SQL before the query is executed (e.g., automatically adding a global filter).

---

## 3. Advanced Data Operations

### 3.1 Batch Updates and Deletes (ExecuteUpdate / ExecuteDelete) - .NET 7+
**Recommendation**: For massive update or delete operations that do not require loading entities into memory, directly use `ExecuteUpdateAsync` or `ExecuteDeleteAsync`.
```csharp
await context.Orders
    .Where(o => o.Status == "Expired")
    .ExecuteDeleteAsync();
```

### 3.2 Shadow Properties and JSON Mapping
**Recommendation**: Leverage .NET 7+ enhanced JSON support to map complex structures directly into JSON columns in the database.

---

## 4. Environments and Tooling

### 4.1 DbContextFactory
**Recommendation**: In Blazor Server or long-running background services, use `IDbContextFactory<T>` to ensure the correct lifecycle of DbContext.

### 4.2 Migrations Bundles
**Recommendation**: Use `dotnet ef migrations bundle` to generate a self-contained executable, simplifying the database deployment process in CI/CD.

---

## 5. C# 14+ Forward-looking Patterns

### 5.1 Extension Types for Computed Properties on Entities
**Recommendation**: Leverage C# 14's Extension Types to add computed properties to POCO entities without affecting the database schema.
