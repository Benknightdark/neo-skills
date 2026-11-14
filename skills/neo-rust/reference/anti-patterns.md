# 3. Anti-patterns

---

## Anti-pattern 1: Using `.clone()` everywhere to avoid the borrow checker

### Bad

```rust
fn process(name: String) {
    println!("{name}");
}

fn main() {
    let name = String::from("Alice");

    process(name.clone());
    process(name.clone());
    process(name.clone());
}
```

### Good

```rust
fn process(name: &str) {
    println!("{name}");
}

fn main() {
    let name = String::from("Alice");

    process(&name);
    process(&name);
    process(&name);
}
```

### Principle

`.clone()` is not forbidden, but you should know why you are cloning.
If you only need to read the data, use a borrow instead.

---

## Anti-pattern 2: Excessive use of `String`

### Bad

```rust
fn is_admin(role: String) -> bool {
    role == "admin"
}
```

### Good

```rust
fn is_admin(role: &str) -> bool {
    role == "admin"
}
```

### Principle

Use `String` when you need ownership; prefer `&str` for reading text.

---

## Anti-pattern 3: Using `bool` to represent complex states

### Bad

```rust
struct User {
    is_active: bool,
    is_deleted: bool,
    is_locked: bool,
}
```

Problem: Contradictory states can occur, such as being both `active` and `deleted`.

### Good

```rust
enum UserStatus {
    Active,
    Deleted,
    Locked,
}

struct User {
    status: UserStatus,
}
```

---

## Anti-pattern 4: Using `String` for errors

### Bad

```rust
fn parse_age(input: &str) -> Result<u8, String> {
    input.parse::<u8>().map_err(|_| "invalid age".to_string())
}
```

Acceptable for short scripts, but not recommended for libraries or large systems.

### Good

```rust
#[derive(Debug)]
enum ParseAgeError {
    InvalidNumber,
    TooLarge,
}

fn parse_age(input: &str) -> Result<u8, ParseAgeError> {
    let age = input.parse::<u8>().map_err(|_| ParseAgeError::InvalidNumber)?;

    if age > 120 {
        return Err(ParseAgeError::TooLarge);
    }

    Ok(age)
}
```

### Principle

Errors should be categorizable, testable, and handleable.

---

## Anti-pattern 5: Random `panic!` inside a library

### Bad

```rust
pub fn divide(a: i32, b: i32) -> i32 {
    if b == 0 {
        panic!("divide by zero");
    }

    a / b
}
```

### Good

```rust
#[derive(Debug)]
pub enum DivideError {
    DivideByZero,
}

pub fn divide(a: i32, b: i32) -> Result<i32, DivideError> {
    if b == 0 {
        return Err(DivideError::DivideByZero);
    }

    Ok(a / b)
}
```

### Principle

Return `Result` unless it is an unrecoverable programming error.

---

## Anti-pattern 6: Over-abstraction with Traits

### Bad

```rust
trait UserNameProvider {
    fn user_name(&self) -> &str;
}

struct User {
    name: String,
}

impl UserNameProvider for User {
    fn user_name(&self) -> &str {
        &self.name
    }
}
```

Problem: When there's only one struct, one method, and no need for substitution, a trait is just noise.

### Good

```rust
struct User {
    name: String,
}

impl User {
    fn name(&self) -> &str {
        &self.name
    }
}
```

### Principle

Use concrete types first. Abstract into traits only when actually needed.

---

## Anti-pattern 7: Public fields breaking invariants

### Bad

```rust
pub struct Account {
    pub balance: i64,
}

fn main() {
    let mut account = Account { balance: 100 };
    account.balance = -999;
}
```

### Good

```rust
pub struct Account {
    balance: i64,
}

impl Account {
    pub fn new(balance: i64) -> Result<Self, String> {
        if balance < 0 {
            return Err("balance cannot be negative".to_string());
        }

        Ok(Self { balance })
    }

    pub fn balance(&self) -> i64 {
        self.balance
    }

    pub fn deposit(&mut self, amount: i64) -> Result<(), String> {
        if amount <= 0 {
            return Err("amount must be positive".to_string());
        }

        self.balance += amount;
        Ok(())
    }
}
```

---

## Anti-pattern 8: Passing `Arc<Mutex<T>>` everywhere

### Bad

```rust
use std::sync::{Arc, Mutex};

struct AppState {
    users: Arc<Mutex<Vec<String>>>,
    logs: Arc<Mutex<Vec<String>>>,
    configs: Arc<Mutex<Vec<String>>>,
}
```

Problem: Too many locks, unclear responsibilities, prone to deadlocks, and difficult to test.

### Good

```rust
struct UserService {
    users: Vec<String>,
}

impl UserService {
    fn create_user(&mut self, name: String) {
        self.users.push(name);
    }
}
```

### Principle

Prefer single ownership over shared state. Consider `Arc<Mutex<T>>` only when cross-thread access is required.

---

## Anti-pattern 9: Holding a lock across `.await` in async code

### Bad

```rust
// Conceptual illustration
let mut guard = state.lock().await;
do_async_work().await;
guard.push(1);
```

Problem: Holding a lock for too long can cause performance issues or deadlock-like behavior.

### Good

```rust
let data = {
    let mut guard = state.lock().await;
    guard.push(1);
    guard.clone()
};

do_async_work(data).await;
```

### Principle

Keep the code inside a lock as short, synchronous, and necessary as possible.

