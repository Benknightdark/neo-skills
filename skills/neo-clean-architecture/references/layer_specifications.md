# Clean Architecture Layer Specifications & Mappings

This document defines the responsibilities of each layer and provides guidance on translating technology-specific code/libraries into clean, technology-neutral concepts.

---

## Layers & Boundary Rules

| Layer Name | Core Responsibility | Absolute Prohibitions (Boundary Rules) |
| :--- | :--- | :--- |
| **Domain** | 1. Entities<br>2. Value Objects<br>3. Domain logic & invariants<br>4. Domain events | 🚫 No database or ORM dependencies.<br>🚫 No transport protocol references (HTTP/gRPC/CLI).<br>🚫 No references to outer-layer modules (Application/Infrastructure).<br>🚫 No third-party framework annotations (e.g., Spring, Nest, ASP.NET). |
| **Application** | 1. Use case handlers<br>2. Command & Query inputs<br>3. Repository & Gateway interfaces<br>4. Pipeline / Interceptor interfaces | 🚫 No SQL queries or DB connection details.<br>🚫 No direct HTTP requests, responses, or routing concerns.<br>🚫 No direct access to outer networks, filesystems, or email drivers. |
| **Infrastructure** | 1. Implement Application interfaces (Repositories)<br>2. Persistence settings & ORM configurations<br>3. External gateway implementations (Mail, Queue, File Storage) | 🚫 No business logic execution outside application-defined interfaces.<br>🚫 No direct database state modification bypassing domain invariants.<br>🚫 No dependencies on Presentation layer structures (e.g., HTTP sessions). |
| **Presentation / API** | 1. Parse and validate Request Contracts<br>2. Basic format validation (length, null check, regex)<br>3. Dispatch inputs to Application Use Cases<br>4. Map Result to Response Contracts & Status Codes | 🚫 No direct database queries (must go through Application).<br>🚫 No business rules or invariant checks.<br>🚫 No business transaction assembly across aggregates. |

---

## Technology-Specific to Clean Concept Mappings

When reviewing codebases, map programming language syntax and library features to these universal concepts:

### 1. Request Orchestration (e.g., MediatR in C#, Spring Service in Java)
* **Library Feature**:
  * C# `IMediator.Send(command)` or `IRequestHandler`.
  * Java `@Service` annotations mixing use case execution with business logic.
* **Technology-Neutral Concept**:
  * **Command/Query Dispatcher** or **Use Case Interactor**.
  * Separate each business workflow into a dedicated `UseCase` class or `Handler` function, dividing input schemas from execution logic.
* **Concept Mapping Code**:
  ```javascript
  // Technology-neutral Use Case concept
  class CreateUserUseCase {
      constructor(userRepository, emailGateway) {
          this.userRepository = userRepository;
          this.emailGateway = emailGateway;
      }

      async execute(command) {
          // Flow coordination...
      }
  }
  ```

### 2. Cross-Cutting Concerns (e.g., MediatR Pipeline, Spring AOP, Express Middleware)
* **Library Feature**:
  * C# `IPipelineBehavior<TRequest, TResponse>` or Express `next()` middleware.
* **Technology-Neutral Concept**:
  * **Pipeline Middleware / Interceptor**.
  * Intercept actions before and after use case execution to run Logging, Validation, Transaction, and Caching. This isolates the core handler from infrastructure concerns.

### 3. Persistence Mapping (e.g., EF Core, Hibernate, Prisma, Mongoose)
* **Library Feature**:
  * C# `DbContext`, `DbSet`, `IEntityTypeConfiguration`, or ORM navigation properties with Lazy Loading.
* **Technology-Neutral Concept**:
  * **Persistence Context** and **Data Mapper**.
  * Map entities to database schemas, converting value objects to database-friendly primitives. The Domain layer must remain free of ORM annotations or persistence metadata.

### 4. Repository Leakage
* **Library Feature**:
  * Returning C# `IQueryable<T>` or Java `Stream<T>` from repositories.
* **Technology-Neutral Concept**:
  * **Leaky Abstraction Anti-Pattern**.
  * Returning query streams allows Application code to inject query filters (e.g., SQL/LINQ criteria), leaking database capabilities inward and blocking unit test isolation.
  * **Remediation**: Repositories must return **concrete collections** (e.g., `List` or pagination objects) or expose semantic queries (e.g., `findActiveUsersByRole`).

### 5. Input Validation (e.g., FluentValidation, JSR-380 annotations)
* **Library Feature**:
  * `AbstractValidator` or `@NotNull` property constraints.
* **Technology-Neutral Concept**:
  * **Input Validator**.
  * Manage basic schema checks at boundaries. Separate validation into:
    1. **Format Validation**: Intercept malformed payloads at API/Application boundaries.
    2. **Invariant Validation**: Enforce business policy rules inside the Domain entity constructor/methods.
