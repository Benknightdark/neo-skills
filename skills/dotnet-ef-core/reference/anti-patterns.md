# EF Core Anti-Patterns & Best Practices

This document lists common mistakes in Entity Framework Core development and their corresponding correct practices.

## 1. Performance and Querying

### 1.1 Avoid N+1 Query Problems
**Problem**: Accessing navigation properties inside a loop, causing an excessive amount of SQL queries to be executed.

- **Bad**: Iterating over Users and accessing `user.Orders` inside the loop without pre-loading.
- **Good**: Use `.Include(u => u.Orders)` for Eager Loading, or use a dedicated projection.

### 1.2 Avoid Complex C# Functions in Queries
**Problem**: EF Core cannot translate custom C# methods into SQL, forcing the query to be evaluated on the client-side (In-Memory).

- **Bad**: `Where(u => MyCustomLogic(u.Name))`.
- **Good**: Use built-in SQL functions or methods provided by `EF.Functions` as much as possible.

---

## 2. Lifecycle Management

### 2.1 Avoid Sharing DbContext
**Problem**: `DbContext` is not thread-safe. Sharing the same instance across multiple threads or concurrent requests will lead to data corruption or exceptions.

- **Bad**: Storing `DbContext` in a static variable or a singleton service.
- **Good**: Register `DbContext` with a `Scoped` lifecycle (the default in ASP.NET Core).

### 2.2 Avoid Long Lifecycles
- **Problem**: Over time, the DbContext's Change Tracker accumulates a massive amount of entities, making queries and `SaveChanges` increasingly slow.
- **Good**: For large batch tasks, you should periodically dispose of the old Context and create a new instance.

---

## 3. Model Definition

### 3.1 Avoid Over-relying on Data Annotations
- **Problem**: Entity classes become polluted with database configuration attributes (like `[Table]`, `[Column]`), violating the Single Responsibility Principle.
- **Good**: Use Fluent API (`IEntityTypeConfiguration`) to maintain the purity of entities.

### 3.2 Avoid Ignoring Concurrency Conflicts
- **Bad**: When multiple users modify the same data simultaneously, the last one directly overwrites previous modifications.
- **Good**: Add a `RowVersion` or `Timestamp` column to critical entities to implement optimistic concurrency control.

---

## 4. Tooling and Development

### 4.1 Avoid Decoupling the Development Database from Migration Scripts
- **Problem**: Directly modifying the database schema without creating Migrations.
- **Good**: Always use `dotnet ef migrations add` to manage schema changes, ensuring team environment consistency.
