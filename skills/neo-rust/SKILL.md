---
name: neo-rust
description: >
  Use this skill when writing, refactoring, debugging, modernizing, or auditing Rust
  code. Trigger for .rs files, Cargo projects, Rust 2024 Edition or version-specific
  features (up to Rust 1.100+), ownership/borrowing/lifetime issues, Result/Option
  error handling, async closures, unnecessary clone/performance work, unsafe code
  review, or modern Rust architecture.
license: MIT
compatibility: "Supports Rust 2021 and 2024 Editions (Rust 1.75 through 1.100+). Requires Rust toolchain (rustc, cargo, clippy, rustfmt) installed."
metadata:
  version: "1.2.0"
  pattern: tool-wrapper, reviewer
  domain: rust
---

# Neo Rust Expert

Write safe, maintainable, and idiomatic Rust code (targeting Rust 2021 / 2024 Editions up through **Rust 1.100+**) by strictly following official design patterns, leveraging Rust's type system, and avoiding anti-patterns.

## Gotchas

* **Gotcha 1 (Async Mutex Deadlock / Send Error)**:
  In an `async` function, using the standard library's `std::sync::Mutex` and holding its `MutexGuard` across an `.await` boundary will cause a compiler error because `MutexGuard` does not implement `Send` and cannot be transferred across threads.
  * *Solution*: Use a local block `{}` to limit the `MutexGuard` lifetime before the `.await`, or use `tokio::sync::Mutex` instead.
* **Gotcha 2 (Excessive Cloning)**:
  To satisfy the Borrow Checker, beginners often call `.clone()` excessively, which introduces significant memory allocation and copy overhead.
  * *Solution*: Prioritize passing borrowed references (e.g., `&str` instead of `String`, `&[T]` instead of `Vec<T>`), or refactor ownership structures and lifetimes.
* **Gotcha 3 (Unsafe Unwrapping)**:
  Using `.unwrap()` or `panic!()` directly in library or production-grade code will cause the application to crash, violating Rust's safety-first principle.
  * *Solution*: Always return `Result<T, E>` or `Option<T>` for graceful error propagation, and use the `?` operator or `match` expression to handle them.
* **Gotcha 4 (Rust 2024 Edition Unsafe Environment & FFI Rules)**:
  In Rust 2024 Edition (1.85+), `std::env::set_var` and `std::env::remove_var` are `unsafe` functions because mutating environment variables in a multi-threaded program causes data races / UB on POSIX platforms. In addition, `extern` blocks must be declared `unsafe extern`, and soundness-critical attributes must use `#[unsafe(no_mangle)]`, `#[unsafe(export_name = "...")]`, or `#[unsafe(link_section = "...")]`.
  * *Solution*: Avoid mutating process environment variables at runtime (pass configuration structs or use `std::process::Command::env` for child processes), and use explicit `unsafe extern` and `#[unsafe(...)]` syntax in Edition 2024.
* **Gotcha 5 (RPIT Lifetime Capture Rules in Edition 2024 & `#[expect]` over `#[allow]`)**:
  In Rust 2024 Edition, return-position `impl Trait` (RPIT) captures all in-scope type and lifetime parameters by default, which can unintentionally tie the returned opaque type's lifetime to a temporary input borrow. Also, using `#[allow(lint)]` hides when a suppressed warning is no longer triggered.
  * *Solution*: Use precise capturing syntax `-> impl Iterator<Item = U> + use<T>` (stabilized in 1.85 for functions and 1.87 in traits) to restrict captured lifetimes explicitly. Prefer `#[expect(lint, reason = "...")]` over `#[allow(lint)]` so the compiler warns when a suppression becomes obsolete.

## Feature Roadmap (Rust 1.85 / 2024 Edition – 1.100.0)

### Rust 1.85 & Rust 2024 Edition (Foundation & Ergonomics)
- **Async Closures (`async || {}`)**: Native `AsyncFn`, `AsyncFnMut`, and `AsyncFnOnce` traits allow closures to borrow from their captured environment across `.await` points.
- **RPIT Lifetime Capture Rules & `use<..>` Bounds**: Return-position `impl Trait` captures all in-scope lifetimes by default in Edition 2024, with explicit `+ use<'a, T>` syntax for precise control (extended to traits in 1.87).
- **Explicit Unsafe Operations**: `unsafe extern` blocks, `#[unsafe(no_mangle)]` / `#[unsafe(export_name)]`, and `unsafe` `std::env::set_var` / `remove_var`.
- **Prelude & Temporary Scopes**: `Future` and `IntoFuture` added to the standard prelude; narrower temporary drop scopes in `if let` and tail expressions prevent accidental lock hold extensions.
- **Cargo MSRV-Aware Resolver**: Dependency resolution respects `package.rust-version` by default in Edition 2024.

