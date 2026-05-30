# Code Review Checklist

This checklist is the review baseline for `neo-code-review`. During review, compare the code changes against these criteria and categorize findings by severity: Critical Issues (🔴 Must-fix), Suggestions (🟡 Clean Code/Performance), and Praise (🟢 High Quality).

Only report a finding when the risk is supported by the diff, surrounding code, tests, runtime behavior, or a clearly stated requirement. Do not turn every checklist item into a finding.

---

## 1. Correctness & Logic

- [ ] **Requirement Preservation**: Does the change break an existing or stated requirement? Does it miss a required business path?
- [ ] **Logic Errors**: Are conditionals, loops, ordering, calculations, parsing, validation, or branching rules incorrect?
- [ ] **Boundary Conditions**: Are edge cases handled properly, such as `null`, `undefined`, empty values, maximum/minimum values, negative numbers, special characters, duplicate input, timezone boundaries, or partial data?
- [ ] **State Transitions**: Are status changes, lifecycle transitions, retries, rollbacks, or cleanup steps consistent and reversible where required?
- [ ] **Exception Handling**:
  - Are error-prone operations such as I/O, network requests, database calls, parsing, serialization, or background jobs handled safely?
  - Are caught exceptions recovered, propagated, or logged appropriately instead of being swallowed silently?

---

## 2. Regression Risk & Compatibility

- [ ] **Existing APIs**: Does the change break public APIs, endpoint behavior, method signatures, event contracts, or SDK/client expectations?
- [ ] **Data Formats**: Does it change request/response schemas, database shape, serialized fields, enum values, date formats, number precision, or default values in an incompatible way?
- [ ] **Error Formats**: Does it break existing error codes, problem details, validation messages, HTTP status codes, or client-side error handling assumptions?
- [ ] **Permission Flows**: Does it alter authentication, authorization, role checks, ownership checks, or approval flows in a way that blocks valid users or grants excessive access?
- [ ] **User Workflows**: Does it break existing user journeys, backward compatibility, migrations, imports/exports, saved settings, deep links, or integrations?

---

## 3. Security — 🔴 Critical

- [ ] **Injection**:
  - SQL injection, NoSQL injection, command injection, LDAP injection, or template injection.
  - Unsafe string concatenation in queries, shell commands, templates, filters, or dynamic expressions.
- [ ] **Web Security**:
  - XSS caused by missing output encoding, unsafe HTML rendering, unsafe markdown rendering, or scriptable user content.
  - CSRF exposure on state-changing requests.
  - CORS misconfiguration that allows unintended origins, credentials, or methods.
- [ ] **Authentication & Authorization**:
  - Broken authentication, broken access control, IDOR, missing ownership checks, weak session handling, or bypassable authorization logic.
  - Missing rate limit or abuse protection on sensitive endpoints such as login, reset, invite, export, payment, or AI calls.
- [ ] **Sensitive Data Protection**:
  - Sensitive data exposure, secret/token leakage, hardcoded credentials, connection strings, private keys, or unsafe debug output.
  - Insecure logging of tokens, passwords, PII, connection strings, full sensitive payloads, or reversible sensitive data.
- [ ] **File, Network & Execution Risks**:
  - SSRF, path traversal, arbitrary file read/write, unsafe upload handling, insecure deserialization, unsafe reflection, or dynamic execution.
- [ ] **Validation & Encoding**:
  - Missing input validation, output encoding, authorization checks, allowlists, size limits, content-type validation, or schema validation.
- [ ] **Cryptography**:
  - Insecure crypto, weak hashes, predictable random values, missing salt, hardcoded keys, custom crypto, or unsafe key management.

---

## 4. Performance & Resource Management

- [ ] **Database Efficiency**:
  - N+1 queries, repeated database roundtrips, missing batching, unnecessary joins, fetching unused columns, or repeated writes.
  - Unpaginated large queries, unbounded result sets, missing limits, or missing necessary index guidance for hot queries.
- [ ] **Async & External Calls**:
  - Synchronous blocking inside async flows, sync-over-async, unawaited tasks, missing cancellation token propagation, or thread-pool starvation risk.
  - External API calls without timeout, retry/backoff, idempotency strategy, or circuit-breaker consideration where failures could cascade.
- [ ] **Memory & Resource Use**:
  - Large allocations, loading entire large files or payloads into memory, unbounded buffers, unclosed streams, undisposed resources, or leaked handles.
  - Unregistered event listeners, long-lived references, growing global caches, or background work that cannot be stopped.
- [ ] **Algorithmic Efficiency**:
  - Inefficient algorithms, repeated computation, unnecessary nested loops, repeated serialization/deserialization, or expensive work in hot paths.
