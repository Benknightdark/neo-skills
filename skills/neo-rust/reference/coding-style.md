# Rust Coding Style & Toolchain Standards

## Naming Conventions

| Construct | Convention | Example |
|---|---|---|
| `struct` | `PascalCase` | `UserProfile` |
| `enum` | `PascalCase` | `PaymentStatus` |
| `enum` variant | `PascalCase` | `Pending`, `Paid` |
| `trait` | `PascalCase` | `Repository`, `Serialize` |
| Function / method | `snake_case` | `create_user`, `find_by_id` |
| Variable | `snake_case` | `user_name` |
| Constant / `static` | `SCREAMING_SNAKE_CASE` | `MAX_RETRY_COUNT` |
| Module | `snake_case` | `user_service` |
| Lifetime | Short lowercase | `'a`, `'de`, `'src` |

### Getter Naming
Rust omits the `get_` prefix on property accessors:

```rust
// Bad: fn get_name(&self) -> &str
// Good:
impl User {
    fn name(&self) -> &str {
        &self.name
    }

    fn name_mut(&mut self) -> &mut String {
        &mut self.name
    }
}
```

### Conversion Naming (`as_`, `to_`, `into_`)

| Prefix | Ownership & Cost | Example |
|---|---|---|
| `as_` | Free/cheap borrowed view (`&self -> &T`) | `as_str()` |
| `to_` | Expensive or allocating conversion (`&self -> T`) | `to_string()` |
| `into_` | Consuming ownership conversion (`self -> T`) | `into_bytes()` |

### Iterator Naming
Collection types should expose standard iteration methods:

```rust
fn iter(&self) -> Iter<'_>
fn iter_mut(&mut self) -> IterMut<'_>
fn into_iter(self) -> IntoIter
```

---

## Import Style

Group imports from the same module path and avoid wildcard (`*`) globs outside `tests` or `prelude` modules:

```rust
// Good
use crate::domain::user::{User, UserId, UserStatus};

// Avoid in production modules
use crate::domain::user::*;
```

---

## Module & Project Structure

### Core Layering Principles

| Principle | Guideline |
|---|---|
| Thin `main.rs` | Handle CLI/runtime wiring and process exit codes only |
| Business logic in `lib.rs` | Enables integration testing and crate reuse |
| Domain independence | `domain` types must not depend on `infra` adapters |
| Minimal `pub` surface | Keep fields and helpers private by default |
| Crate-layer error boundaries | Typed error `enum`s in `domain`/`lib` ([anti-patterns.md](anti-patterns.md#5-string-errors-and-sentinel-magic-values)); `Box<dyn std::error::Error>` or context wrappers at CLI/app entrypoints |
| Tests near code | Place small unit tests in `#[cfg(test)] mod tests` beside implementation |

### CLI / Small Tools

```text
src/
  main.rs
  cli.rs
  config.rs
  error.rs
```

```rust
fn main() {
    if let Err(err) = run() {
        eprintln!("error: {err}");
        std::process::exit(1);
    }
}

fn run() -> Result<(), Box<dyn std::error::Error>> {
    Ok(())
}
```

### Web API / Layered Service

```text
src/
  main.rs          # Binary entrypoint
  lib.rs           # Crate root & reusable logic
  app.rs           # DI, router & runtime assembly
  config.rs
  error.rs
  domain/          # Entities, rules & state enums
  service/         # Application use cases
  infra/           # DB, HTTP, cache & file adapters
```

---

## Toolchain, CI & Modern Cargo Standards

### Verification Commands

```bash
cargo fmt -- --check
cargo check
cargo clippy --all-targets -- -D warnings
cargo test
cargo build --release
```

### Recommended CI Workflow

```yaml
name: Rust CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: cargo fmt -- --check
      - run: cargo check
      - run: cargo clippy --all-targets -- -D warnings
      - run: cargo test
```

### Modern `Cargo.toml` & Edition 2024 Configuration

Specify `edition = "2024"`, an explicit MSRV (`rust-version`), and centralized `[lints]` tables:

```toml
[package]
name = "example-service"
version = "0.1.0"
edition = "2024"
rust-version = "1.100"

[lints.rust]
unsafe_op_in_unsafe_fn = "deny"
mismatched_lifetime_syntaxes = "warn"

[lints.cargo]
unused_dependencies = "warn"

[lints.clippy]
all = { level = "warn", priority = -1 }
unwrap_used = "warn"
```

### Cargo & Conditional Compilation Notes (1.85 – 1.100+)
* **MSRV-Aware Dependency Resolution (1.85+ / Edition 2024)**: Cargo automatically respects `package.rust-version` when selecting dependency versions.
* **Workspace Publishing (1.90+)**: Use `cargo publish --workspace` to publish multi-crate workspaces in topological dependency order.
* **Cargo Config `include` & TOML 1.1 (1.94+)**: Modularize shared `.cargo/config.toml` settings via `include`.
* **Supply-Chain Cooldowns (1.100+)**: Configure `min-publish-age` (or `global-min-publish-age` in `.cargo/config.toml`) to avoid newly published malicious crate versions.
* **Conditional Compilation (`cfg_select!`, 1.95+)**: Prefer `cfg_select! { unix => { ... } windows => { ... } _ => { ... } }` over chained `#[cfg(...)]` / `#[cfg(not(...))]` blocks or external `cfg-if` crates.
