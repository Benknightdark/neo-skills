# EF Core Modern Patterns

This document introduces recommended development patterns in the Entity Framework Core domain for .NET 6 to 11+.

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

---

## 6. EF Core 11 Modern Patterns

### 6.1 LINQ FullJoin (SQL FULL OUTER JOIN)
**Recommendation**: Use `Queryable.FullJoin` to express full outer joins directly in LINQ rather than writing complex union queries or raw SQL:
```csharp
var query = context.Customers
    .FullJoin(
        context.Orders,
        c => c.Id,
        o => o.CustomerId,
        (customer, order) => new { Customer = customer, Order = order });
```

### 6.2 Approximate Nearest Neighbor Vector Search (SQL Server 2025)
**Recommendation**: For high-dimensional vector search with vector indexing, use `.WithApproximate()` to trigger SQL Server's approximate search:
```csharp
var results = await context.Documents
    .OrderBy(d => EF.Functions.VectorDistance("cosine", d.Embedding, queryVector))
    .VectorSearch()
    .WithApproximate()
    .Take(5)
    .Select(d => new { d.Id, d.Title }) // Always explicitly project non-vector fields
    .ToListAsync();
```

### 6.3 Complex Types & JSON in TPT/TPC Hierarchies
**Recommendation**: Model domain value objects as complex types or JSON columns even on polymorphic hierarchies using Table-Per-Type (TPT) or Table-Per-Concrete-Type (TPC):
```csharp
public abstract class Payment
{
    public int Id { get; set; }
    public required Money Amount { get; set; } // Complex Type supported in EF Core 11 TPT/TPC
}
```