- [ ] **Logging Cost**:
  - Excessive logging in hot paths, logging large payloads, or synchronous logging that can slow requests.
- [ ] **Caching**:
  - Incorrect cache keys, stale cache invalidation, cache stampede risk, missing TTLs, or caching data with user-specific authorization requirements.

---

## 5. Data & Concurrency

- [ ] **Transaction Consistency**: Are related writes protected by transactions or compensating logic where partial failure would corrupt state?
- [ ] **Duplicate Writes & Idempotency**: Can retries, double-clicks, queue redelivery, or webhook replay create duplicate records or repeated side effects?
- [ ] **Race Conditions**: Are there check-then-act races, lost updates, optimistic concurrency gaps, locking mistakes, deadlocks, or shared mutable state issues?
- [ ] **Cache Invalidation**: Does the change keep cache, database, search index, derived data, and client state consistent?
- [ ] **Resource Release**: Are locks, transactions, database connections, file handles, timers, subscriptions, and background workers released on success and failure?
- [ ] **Async Error Handling**: Are async failures observed, propagated, retried safely, or surfaced to monitoring instead of becoming unhandled background errors?

---

## 6. Test Gaps

- [ ] **High-Risk Branches**: Are new critical branches, feature flags, migrations, fallbacks, retries, or failure branches covered?
- [ ] **Error Paths**: Are validation errors, dependency failures, timeouts, malformed data, and partial failures tested?
- [ ] **Permission Boundaries**: Are unauthorized, unauthenticated, wrong-owner, wrong-role, and cross-tenant cases tested?
- [ ] **Data Conversion**: Are serialization, parsing, mapping, rounding, timezone handling, enum changes, and schema compatibility tested?
- [ ] **Regression Scenarios**: Are tests present for the bug being fixed or the existing workflow that could be broken?

---

## 7. SOLID / Design Principles

- [ ] **SRP (Single Responsibility Principle)**: Does a class, method, component, or service take on too many responsibilities, making bugs or tests more likely?
- [ ] **OCP (Open/Closed Principle)**: Will common new requirements require repeatedly editing fragile core logic instead of extending through stable seams?
- [ ] **LSP (Liskov Substitution Principle)**: Do inheritance, interface, or polymorphic changes violate existing contracts or caller assumptions?
- [ ] **ISP (Interface Segregation Principle)**: Are callers forced to depend on methods, fields, DTO members, or service operations they do not need?
- [ ] **DIP (Dependency Inversion Principle)**: Do high-level modules directly depend on concrete implementations in a way that makes testing, replacement, or isolation difficult?

Only list SOLID/design findings when the violation clearly increases defect risk, breaks extension, makes tests meaningfully harder, or creates concrete maintenance risk. Do not report abstract design preferences as findings.

---

## 8. Logging / Observability

- [ ] **Coverage of Important Failure Points**: Do important error paths, external APIs, database operations, background jobs, scheduled jobs, payment flows, and AI calls have enough logging or telemetry to debug production failures?
- [ ] **Diagnostic Context**: Do logs include useful correlation fields such as request id, entity id, user/tenant identifier when safe, operation, status, duration, and exception details?
- [ ] **Log Levels**: Are expected business outcomes logged below `error`, and real failures not hidden as `debug` or omitted entirely?
- [ ] **Sensitive Data Safety**: Logs must not include tokens, passwords, connection strings, personal data, full sensitive payloads, or content that can reconstruct sensitive data.
- [ ] **Signal-to-Noise**: Do not require logging on every line. Report logging gaps only for failure points that would be difficult to investigate after deployment.

---

## 9. Maintainability & Style

- [ ] **Clear Naming**: Are variables, functions, classes, files, and modules named clearly enough to reflect intent?
- [ ] **Complexity Control**:
  - Is a function, method, component, or query too long or deeply nested to review safely?
  - Is cyclomatic complexity high enough to hide bugs or make tests brittle?
- [ ] **Modularity & Duplication**:
  - Does the code avoid meaningful duplication, copy-pasted business rules, and divergent validation logic?
  - Is shared behavior placed at the right abstraction level without over-engineering?
- [ ] **Testability**:
  - Is the code easy to unit test or integration test?
  - Are dependencies injectable or isolatable where tests need control over time, I/O, network calls, randomness, or external systems?
- [ ] **Idiomatic Best Practices**: Does the code use language and framework conventions appropriately without fighting the platform?
- [ ] **Formatting & Consistency**:
  - Do indentation, spacing, imports, quotes, naming, and file organization match the codebase?
  - Does the code pass the local formatter, linter, and type checker when applicable?
- [ ] **Comment Quality**:
  - Do comments explain non-obvious intent and tradeoffs instead of restating the code?
  - Has obsolete, misleading, or commented-out dead code been removed?
