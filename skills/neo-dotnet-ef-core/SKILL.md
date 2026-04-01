---
name: neo-dotnet-ef-core
version: "1.0.0"
category: "Framework"
description: "Entity Framework Core (EF Core) 專家指引。支援從 .NET 6 (LTS) 到 .NET 10 (LTS) 的現代開發模式，涵蓋 Code-First 移轉、查詢優化、陰影屬性與複雜資料建模。"
compatibility: "Supports .NET 6.0 through 10.0 environments. Compatible with SQL Server, PostgreSQL, MySQL, and SQLite."
---

# EF Core Expert Skill

## Trigger On
- The user requests database modeling, writing Linq queries, or handling database migrations.
- The project contains a `DbContext` class or references the `Microsoft.EntityFrameworkCore` package.
- There is a need to optimize database access performance or solve N+1 query problems.
- The task involves complex data relationship design (one-to-many, many-to-many, inheritance mapping).

## Workflow
1. **Perceive (Model Awareness):**
   - Check `.csproj` to identify the EF Core version and database provider.
   - Analyze `DbContext` and entity configurations to confirm whether the Fluent API pattern is adopted.
   - Identify the current state of Migrations.
2. **Reason (Planning Phase):**
   - Evaluate whether queries need `.AsNoTracking()` or `.AsSplitQuery()`.
   - Determine whether custom interceptors are needed to handle audit fields.
   - Evaluate whether to use `ExecuteUpdate/Delete` (.NET 7+) for massive data updates.
3. **Act (Execution Phase):**
   - Write efficient and safe Linq queries.
   - Implement entity configuration classes (`IEntityTypeConfiguration`).
   - Create and execute database migration commands.
4. **Validate (Standard Validation):**
   - Check if the generated SQL meets performance expectations (avoiding full table scans).
   - Validate concurrency conflict handling logic.
   - Ensure all database accesses follow asynchronous patterns.

## Feature Roadmap (.NET 6 - 10)

### .NET 6 & 7 (Foundation)
- **Split Queries**: Solve the Cartesian product problem.
- **Bulk Operations**: Use `ExecuteUpdate/Delete` for high-performance updates.
- **JSON Columns**: Built-in JSON mapping support.
- **Compiled Models**: Reduce startup time for large models.

### .NET 8 & 9 (Productivity)
- **Primitive Collections**: Use simple type collections in queries.
- **HierarchyId**: Support for SQL Server hierarchical data.
- **Auto-compiled Queries**: Further optimize the query compilation process.
- **Complex Types**: Better support for Value Objects.

### .NET 10+ (Cutting Edge)
- **Advanced Interceptors**: More query lifecycle hooks.
- **Optimized AOT Support**: AOT pre-compilation optimization for cloud-native environments.

## Coding Standards
- **Fluent API Preference**: Prioritize entity configuration classes over Data Annotations.
- **Async Always**: All I/O operations must be asynchronous.
- **No-Tracking by Default**: Read-only queries must always use `.AsNoTracking()`.
- **Naming**: Entity names correspond to tables, foreign key names have clear semantics.

## Deliver
- **Optimized Linq Queries**: Provide query code with the potential for high-performance SQL translation.
- **Migration Scripts & Guidance**: Provide correct migration commands and manual adjustment suggestions.
- **Database Schema Design**: Design normalized entity relationships based on business requirements.

## Validate
- Ensure the provided code complies with EF Core performance best practices.
- Validate whether the code correctly handles Nulls and database constraints.
- Confirm database connection and resource release logic is correct (using `using` or Scoped DI).

## Documentation
### Official References
- [Entity Framework Core Overview](https://learn.microsoft.com/en-us/ef/core/)
- [Performance Optimization in EF Core](https://learn.microsoft.com/en-us/ef/core/performance/)
- [Supported Database Providers](https://learn.microsoft.com/en-us/ef/core/providers/)

### Internal References
- [EF Core Coding Style and Naming Conventions](reference/coding-style.md)
- [EF Core Anti-Patterns and Best Practices](reference/anti-patterns.md)
- [EF Core Modern Patterns Guide](reference/patterns.md)
