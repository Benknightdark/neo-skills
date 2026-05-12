# 4. Coding Style

---

## Naming Conventions

| Type | Best Practice |
|---|---|
| struct | `UserProfile` |
| enum | `PaymentStatus` |
| enum variant | `Pending`, `Paid` |
| trait | `Repository`, `Serialize` |
| function | `create_user` |
| method | `find_by_id` |
| variable | `user_name` |
| constant | `MAX_RETRY_COUNT` |
| module | `user_service` |
| lifetime | `'a`, `'de`, `'src` |

---

## Getter Naming

Rust convention typically does not include the `get_` prefix.

### Bad

```rust
impl User {
    fn get_name(&self) -> &str {
        &self.name
    }
}
```

### Good

```rust
impl User {
    fn name(&self) -> &str {
        &self.name
    }

    fn name_mut(&mut self) -> &mut String {
        &mut self.name
    }
}
```

---

## Conversion Naming: `as_`, `to_`, `into_`

| Naming | Meaning | Example |
|---|---|---|
| `as_` | Cheap borrowing conversion | `as_str()` |
| `to_` | Produces a new value, may allocate memory | `to_string()` |
| `into_` | Consumes self, converts to another owned value | `into_bytes()` |

### Example

```rust
struct UserName(String);

impl UserName {
    fn as_str(&self) -> &str {
        &self.0
    }

    fn into_string(self) -> String {
        self.0
    }
}
```

---

## Iterator Naming

For Collection types, it is recommended to provide:

```rust
fn iter(&self) -> Iter
fn iter_mut(&mut self) -> IterMut
fn into_iter(self) -> IntoIter
```

---

## Module Style

Recommended structure:

```text
src/
  main.rs          # binary entry
  lib.rs           # library entry
  config.rs
  error.rs
  domain/
    mod.rs
    user.rs
    order.rs
  infra/
    mod.rs
    db.rs
    http.rs
  service/
    mod.rs
    user_service.rs
```

### Principles

| Principle | Description |
|---|---|
| Thin `main.rs` | Only responsible for assembly and startup |
| Business logic in `lib.rs` | Facilitates testing |
| Domain types don't depend on infra | Avoids coupling |
| Minimize `pub` | Private by default |
| Centralized error management | Don't use `String` for errors everywhere |
| Tests near code | Small unit tests can be placed in the same file under `mod tests` |

---

## Import Style

### Bad

```rust
use crate::domain::user::User;
use crate::domain::user::UserId;
use crate::domain::user::UserStatus;
```

### Good

```rust
use crate::domain::user::{User, UserId, UserStatus};
```

### Not Recommended

```rust
use crate::domain::user::*;
```

The glob operator `*` is acceptable in tests or preludes, but should be avoided in formal modules.

---

## Error Style

### Application / CLI

Flexible errors can be used:

```rust
fn run() -> Result<(), Box<dyn std::error::Error>> {
    Ok(())
}
```

### Library / Domain

Explicit enums are recommended:

```rust
#[derive(Debug)]
pub enum CreateUserError {
    InvalidEmail,
    DuplicateEmail,
}
```

### Service

Preserve error context:

```rust
fn create_user(email: &str) -> Result<(), CreateUserError> {
    if !email.contains('@') {
        return Err(CreateUserError::InvalidEmail);
    }

    Ok(())
}
```

---

# 5. Rust Toolchain Coding Standard

## Recommended Commands

```bash
cargo fmt -- --check
cargo check
cargo clippy -- -D warnings
cargo test
cargo build --release
```

## Recommended CI

```yaml
name: Rust CI

on:
  push:
  pull_request:

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Format
        run: cargo fmt -- --check

      - name: Check
        run: cargo check

      - name: Clippy
        run: cargo clippy -- -D warnings

      - name: Test
        run: cargo test
```

---

# 6. Summary Table: Good vs. Bad Practices

| Topic | Good Practice | Bad Practice |
|---|---|---|
| Reading text | `&str` | `String` |
| Reading arrays | `&[T]` | `&Vec<T>` |
| Optional values | `Option<T>` | Empty string, `-1`, dummy data |
| Possible failure | `Result<T, E>` | `panic!`, `unwrap()` |
| Finite states | `enum` | `String`, multiple booleans |
| ID / Amount / Units | Newtype | Always using `u64` / `String` |
| Many parameters | Builder | Extremely long constructor |
| State transitions | Typestate | Runtime flags |
| Abstract behavior | trait | Hard-coding concrete dependencies |
| Data conversion | iterator chain | Large temporary mutable vectors |
| Resource management | RAII / `Drop` | Manual close (easy to forget) |
| Shared data | Clear ownership / channel | `Arc<Mutex<T>>` everywhere |
| Async concurrency | Bounded concurrency | Unrestricted `spawn` |
| Formatting | `cargo fmt` | Manual formatting |
| Static analysis | `cargo clippy` | Relying on manual review |