---

## Anti-pattern 10: Abuse of `unsafe`

### Bad

```rust
unsafe {
    // Using raw pointers haphazardly to bypass the borrow checker
}
```

### Good

Ask yourself first:

1. Can the design be changed using ownership?
2. Can `Rc` / `Arc` be used?
3. Can `RefCell` / `Mutex` be used?
4. Can the data structure be split?
5. Do you really need FFI, SIMD, or low-level memory operations?

### Principle

`unsafe` is not a performance switch; it is taking over the safety responsibilities that the compiler can no longer guarantee.

---

## Anti-pattern 11: Nested `if let` Pyramids Instead of `let...else` or `let` Chains (Rust 1.88+)

### Bad

```rust
fn parse_port(cfg: Option<&Config>) -> Option<u16> {
    if let Some(c) = cfg {
        if let Some(raw) = c.port_str() {
            if let Ok(port) = raw.parse::<u16>() {
                if port > 0 {
                    return Some(port);
                }
            }
        }
    }
    None
}
```

### Good

```rust
fn parse_port(cfg: Option<&Config>) -> Option<u16> {
    if let Some(c) = cfg
        && let Some(raw) = c.port_str()
        && let Ok(port) = raw.parse::<u16>()
        && port > 0
    {
        return Some(port);
    }
    None
}
```

Or use `let ... else` for early exits inside functions returning `Result` or `Option`:

```rust
fn require_port(cfg: Option<&Config>) -> Result<u16, ConfigError> {
    let Some(c) = cfg else {
        return Err(ConfigError::MissingConfig);
    };
    let Some(raw) = c.port_str() else {
        return Err(ConfigError::MissingPort);
    };
    raw.parse::<u16>().map_err(|_| ConfigError::InvalidPort)
}
```

### Principle

Avoid rightward drift. Use `let` chains (`if let ... && let ...`) in Edition 2024 / Rust 1.88+ and `let ... else` for crisp early-return control flow.

---

## Anti-pattern 12: Using `#[allow(...)]` Instead of `#[expect(...)]` for Targeted Lint Suppression (Edition 2024)

### Bad

```rust
// If the underlying issue is fixed later, `#[allow]` silently remains forever
#[allow(clippy::too_many_arguments)]
fn build_request(a: i32, b: i32, c: i32, d: i32, e: i32, f: i32, g: i32, h: i32) {
    // ...
}
```

### Good

```rust
#[expect(
    clippy::too_many_arguments,
    reason = "Legacy C-FFI wrapper; tracked for builder refactor in issue #42"
)]
fn build_request(a: i32, b: i32, c: i32, d: i32, e: i32, f: i32, g: i32, h: i32) {
    // ...
}
```

### Principle

Use `#[expect(lint, reason = "...")]` when intentionally suppressing a specific lint so the compiler notifies you as soon as the suppression is no longer needed.

---

## Anti-pattern 13: Calling `std::env::set_var` in Multi-Threaded Code or Tests (Rust 2024 Edition)

### Bad

```rust
// In Rust 2024 Edition, `std::env::set_var` is `unsafe` because process-wide
// environment mutation causes data races with concurrent `getenv` calls.
#[test]
fn test_reads_custom_endpoint() {
    unsafe {
        std::env::set_var("API_ENDPOINT", "http://localhost:8080");
    }
    let cfg = load_config_from_env();
    assert_eq!(cfg.endpoint, "http://localhost:8080");
}
```

### Good

```rust
fn load_config(lookup: impl Fn(&str) -> Option<String>) -> Config {
    let endpoint = lookup("API_ENDPOINT").unwrap_or_else(|| "https://api.example.com".into());
    Config { endpoint }
}

#[test]
fn test_reads_custom_endpoint() {
    let cfg = load_config(|key| match key {
        "API_ENDPOINT" => Some("http://localhost:8080".into()),
        _ => None,
    });
    assert_eq!(cfg.endpoint, "http://localhost:8080");
}
```

For child processes, pass environment variables safely with `std::process::Command::env`.

### Principle

Never mutate process-global environment variables in concurrent applications or parallel unit tests; inject configuration readers or pass isolated subprocess environments instead.

---

## Anti-pattern 14: Manual Index Splitting or `unsafe` Pointers Instead of `get_disjoint_mut` / `array_windows` (Rust 1.86+ / 1.94+)

### Bad

```rust
// Prone to off-by-one bounds panics or unnecessary `unsafe` aliasing bugs
fn update_pair(values: &mut [i32], i: usize, j: usize) {
    if i < j {
        let (left, right) = values.split_at_mut(j);
        left[i] += 1;
        right[0] += 1;
    }
}

fn max_delta(samples: &[i32]) -> Option<i32> {
    samples.windows(2).map(|w| (w[1] - w[0]).abs()).max()
}
```

### Good

```rust
fn update_pair(values: &mut [i32], i: usize, j: usize) {
    if let Ok([a, b]) = values.get_disjoint_mut([i, j]) {
        *a += 1;
        *b += 1;
    }
}

fn max_delta(samples: &[i32]) -> Option<i32> {
    samples.array_windows::<2>().map(|&[a, b]| (b - a).abs()).max()
}
```

### Principle

Rely on `slice::get_disjoint_mut` (1.86+) and `slice::array_windows` (1.94+) to express disjoint mutation and fixed-width iteration safely without index arithmetic or runtime slice-length indexing.
