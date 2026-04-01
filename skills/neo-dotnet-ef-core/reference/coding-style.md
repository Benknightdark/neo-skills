# EF Core Coding Conventions

This guide aims to improve the readability and maintainability of Entity Framework Core code, ensuring a high degree of consistency in database model definitions.

## 1. Entities and Modeling

### 1.1 Entity Classes
- **PascalCase**: All entity class names must correspond to database tables and use `PascalCase` (e.g., `Order`, `ProductCategory`).
- **Shadow Properties**: For fields that don't need to be exposed to business logic but are required by the database (like `CreatedDate`, `LastUpdated`), shadow properties should be used.

### 1.2 Relationship Naming
- **Navigation Properties**: Collection types should use plural nouns (e.g., `public ICollection<Order> Orders { get; set; }`), while single entities use singular nouns.
- **Foreign Key Naming**: Prioritize the `<EntityName>Id` convention (e.g., `CategoryId`).

---

## 2. DbContext Configuration

- **Fluent API First**: Prioritize using `IEntityTypeConfiguration<T>` classes for entity configuration over piling up code in `OnModelCreating` or using Data Annotations on entities.
- **Configuration Directory**: Place all configuration classes in the `Data/Configurations` directory.

---

## 3. Querying Conventions

- **Asynchronous Execution**: All database access operations must prioritize asynchronous methods (e.g., `ToListAsync()`, `FirstOrDefaultAsync()`).
- **Read-Only Queries**: For queries that do not require updates, you must explicitly call `.AsNoTracking()` to reduce memory overhead.
- **Specific Field Projections**: Avoid `Select *`, and use `.Select(x => new Dto { ... })` to retrieve only the required data.

---

## 4. Migrations Management

- **Named Migrations**: Migration names must reflect the content of the change (e.g., `AddUserPhoneNumber`, `FixOrderDiscountTypo`). Random or meaningless names are prohibited.
- **Prevent Data Loss**: When manually editing migration scripts, you must check for any implicit deletion actions.

---

## 5. File Organization

- **Data Directory**: Place `DbContext`, entity definitions, and configurations under `Data/` or `Infrastructure/Persistence/`.
- **File-scoped Namespace**: Always use File-scoped Namespaces (C# 10+).
