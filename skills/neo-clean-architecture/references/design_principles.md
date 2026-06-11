# Clean Architecture Design Principles

This document defines core concepts of Clean Architecture, focusing on technology-neutral guidelines applicable across different programming languages and frameworks.

---

## 1. Separation of Concerns

Components change for different reasons and at different rates:
* **Business Rules** (e.g., discount logic): Exist in the **Domain** core. Changes reflect business policy shifts.
* **Application Use Cases** (e.g., notifying users after sign-up): Coordinate flows in the **Application** layer.
* **Technical Details** (e.g., PostgreSQL migration, REST-to-gRPC switch): Restricted to **Infrastructure** and **Presentation**.

Coupling these layers increases regression risks. Boundaries isolate changes to keep updates localized.

---

## 2. Inward Dependency Rule

Source code dependencies must point strictly inward. Inner circles have zero knowledge of outer circles.

```
┌──────────────────────────────────────────────┐
│  Presentation / API Layer                    │
│  ┌────────────────────────────────────────┐  │
│  │  Infrastructure Layer                   │  │
│  │  ┌──────────────────────────────────┐  │  │
│  │  │  Application Layer (Use Cases)   │  │  │
│  │  │  ┌────────────────────────────┐  │  │  │
│  │  │  │  Domain Core (Entities)    │  │  │  │
│  │  │  └────────────────────────────┘  │  │  │
│  │  └──────────────────────────────────┘  │  │
│  └────────────────────────────────────────┘  │
└──────────────────────────────────────────────┘
```

* **Domain Core**: Inmost circle. Depends on nothing. Free of frameworks, database drivers, or outer-circle constructs.
* **Application**: Depends only on Domain. Defines use cases and abstractions (e.g., Repository interfaces).
* **Infrastructure**: Depends on Application and Domain. Implements application interfaces, managing persistence and external networks.
* **Presentation**: Depends on Application. Entry point handling transport protocols (HTTP/gRPC/CLI) and dispatching inputs.

### Dependency Inversion Principle (DIP)
To persist data without letting the Application depend on Infrastructure:
* **Approach**: Define an abstract interface (e.g., `IRepository`) in the Application layer. Implement this interface (e.g., `SqlRepository`) in the Infrastructure.
* **Result**: At runtime, DI resolves the implementation. At compile time, the source code dependency points inward, protecting the boundary.

---

## 3. Rich Domain Model

Entities must protect their **Invariants (business rules and consistency constraints)**. Properties must be read-only, and state changes must go through semantic methods.

Anemic Domain Models (data containers with public setters) scatter business rules across services, leading to duplication and maintenance overhead.

```javascript
// ✅ Correct Design: Read-only properties, state changes managed via semantic methods
class Prompt {
    #id;
    #title;
    #content;
    #tags = new Set();

    constructor(title, content) {
        if (!title || title.trim() === "") throw new Error("Title is required");
        this.#id = generateUUID();
        this.#title = title.trim();
        this.#content = content;
    }

    get title() { return this.#title; }
    get content() { return this.#content; }
    get tags() { return Array.from(this.#tags); }

    updateContent(newContent) {
        if (!newContent || newContent.trim() === "") throw new Error("Content cannot be empty");
        if (this.#content === newContent) return; 
        this.#content = newContent;
    }

    addTag(tagValue) {
        const normalized = tagValue.trim().toLowerCase();
        if (normalized.length === 0) return;
        this.#tags.add(normalized);
    }
}
```

---

## 4. Value Objects

Value Objects have no identity (ID) and are defined entirely by their properties. Two Value Objects are equal if their attributes match.

### Avoid Over-engineering
Do not wrap primitives unless they validate (e.g., `Email` format) or transform data (e.g., `Tag` slugification). Use Value Objects only when:
1. **Validation is needed**: E.g., verifying `Email` format.
2. **Behavior is needed**: E.g., converting tag inputs to slugs.
3. **Attributes form a conceptual whole**: E.g., `Money(amount, currency)`.

---

## 5. Result Pattern

Expected business failures (e.g., resource not found, title conflict) should return a structured `Result` object instead of throwing runtime exceptions.

Exceptions must be reserved for unexpected, fatal system issues (e.g., database connection loss, out-of-memory).

### Generic Result Design
```javascript
class Result {
    constructor(isSuccess, value = null, error = null, errorType = "None") {
        this.isSuccess = isSuccess;
        this.value = value;
        this.error = error;
        this.errorType = errorType; // e.g., "NotFound", "Validation", "Conflict", "None"
    }

    static success(value) {
        return new Result(true, value, null, "None");
    }

    static failure(error, type = "Failure") {
        return new Result(false, null, error, type);
    }

    static notFound(error = "Resource not found") {
        return new Result(false, null, error, "NotFound");
    }
}
```