### Rust 1.86 – 1.93 (Language & Concurrency Enhancements)
- **Trait Upcasting (1.86)**: Coerce `&dyn Subtrait` directly into `&dyn Supertrait` without boilerplate conversion methods.
- **Disjoint Mutable Indexing (1.86)**: `slice::get_disjoint_mut` and `HashMap::get_disjoint_mut` safely borrow multiple non-overlapping elements mutably at once.
- **Anonymous Pipes (1.87)**: `std::io::pipe()` provides cross-platform anonymous OS pipes integrating cleanly with `std::process::Command`.
- **`let` Chains & Naked Functions (1.88)**: Chain multiple `let` bindings and boolean conditions with `&&` in `if` and `while` (`if let Some(a) = x && let Ok(b) = a.parse() && b > 0`); `#[unsafe(naked)]` for assembly routines; automatic Cargo cache garbage collection.
- **Const Generics Inference & Lifetime Lint (1.89–1.93)**: Infer const generic arguments via `_` (e.g., `[0u8; _]`), `mismatched_lifetime_syntaxes` lint (1.89), `cargo publish --workspace` (1.90), dangling raw pointer lints (1.91), default unwind tables with `-Cpanic=abort` on Linux (1.92), and `std::thread_local!` support inside global allocators (1.93).

### Rust 1.94 – 1.99 (Pattern Matching & Low-Level Capabilities)
- **`slice::array_windows` & Cargo TOML 1.1 (1.94)**: Fixed-size array sliding windows (`slice.array_windows::<N>()`) returning `&[T; N]`, plus Cargo config `include` and TOML 1.1 support.
- **`cfg_select!` & `if let` Match Guards (1.95)**: Declarative `cfg_select!` macro for mutually exclusive platform/feature branches, and `if let` guards on `match` arms (`Some(x) if let Ok(v) = parse(x) => ...`).
- **`Copy` Range Types & `assert_matches!` (1.96)**: New `core::range::{Range, RangeFrom, RangeInclusive}` types implementing `Copy` and `IntoIterator`, plus `assert_matches!` / `debug_assert_matches!`.
- **Symbol Mangling v0 & Raw Pointer Layouts (1.97–1.99)**: Default `v0` symbol mangling (1.97), algebraic floating-point helpers (1.98), stabilized raw pointer layout queries (`Layout::for_value_raw`, `mem::size_of_val_raw`, `mem::align_of_val_raw`) and `extern "C"` variadics (1.99).

### Rust 1.100.0 (Milestone Stabilizations)
- **The Never Type (`!`)**: Canonical uninhabited type `!` stabilized in type positions (e.g., `Result<T, !>`, diverging callbacks) with never-to-any coercions.
- **Allocator API (`std::alloc::Allocator`)**: Core `Allocator` trait stabilized for custom memory allocation strategies with `Box` (`Box::new_in`) and `Vec` (`Vec::new_in`).
- **`DropGuard` API & Convenience Methods**: Standard library `std::mem::DropGuard` for scope-based rollback/cleanup, plus utility APIs such as `bool::toggle`, `Vec::from_fn`, and `str::trim_prefix` / `str::trim_suffix`.
- **Cargo Supply-Chain & Lint Enhancements**: `min-publish-age` / `global-min-publish-age` configuration for dependency cooldown windows, unused dependency reporting (`cargo::unused_dependencies`), and reduced target cache collisions.

## Workflow Checklist

Progress:
- [ ] Step 1: Perceive & Inventory (Check `Cargo.toml` for `edition` and `rust-version` MSRV, scan `.rs` files, and clarify whether the task is "feature development", "refactoring", or "Code Review").
- [ ] Step 2: Load Reference (Based on the task type, dynamically load corresponding reference files: load `reference/patterns.md` and `reference/coding-style.md` for writing new code, and load `reference/anti-patterns.md` for reviews and debugging).
- [ ] Step 3: Implement & Validate (After writing or modifying code, compile and analyze it locally using `cargo check` and `cargo clippy`. Ensure syntax matches the target `edition` and `rust-version`, and fix any warnings or errors until compilation passes cleanly).
- [ ] Step 4: Format & Finalize (Run `cargo fmt` to format the code according to official guidelines, and present output using the Output Templates).

## Detailed Guidelines

### Step 1 — Parse & Inventory
1. Inspect the current directory to verify if `Cargo.toml` exists, and check `edition` (`"2021"` vs `"2024"`) and `rust-version` (MSRV) so syntax and API choices match the project's compatibility floor.
2. Analyze the task. For Code Review tasks, read existing changes; for feature development, determine the target modules to create or modify.

### Step 2 — Dynamic Reference Loading
To save context space, only this `SKILL.md` is loaded initially. Once executing the task, the Agent **must** load the following resources:
* **Development & Architecture**: Load [patterns.md](reference/patterns.md) and [coding-style.md](reference/coding-style.md).
* **Review, Refactoring & Debugging**: Load [anti-patterns.md](reference/anti-patterns.md).

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