---

# 7. Practical Rust Coding Guidelines

---

## When Writing Functions

Priority order:

```rust
fn read_only(value: &T)
fn read_text(value: &str)
fn read_list(value: &[T])
fn mutate(value: &mut T)
fn consume(value: T)
fn flexible_owned(value: impl Into<T>)
```

---

## When Writing Structs

```rust
pub struct User {
    id: UserId,
    email: Email,
}

impl User {
    pub fn new(id: UserId, email: Email) -> Self {
        Self { id, email }
    }

    pub fn id(&self) -> UserId {
        self.id
    }

    pub fn email(&self) -> &Email {
        &self.email
    }
}
```

---

## When Writing Enums

```rust
enum Command {
    CreateUser { email: Email },
    DeleteUser { id: UserId },
    Shutdown,
}
```

Better than:

```rust
struct Command {
    action: String,
    payload: String,
}
```

---

## When Writing Errors

```rust
#[derive(Debug)]
enum AppError {
    ConfigMissing,
    InvalidInput,
    DatabaseUnavailable,
}
```

Better than:

```rust
Err("something went wrong".to_string())
```

---

# 8. Project Starter Recommendations

---

## CLI / Small Tools

```text
src/
  main.rs
  cli.rs
  config.rs
  error.rs
```

Key points:

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

---

## Web API / Proxy Server

```text
src/
  main.rs
  config.rs
  error.rs
  app.rs
  domain/
  service/
  infra/
    http_client.rs
    repository.rs
```

Key points:

| Layer | Responsibility |
|---|---|
| `domain` | Types, rules, states |
| `service` | Use cases |
| `infra` | DB, HTTP, Redis, Files |
| `app` | DI / Router / Runtime assembly |
| `main` | Startup |

---

# 9. Key Conclusion

Good Rust code typically looks like this:

```rust
pub fn create_user(repo: &impl UserRepository, email: &str) -> Result<UserId, CreateUserError> {
    let email = Email::new(email).map_err(|_| CreateUserError::InvalidEmail)?;

    if repo.exists(&email)? {
        return Err(CreateUserError::DuplicateEmail);
    }

    repo.insert(&email)
}
```

It possesses several characteristics:

1. Inputs use borrows: `&str`
2. Invalid data is blocked by smart constructors: `Email::new`
3. Errors use `Result`
4. Business errors are categorizable: `CreateUserError`
5. Dependencies are abstracted via traits: `UserRepository`
6. No reckless `unwrap`
7. No stringly-typed states
8. No redundant clones
9. Easy to test
10. The compiler prevents a large class of errors

True Rust design patterns aren't about "making classes look pretty," but rather:

> Making illegal states unrepresentable, forcing error paths to be handled by the type system, and making ownership so clear it doesn't need to be guessed.

---

# 10. References

- Rust Book - Understanding Ownership
  https://doc.rust-lang.org/book/ch04-00-understanding-ownership.html

- Rust Book - Recoverable Errors with Result
  https://doc.rust-lang.org/book/ch09-02-recoverable-errors-with-result.html

- Rust Book - Match Control Flow Construct
  https://doc.rust-lang.org/book/ch06-02-match.html

- Rust Book - Smart Pointers
  https://doc.rust-lang.org/book/ch15-00-smart-pointers.html

- Rust Book - Message Passing
  https://doc.rust-lang.org/book/ch16-02-message-passing.html

- Rust Book - Async and Await
  https://doc.rust-lang.org/book/ch17-01-futures-and-syntax.html

- Rust API Guidelines - Naming
  https://rust-lang.github.io/api-guidelines/naming.html

- Clippy Lints
  https://doc.rust-lang.org/stable/clippy/lints.html

- Cargo Check
  https://doc.rust-lang.org/cargo/commands/cargo-check.html

- Tokio Tutorial - Channels
  https://tokio.rs/tokio/tutorial/channels

- Tokio Mutex Documentation
  https://docs.rs/tokio/latest/tokio/sync/struct.Mutex.html
