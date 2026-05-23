# Code Review Checklist

This checklist serves as a systematic guideline for AI reviewers. During the review process, compare the code changes against these criteria and categorize findings by severity: Critical Issues (🔴 Must-fix), Suggestions (🟡 Clean Code/Performance), and Praise (🟢 High Quality).

---

## 1. Correctness & Logic

- [ ] **Functional Completeness**: Does the code fully implement the intended requirements? Are there any missing business logic paths?
- [ ] **Edge Cases**: Are extreme inputs handled properly (e.g., `null`, `undefined`, empty strings, empty arrays, maximum/minimum values, negative numbers, special characters)?
- [ ] **Exception Handling**:
  - Are error-prone operations (e.g., I/O, network requests, parsing) wrapped in appropriate `try-catch` blocks?
  - Are caught exceptions handled gracefully (e.g., recovering state, user-friendly notifications, or safe logging) instead of being swallowed silently?
- [ ] **Concurrency & Thread Safety**: In multi-threaded or asynchronous environments, are there potential race conditions, deadlocks, or unawaited async operations?
- [ ] **State Management**: Are variable lifecycles correct? Are there any unintended side effects or global namespace pollution?

---

## 2. Security — 🔴 Critical

- [ ] **Injection Defenses**:
  - **SQL Injection**: Are parameterized queries or ORM used? Direct string concatenation for SQL queries is strictly prohibited.
  - **XSS (Cross-Site Scripting)**: Is data rendered to the frontend properly escaped or sanitized?
  - **Command Injection**: Are user inputs directly concatenated into system commands?
- [ ] **Sensitive Data Protection**:
  - Are there any hardcoded secrets, API tokens, passwords, database connection strings, or private keys?
  - Does logging accidentally capture Personally Identifiable Information (PII, e.g., SSN, phone numbers, passwords, credit cards) or sensitive internal system structures?
- [ ] **Authentication & Authorization**:
  - Are appropriate authorization and authentication checks performed for sensitive operations and APIs?
  - Does it follow the "Principle of Least Privilege"?
- [ ] **Insecure Practices & Dependencies**:
  - Are known insecure functions used (e.g., `eval()` in JavaScript, `exec()` in Python)?
  - Do dependency libraries have known major vulnerabilities?

---

## 3. Performance & Resource Management

- [ ] **Algorithms & Complexity**: Are time and space complexities reasonable? Are there unnecessary nested loops (e.g., $O(n^2)$ or worse)?
- [ ] **Database Interaction Efficiency**:
  - Are there N+1 query issues?
  - Do database queries utilize indexes properly, or do they fetch unnecessary columns/rows?
- [ ] **Resource Lifecycle Management**:
  - Are file handles, database connections, network sockets, and streams explicitly closed/released after use?
  - Are resources released in `finally` blocks or using structural patterns like `using` (.NET) or `with` (Python)?
- [ ] **Memory Leaks**:
  - Are there unregistered event listeners, infinitely growing global caches, or long-lived objects retaining references to short-lived objects?
- [ ] **Caching & Lazy Loading**: Is an appropriate caching strategy used for high-frequency, low-variance expensive computations or I/O operations?

---

## 4. Maintainability & Readability

- [ ] **Clear Naming**: Are variables, functions, and classes named intuitively and descriptively? Are single-character or meaningless names avoided?
- [ ] **Complexity Control**:
  - Is the length of a single function/method reasonable (ideally under 50 lines)?
  - Is the cyclomatic complexity too high (e.g., excessive nesting, too many branch conditions)?
- [ ] **Modularity & Architecture**:
  - Does the code follow the **DRY (Don't Repeat Yourself)** principle?
  - Does the code follow **SOLID principles** (especially the Single Responsibility Principle - SRP)?
- [ ] **Testability**:
  - Is the code easy to unit test?
  - Is there appropriate dependency injection or decoupling to facilitate mocking external dependencies?
  - Are there corresponding test cases for new features or bug fixes?

---

## 5. Style & Standards

- [ ] **Idiomatic Best Practices**: Does the code leverage modern features of the language/framework (e.g., TypeScript utility types, Python type hints, pattern matching)?
- [ ] **Formatting & Style Consistency**:
  - Do indentation, spacing, and quotes match the existing patterns in the codebase?
  - Does the code pass local Linter checks (e.g., ESLint, Ruff)?
- [ ] **Comment Quality**:
  - Do comments explain "Why" the code is written this way, rather than restating "What" the code does?
  - Has obsolete or commented-out dead code been cleaned up?
