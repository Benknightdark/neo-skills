---
name: neo-clean-architecture
description: >
  Use this skill when the user wants to design, implement, review, or refactor software systems conforming to Clean Architecture principles.
  It structures code into Domain, Application, Infrastructure, and Presentation/API layers, enforcing inward-only dependencies.
  It advocates rich domain models, CQRS, and the Result pattern, operating on technology-neutral concepts without database or framework bindings.
metadata:
  pattern: reviewer-generator
  domain: architecture
---

# Clean Architecture

Design and review software systems using Clean Architecture. The core objective is separating concerns based on their rate of change, directing all source code dependencies inward toward the Domain core.

## Gotchas
* **Anemic Models**: Entities that are mere data containers (only getters/setters) leak business logic. Entities must protect their invariants. State changes must go through explicit, business-oriented methods.
* **Pointless Value Objects**: Avoid wrapping primitives (e.g., string, number) unless they encapsulate validation (e.g., email format) or behavior (e.g., auto-slug generation).
* **Deep Object Graphs**: Do not nest full entities for associations. Loading a parent entity will trigger database performance issues. Reference other aggregates using IDs instead.
* **Dependency Leakage**: Repository interfaces must reside in the Application layer, with implementations in Infrastructure. Never return query streams (e.g., `IQueryable`) to Application, as it leaks database concerns.
* **Exception Control Flow**: Do not throw runtime exceptions for expected business failures (e.g., duplicate title, user not found). Use the Result pattern for flow control.

---

## Workflow Checklist

Progress:
- [ ] Step 1: Analyze Core & Boundaries (See `references/design_principles.md`).
- [ ] Step 2: Design Domain Layer (Build entities and value objects; protect invariants).
- [ ] Step 3: Design Application Layer (Define use case handlers, CQRS inputs, and repository interfaces).
- [ ] Step 4: Implement Outer Layers (Implement database mapping, external services, and API controllers).
- [ ] Step 5: Audit Architecture Health (Use `assets/review_checklist.md` to scan code).

---

## Detailed Guidelines

### Step 1 — Analyze Core & Boundaries
1. Categorize business rules:
   - Domain Layer: Core rules that would exist even without a computer system.
   - Application Layer: System orchestration, workflows, and protocols.
   - Outer Layers (Infrastructure/Presentation): Delivery mechanisms and persistence details.
2. Read [design_principles.md](references/design_principles.md) for architectural details.

### Step 2 — Design Domain Layer
1. Entities: Keep setters private or read-only.
2. Domain Methods: Expose semantic operations (e.g., `updateContent()`, `addTag()`) that validate rules inside the entity.
3. Associations: Keep aggregates decoupled by referencing other aggregate roots via ID only.

### Step 3 — Design Application Layer
1. Separate write operations (Commands) from read operations (Queries) using **CQRS**.
2. Define technology-neutral interfaces (e.g., `IUserRepository`), keeping database or network specifics out of Application.
3. Wrap use case outcomes in a **Result** type containing success/failure status, value, error type, and message. Refer to [layer_specifications.md](references/layer_specifications.md) for concepts mapping.

### Step 4 — Implement Infrastructure & Presentation
1. **Infrastructure**: Implement interfaces defined in Application. Configure ORM/database mappings, value conversions, and call external services.
2. **Presentation/API**: Handle transmission protocols (e.g., HTTP, gRPC). Map request payload to Command/Query, dispatch it to Application, and translate the Result into appropriate responses (e.g., HTTP 200, 201, 400, 404, 409).

---

## Output Templates

### 1. Architecture Blueprint Template
```markdown
# [System Name] Clean Architecture Blueprint

## 1. Domain Layer
* **Entities & Aggregate Roots**:
  - `EntityName` (ID-association explanation)
* **Value Objects**:
  - `ValueObjectName` (Validation and behavior description)

## 2. Application Layer
* **Use Cases (CQRS / Handlers)**:
  - `CreateSomethingCommand` & Handler
  - `GetSomethingQuery` & Handler
* **External Interfaces (Gateways / Repositories)**:
  - `ISomethingRepository` (Interface methods)

## 3. Infrastructure Layer
* **Persistence Configurations**:
  - `SomethingRepository` implementation notes
  - Value Object persistence mapping rules

## 4. Presentation / API Layer
* **Contracts (Request/Response)**:
  - `CreateSomethingRequest` -> `SomethingResponse`
* **Route & Status Code Mappings**:
  - `POST /api/something` -> `201 Created` / `400 Bad Request` / `409 Conflict`
```

### 2. Architecture Review Template
```markdown
# Clean Architecture Review — [Project Name]

## Health Score: [Score]/10
[Brief architectural health assessment]

## Findings & Recommendations
### 🔴 Critical (Dependency Violation / Invariant Leakage)
* **Location**: `path/to/file.ext#L12-30`
* **Problem**: [Description of the clean architecture violation]
* **Remediation**:
  ```[language]
  // Corrected code snippet
  ```

### 🟡 Warning (Anemic Model / Pointless Wrapping)
* **Location**: `path/to/file.ext`
* **Problem**: [Issue description]
* **Remediation**: [Code or prose description]

### 🟢 Info (Structural / Pipeline Enhancements)
* **Location**: `path/to/file.ext`
* **Remediation**: [Suggestion details]
```
