# Clean Architecture Review Checklist

Use this checklist to scan and review code bases for conformity to Clean Architecture boundaries.

---

## 1. Dependency Directions
* [ ] **Physical Inward Dependency (🔴 Critical)**: Do inner circles (Domain, Application) import, reference, or depend on outer circles (Infrastructure, Presentation, ORM, Web Frameworks)?
* [ ] **Query Stream Leakage (🔴 Critical)**: Do repository interfaces return ORM-specific query streams (e.g., `IQueryable`, `IPreparedQuery`)? This leaks persistence details to Application.
* [ ] **ORM Annotation Leakage (🟡 Warning)**: Do domain entities contain database-specific annotations (e.g., `@Table`, `@Column`, `[Key]`, `[Required]`)? (Map ORM metadata in the Infrastructure layer instead).
* [ ] **External SDK Leakage (🟡 Warning)**: Does the Application layer reference third-party SDK types as handler parameters? (Isolate using DTOs or custom interfaces).

---

## 2. Domain Layer
* [ ] **Anemic Model (🟡 Warning)**: Are entities plain data bags with public setters, shifting business rules into Application Services?
* [ ] **Invariant Protection (🟡 Warning)**: Do entity constructors and methods validate rules? Can an entity be instantiated in an invalid state?
* [ ] **Pointless Value Objects (🟢 Info)**: Are primitives wrapped in value objects without any validation or formatting benefits? (Avoid pointless overhead).
* [ ] **Coupling by Nested Entities (🟡 Warning)**: Do entities reference other aggregate roots directly as objects (e.g., `class Order { user: User }`)? (Reference aggregate roots via IDs instead to avoid ORM pre-loading performance traps).

---

## 3. Application & Use Case Layer
* [ ] **Single Responsibility Use Cases (🟢 Info)**: Do use case classes or handlers manage multiple unrelated actions? (Prefer a single handler per business command/query).
* [ ] **Cross-Cutting Concern Pollution (🟡 Warning)**: Are logging, validation, and transaction commits scattered across use case handlers? (Centralize via pipeline middleware or interceptors).
* [ ] **Exception Control Flow (🟡 Warning)**: Does application code throw exceptions for expected failures (e.g., password mismatch, username conflict)? (Use Result objects instead).
* [ ] **Database Transaction Leaks (🔴 Critical)**: Does Application code directly call SQL, NoSQL, or Transaction Commit APIs? (Isolate via `IRepository` and `IUnitOfWork` interfaces).

---

## 4. Presentation & API Layer
* [ ] **Thin Controllers (🟡 Warning)**: Do controllers or endpoint handlers contain business logic? (Controllers must only parse request payloads and dispatch them).
* [ ] **Contract Leakage (🟡 Warning)**: Do controllers expose Domain Entities or persistence models directly as API payloads? (Use separate Request/Response DTO contracts).
* [ ] **Format Validation Isolation (🟢 Info)**: Is basic format validation (e.g., empty string, regex check) caught at the boundary via validators, separate from domain invariants?
* [ ] **Status Code Mapping (🟢 Info)**: Are Result errors correctly mapped to transport status codes (e.g., HTTP 400, 404, 409, 500)?
