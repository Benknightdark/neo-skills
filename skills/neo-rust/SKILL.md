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

Write safe, maintainable, and idiomatic Rust code (targeting Rust 2021 / 2024 Editions through **Rust 1.100+**) by leveraging the type system, ownership boundaries, and modern language/Cargo conventions.

## Gotchas

* **Async Mutex Across `.await`**: `std::sync::MutexGuard` is not `Send` and cannot cross `.await` points. Limit the lock to an inner `{}` block before `.await`, or use `tokio::sync::Mutex`.
* **Excessive `.clone()`**: Do not clone just to appease the borrow checker. Prefer borrowed parameters (`&str`, `&[T]`, `&T`) or restructure ownership and lifetimes.
* **Unchecked `.unwrap()` / `panic!()`**: Never call `.unwrap()` or `panic!()` in library or production paths; propagate errors with `Result<T, E>`, `Option<T>`, `?`, or `let...else`.
* **Edition 2024 Unsafe Env & FFI**: In Rust 2024 Edition (1.85+), `std::env::set_var` / `remove_var` are `unsafe` (multi-threaded data races), and FFI requires `unsafe extern` blocks plus `#[unsafe(no_mangle | export_name | link_section)]`. Prefer config injection or `Command::env` for child processes.
* **Edition 2024 RPIT Capture & `#[expect]`**: Return-position `impl Trait` (`-> impl Trait`) captures all in-scope lifetimes by default in Edition 2024—use `+ use<'a, T>` to restrict captures. Prefer `#[expect(lint, reason = "...")]` over `#[allow(lint)]` so obsolete suppressions surface as warnings.

## Feature Roadmap (Rust 1.85 / 2024 Edition – 1.100.0)

* **Rust 1.85 & 2024 Edition**: Native async closures (`async || {}`, `AsyncFn*`), RPIT `use<..>` precise capturing, `Future`/`IntoFuture` in prelude, narrower `if let`/tail temporary scopes, `unsafe extern` & `#[unsafe(...)]`, MSRV-aware Cargo resolver.
* **Rust 1.86 – 1.93**: Trait upcasting (`&dyn Subtrait` -> `&dyn Supertrait`), `slice`/`HashMap::get_disjoint_mut`, `std::io::pipe`, `let` chains (`if let ... && let ...`), `#[unsafe(naked)]`, const generic `_` inference, `mismatched_lifetime_syntaxes` lint, `cargo publish --workspace`.
* **Rust 1.94 – 1.99**: `slice::array_windows::<N>()`, Cargo config `include` & TOML 1.1, `cfg_select!` macro, `if let` match guards, `Copy` range types (`core::range::*`), `assert_matches!`, default `v0` symbol mangling, `Layout::for_value_raw` & `extern "C"` variadics.
* **Rust 1.100.0**: Stabilized Never Type (`!`), `std::alloc::Allocator` (`Box::new_in`, `Vec::new_in`), `std::mem::DropGuard` (`new`, `dismiss`), `bool::toggle` / `Vec::from_fn` / `str::trim_prefix`, Cargo `min-publish-age` & `cargo::unused_dependencies`.

## Workflow

1. **Perceive (Inventory & Version Check)**: Check `Cargo.toml` for `edition` (`"2021"` vs `"2024"`) and `rust-version` (MSRV), scan `.rs` files, and identify the task type (feature development, refactoring, or code review).
2. **Reason (Dynamic Reference Routing)**: Load only the reference docs needed for the task:
   * **Architecture, Design & Modern Rust APIs**: Load [patterns.md](reference/patterns.md).
   * **Code Review, Refactoring & Pitfall Fixes**: Load [anti-patterns.md](reference/anti-patterns.md).
   * **Naming, Project Layout, Cargo & Toolchain Setup**: Load [coding-style.md](reference/coding-style.md).
3. **Act & Validate (Compile & Clippy Loop)**: Implement changes matching the target edition/MSRV, then run `cargo check` and `cargo clippy --all-targets -- -D warnings`. Inspect compiler diagnostics and iterate until zero warnings remain.
4. **Format & Deliver**: Run `cargo fmt` and present the output using the matching template below.

## Output Templates

### Template A: Code Review Report
```markdown
# Rust Code Review Report

## 1. Executive Summary
* **Score**: [1-10 rating]
* **Summary**: [Overall feedback on code quality, ownership usage, and error handling]

## 2. Findings
> [!IMPORTANT]
> Order findings by severity (Error > Warning > Info).

* **[Severity] Location: `src/main.rs:L12` - [Finding Title]**
  * **Description**: [Why is this an issue? Which Rust best practice is violated?]
  * **Recommendation**:
    ```rust
    // Idiomatic Rust example demonstrating the fix
    ```

## 3. Top 3 Recommendations
1. [First actionable improvement]
2. [Second actionable improvement]
3. [Third actionable improvement]
```

### Template B: Implementation & Refactoring Summary
```markdown
# Rust Implementation / Refactoring Summary

## 1. Overview of Changes
[Briefly summarize what Rust modules, structs, or traits were added or refactored]

## 2. Applied Design Patterns & Best Practices
* [e.g., Applied `let` chains and `array_windows` for safe, flat logic]
* [e.g., Replaced `.clone()` with `&str` for zero-copy borrowing]

## 3. Local Verification Results
- [x] `cargo check` passed
- [x] `cargo clippy` passed with zero warnings
- [x] `cargo fmt` completed successfully

## 4. Next Steps
1. [Recommended next action, e.g., run `cargo test`]
2. [Other relevant suggestions]
```

## Documentation

### Official References
- [The Rust Programming Language (The Book)](https://doc.rust-lang.org/book/)
- [Rust Edition Guide (Rust 2024 Edition)](https://doc.rust-lang.org/edition-guide/rust-2024/index.html)
- [Rust Standard Library (`std`) Documentation](https://doc.rust-lang.org/std/)
- [The Rust Reference](https://doc.rust-lang.org/reference/)
- [Rust API Guidelines](https://rust-lang.github.io/api-guidelines/)
- [The Cargo Book](https://doc.rust-lang.org/cargo/)
- [Rustc Book (Lints & Compiler Options)](https://doc.rust-lang.org/rustc/)
- [Clippy Lints Documentation](https://doc.rust-lang.org/stable/clippy/lints.html)
- [Official Rust Release Notes & Blog](https://blog.rust-lang.org/releases/)
- [Tokio Async Runtime & Sync Documentation](https://docs.rs/tokio/latest/tokio/)

### Internal References
- [Rust Design Patterns & Modern 1.85–1.100+ Idioms](reference/patterns.md)
- [Rust Anti-Patterns, Hazards & Modernization Fixes](reference/anti-patterns.md)
- [Rust Coding Style, Toolchain & Cargo Standards](reference/coding-style.md)
