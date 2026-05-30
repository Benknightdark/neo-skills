---
name: neo-rust
description: >
  Develop, refactor, or audit Rust code, covering ownership, borrowing, lifetimes, Result/Option error handling, and modern Rust design patterns. Use this skill when the user needs to write Rust programs, perform Rust Code Reviews, optimize performance (e.g., avoiding unnecessary .clone()), or discuss Rust system architecture, even if they do not explicitly say "Rust" as long as .rs files or a Cargo project are involved.
license: MIT
compatibility: Requires environment with Rust toolchain (rustc, cargo) installed
metadata:
  pattern: tool-wrapper, reviewer
  domain: rust
---

# Neo Rust Expert

Write safe, maintainable, and idiomatic Rust code by strictly following the official design patterns, leveraging Rust's powerful type system, and avoiding anti-patterns.

## Gotchas

* **Gotcha 1 (Async Mutex Deadlock / Send Error)**: 
  In an `async` function, using the standard library's `std::sync::Mutex` and holding its `MutexGuard` across an `.await` boundary will cause a compiler error because `MutexGuard` does not implement `Send` and cannot be transferred across threads.
  * *Solution*: Use a local block `{}` to limit the MutexGuard lifetime before the `.await`, or use `tokio::sync::Mutex` instead.
* **Gotcha 2 (Excessive Cloning)**: 
  To satisfy the Borrow Checker, beginners often call `.clone()` excessively, which introduces significant memory allocation and copy overhead.
  * *Solution*: Prioritize passing borrowed references (e.g., `&str` instead of `String`, `&[T]` instead of `Vec<T>`), or refactor ownership structures and lifetimes.
* **Gotcha 3 (Unsafe Unwrapping)**: 
  Using `.unwrap()` or `panic!()` directly in library or production-grade code will cause the application to crash, violating Rust's safety-first principle.
  * *Solution*: Always return `Result<T, E>` or `Option<T>` for graceful error propagation, and use the `?` operator or `match` expression to handle them.

## Workflow Checklist

Progress:
- [ ] Step 1: Perceive & Inventory (Check if `Cargo.toml` and `.rs` files exist in the project, and clarify whether the task is "feature development", "refactoring", or "Code Review").
- [ ] Step 2: Load Reference (Based on the task type, dynamically load corresponding reference files: load `reference/patterns.md` and `reference/coding-style.md` for writing new code, and load `reference/anti-patterns.md` for reviews and debugging).
- [ ] Step 3: Implement & Validate (After writing or modifying code, compile and analyze it locally using `cargo check` and `cargo clippy`. Fix any warnings or errors until compilation passes cleanly without warnings).
- [ ] Step 4: Format & Finalize (Run `cargo fmt` to format the code according to official guidelines, and present output using the Output Templates).

## Detailed Guidelines

### Step 1 — Parse & Inventory
1. Inspect the current directory to verify if `Cargo.toml` exists.
2. Analyze the task. For Code Review tasks, read existing changes; for feature development, determine the target modules to create or modify.

### Step 2 — Dynamic Reference Loading
To save context space, only this `SKILL.md` is loaded initially. Once executing the task, the Agent **must** load the following resources:
* **Development & Architecture**: Load [patterns.md](file:///Users/ben/Projects/neo-skills/skills/neo-rust/reference/patterns.md) and [coding-style.md](file:///Users/ben/Projects/neo-skills/skills/neo-rust/reference/coding-style.md).
* **Review, Refactoring & Debugging**: Load [anti-patterns.md](file:///Users/ben/Projects/neo-skills/skills/neo-rust/reference/anti-patterns.md).

### Step 3 — Compile & Clippy Validation Loop
Verify newly written or modified Rust code to ensure it is 100% compilable:
1. Run `cargo check` to verify syntax and type checking.
2. Run `cargo clippy --all-targets -- -D warnings` to perform strict static analysis and catch potential code smells.
3. If validation fails:
   - Carefully inspect the `stderr` compiler errors or Clippy suggestions.
   - Modify the corresponding code.
   - Re-run validation until it passes cleanly.

## Output Templates

Present your output using the following structured templates depending on the task type.

### Template A: Code Review Report
```markdown
# Rust Code Review Report

## 1. Executive Summary
*   **Score**: [1-10 rating]
*   **Summary**: [Overall feedback on code quality, ownership usage, and error handling]

## 2. Findings
> [!IMPORTANT]
> Order findings by severity (Error > Warning > Info).

*   **[Severity] Location: `src/main.rs:L12` - [Finding Title]**
    *   **Description**: [Why is this an issue? Which Rust best practice is violated?]
    *   **Recommendation**:
        ```rust
        // Idiomatic Rust example demonstrating the fix
        ```

## 3. Top 3 Recommendations
1.  [First actionable improvement]
2.  [Second actionable improvement]
3.  [Third actionable improvement]
```

### Template B: Implementation & Refactoring Summary
```markdown
# Rust Implementation / Refactoring Summary

## 1. Overview of Changes
[Briefly summarize what Rust modules, structs, or traits were added or refactored]

## 2. Applied Design Patterns & Best Practices
*   [e.g., Applied the Typestate Pattern to ensure state safety]
*   [e.g., Replaced `.clone()` with `&str` for performance gains]

## 3. Local Verification Results
- [x] `cargo check` passed
- [x] `cargo clippy` passed with zero warnings
- [x] `cargo fmt` completed successfully

## 4. Next Steps
1.  [Recommended next action, e.g., run cargo test]
2.  [Other relevant suggestions]
```
