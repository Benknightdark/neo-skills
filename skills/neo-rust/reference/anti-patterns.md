# Rust Anti-Patterns, Hazards & Modernization Fixes

Code-review pitfalls, safety traps, and legacy-to-modern migrations (Rust 2021 / 2024 Editions through **1.100+**). For constructive architectural patterns (`Builder`, `Typestate`, `Newtype`, `Smart Constructor`, `DropGuard`, `AsyncFn`, `RPIT use<..>`, `Allocator`), see [patterns.md](patterns.md).

---

## Ownership, Borrowing & Abstraction Traps

### 1. Excessive Cloning and Owned Input Params

**Problem**: Taking `String` or `&Vec<T>` when only reading forces callers to `.clone()` or construct heap allocations just to satisfy the borrow checker.

#### Bad
```rust
fn process(name: String) { println!("{name}"); }
fn sum(numbers: &Vec<i32>) -> i32 { numbers.iter().sum() }

let name = String::from("Alice");
process(name.clone());
process(name.clone());
```

#### Good
```rust
fn process(name: &str) { println!("{name}"); }
fn sum(numbers: &[i32]) -> i32 { numbers.iter().sum() }

let name = String::from("Alice");
process(&name);
process("Bob");
let _ = sum(&[1, 2, 3]);
```

**Rule**: Clone only when independent ownership is required; default to `&str` and `&[T]` (see [Parameter Intake Priority](patterns.md#1-parameter-intake-priority)).

### 2. Public Mutable Fields Breaking Invariants

**Problem**: Exposing fields as `pub` lets any caller violate domain constraints (`account.balance = -999`).

#### Bad
```rust
pub struct Account { pub balance: i64 }
```

#### Good
```rust
#[derive(Debug)]
pub enum AccountError { NegativeBalance, NonPositiveDeposit }

pub struct Account { balance: i64 }

impl Account {
    pub fn new(balance: i64) -> Result<Self, AccountError> {
        (balance >= 0).then_some(Self { balance }).ok_or(AccountError::NegativeBalance)
    }

    pub fn balance(&self) -> i64 { self.balance }

    pub fn deposit(&mut self, amount: i64) -> Result<(), AccountError> {
        if amount <= 0 { return Err(AccountError::NonPositiveDeposit); }
        self.balance += amount;
        Ok(())
    }
}
```

**Rule**: Keep invariant-bearing fields private and validate inside constructors and mutators (see [Smart Constructors](patterns.md#4-smart-constructors-and-private-invariants)).

### 3. Over-Abstraction with Traits

**Problem**: Creating a single-implementation trait (`UserNameProvider` for `User`) adds boilerplate indirection with no substitution benefit.

#### Bad
```rust
trait UserNameProvider { fn user_name(&self) -> &str; }
struct User { name: String }
impl UserNameProvider for User { fn user_name(&self) -> &str { &self.name } }
```

#### Good
```rust
struct User { name: String }
impl User { fn name(&self) -> &str { &self.name } }
```

**Rule**: Start with concrete types; introduce traits only when multiple implementations or test doubles are needed (see [Trait Dispatch](patterns.md#7-trait-dispatch-and-upcasting)).

---

## Error Handling, Indexing & State Bugs

### 4. Unchecked Unwrap, Panic, and Indexing

**Problem**: Calling `.unwrap()`, `panic!()`, or indexing `slice[idx]` in library or production paths crashes the process on malformed inputs or edge cases.

#### Bad
```rust
pub fn divide(a: i32, b: i32) -> i32 {
    if b == 0 { panic!("divide by zero"); }
    a / b
}

fn role_at(roles: &[&str], id: i32) -> String {
    roles[id as usize].to_string() // Negative i32 wraps; out-of-bounds panics
}
```

#### Good
```rust
#[derive(Debug)]
pub enum DivideError { DivideByZero }

pub fn divide(a: i32, b: i32) -> Result<i32, DivideError> {
    if b == 0 { return Err(DivideError::DivideByZero); }
    Ok(a / b)
}

fn role_at(roles: &[&str], id: i32) -> Option<String> {
    let idx = usize::try_from(id).ok()?;
    roles.get(idx).map(|role| (*role).to_string())
}
```

**Rule**: Return `Result<T, E>` or `Option<T>`, propagate with `?`, and replace unchecked `slice[idx]` with `.get(...)`.

### 5. String Errors and Sentinel Magic Values

**Problem**: Returning `Result<T, String>` prevents programmatic matching, while empty strings (`""`) or `-1` confuse missing data with valid values.

#### Bad
```rust
fn find_user_name(id: u64) -> String {
    if id == 1 { "Alice".into() } else { String::new() }
}

fn parse_age(input: &str) -> Result<u8, String> {
    input.parse::<u8>().map_err(|_| "invalid age".to_string())
}
```

#### Good
```rust
fn find_user_name(id: u64) -> Option<String> {
    (id == 1).then(|| "Alice".to_string())
}

#[derive(Debug)]
enum ParseAgeError { InvalidNumber, TooLarge }

fn parse_age(input: &str) -> Result<u8, ParseAgeError> {
    let age = input.parse::<u8>().map_err(|_| ParseAgeError::InvalidNumber)?;
    if age > 120 { return Err(ParseAgeError::TooLarge); }
    Ok(age)
}
```

**Rule**: Use `Option<T>` for absence and typed error `enum`s for library/domain failures (see [coding-style.md](coding-style.md#module--project-structure) for CLI entrypoints).

### 6. Stringly-Typed States and Boolean Flags

**Problem**: `String` state tags allow typos (`"paied"`), and overlapping `bool` fields permit contradictory states (both active and deleted).

#### Bad
```rust
struct User { is_active: bool, is_deleted: bool, is_locked: bool }
struct Payment { status: String }
```

#### Good
```rust
enum UserStatus { Active, Deleted, Locked }
struct User { status: UserStatus }
```

**Rule**: Model mutually exclusive states with an `enum` and exhaustive `match` (see [Enums & Newtypes](patterns.md#3-enums-and-newtypes)).

---

## Concurrency & `unsafe` Hazards

### 7. Spreading Arc and Mutex Everywhere

**Problem**: Wrapping unrelated fields in `Arc<Mutex<T>>` creates lock-ordering deadlock risks, unclear ownership, and brittle tests.

#### Bad
```rust
use std::sync::{Arc, Mutex};

struct AppState {
    users: Arc<Mutex<Vec<String>>>,
    logs: Arc<Mutex<Vec<String>>>,
    configs: Arc<Mutex<Vec<String>>>,
}
```

#### Good
```rust
struct UserService { users: Vec<String> }

impl UserService {
    fn create_user(&mut self, name: String) { self.users.push(name); }
}
```

**Rule**: Prefer single ownership or [Message Passing](patterns.md#11-message-passing-and-actors); reserve `Arc<Mutex<T>>` for genuinely shared cross-thread state.

### 8. Holding Locks Across Await

**Problem**: Holding `std::sync::MutexGuard` across `.await` causes a `!Send` compile error; holding `tokio::sync::MutexGuard` across slow I/O stalls concurrent tasks.

#### Bad
```rust
async fn bad_lock(state: &std::sync::Mutex<Vec<u32>>) {
    let mut guard = state.lock().expect("mutex not poisoned");
    do_async_work(0).await;
    guard.push(1);
}
```

#### Good
```rust
async fn do_async_work(count: u32) { let _ = count; }

async fn good_lock(state: &std::sync::Mutex<Vec<u32>>, item: u32) {
    let count = {
        let mut guard = state.lock().expect("mutex not poisoned");
        guard.push(item);
        guard.len() as u32
    }; // Guard drops before `.await`
    do_async_work(count).await;
}
```

**Rule**: Keep lock critical sections synchronous inside `{}` before `.await`; use `tokio::sync::Mutex` only when a guard truly must span `.await`.

### 9. Unbounded Task Spawning

**Problem**: Calling `tokio::spawn` inside an unthrottled loop can exhaust memory, DB connection pools, and upstream API rate limits.

#### Bad
```rust
async fn fan_out(items: Vec<u32>) {
    for item in items {
        tokio::spawn(async move { let _ = item; });
    }
}
```

**Rule**: Always cap concurrency using `Semaphore` permits or buffered streams (see [Bounded Async Concurrency](patterns.md#12-bounded-async-concurrency)).

### 10. Unsafe Shortcuts

Before writing `unsafe`, verify:
1. Can ownership or borrowing express the invariant safely?
2. Can `Rc` / `Arc` / `RefCell` / `Mutex` satisfy sharing safely?
3. Can slices/structs be split safely (`split_at_mut`, `get_disjoint_mut`)?
4. Is `unsafe` strictly required for FFI, SIMD, or low-level memory layout?
5. Is every invariant documented in a `// SAFETY: ...` comment?

---

## Edition 2024 and Modern Migrations (1.81 – 1.95+)

### 11. Global Env Mutation and Legacy FFI

**Problem**: In Edition 2024 (`1.85+`), `std::env::set_var` / `remove_var` are `unsafe` (data races with parallel `getenv` calls), `extern` blocks require `unsafe extern`, and linker attributes require `#[unsafe(...)]`.

#### Bad
```rust
#[no_mangle]
pub extern "C" fn legacy_init() {}

#[test]
fn test_endpoint() {
    unsafe { std::env::set_var("API_ENDPOINT", "http://localhost:8080"); }
}
```

#### Good
```rust
#[unsafe(no_mangle)]
pub unsafe extern "C" fn stable_init() {}

unsafe extern "C" {
    fn external_tick() -> u32;
}

fn load_endpoint(lookup: impl Fn(&str) -> Option<String>) -> String {
    lookup("API_ENDPOINT").unwrap_or_else(|| "https://api.example.com".into())
}

#[test]
fn test_endpoint() {
    let endpoint = load_endpoint(|k| (k == "API_ENDPOINT").then(|| "http://localhost:8080".into()));
    assert_eq!(endpoint, "http://localhost:8080");
}
```

**Rule**: Inject config lookup functions in tests, use `std::process::Command::env` for child processes, and mark Edition 2024 FFI with `unsafe extern` and `#[unsafe(...)]`.

### 12. Nested `if let` Pyramids

**Problem**: Chained `if let` nesting creates rightward drift and obscures early exits.

#### Bad
```rust
fn parse_token(header: Option<&str>) -> Option<&str> {
    if let Some(raw) = header {
        if let Some(token) = raw.strip_prefix("Bearer ") {
            if !token.is_empty() { return Some(token); }
        }
    }
    None
}
```

#### Good
```rust
// Rust 1.88+ / Edition 2024 `let` chain
fn parse_token(header: Option<&str>) -> Option<&str> {
    if let Some(raw) = header
        && let Some(token) = raw.strip_prefix("Bearer ")
        && !token.is_empty()
    {
        Some(token)
    } else {
        None
    }
}

fn require_port(raw_header: Option<&str>) -> Result<u16, &'static str> {
    let Some(raw) = raw_header else { return Err("missing port") };
    raw.parse::<u16>().map_err(|_| "invalid port")
}
```

**Rule**: Flatten multi-condition bindings with `let` chains (`1.88+`), use `let-else` for early returns, and use `if let` match guards (`1.95+`) inside `match`.

### 13. Using `allow` Instead of `expect`

**Problem**: `#[allow(lint)]` stays silent forever even after the underlying code is fixed.

#### Bad
```rust
#[allow(clippy::too_many_arguments)]
fn build_request(a: i32, b: i32, c: i32, d: i32, e: i32, f: i32, g: i32, h: i32) {}
```

#### Good
```rust
#[expect(
    clippy::too_many_arguments,
    reason = "Legacy C-FFI wrapper; tracked for builder refactor in issue #42"
)]
fn build_request(a: i32, b: i32, c: i32, d: i32, e: i32, f: i32, g: i32, h: i32) {}
```

**Rule**: Prefer `#[expect(lint, reason = "...")]` (`1.81+` / Edition 2024) so the compiler warns as soon as the suppression is obsolete.

### 14. Manual Slice Math and Runtime Windows

**Problem**: Manual `split_at_mut` index arithmetic and `.windows(N)` runtime indexing (`w[1] - w[0]`) invite off-by-one panics and unnecessary bounds checks.

#### Bad
```rust
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

#### Good
```rust
fn update_pair(values: &mut [i32], i: usize, j: usize) {
    if let Ok([a, b]) = values.get_disjoint_mut([i, j]) { // Rust 1.86+
        *a += 1;
        *b += 1;
    }
}

fn max_delta(samples: &[i32]) -> Option<i32> {
    samples.array_windows::<2>().map(|&[a, b]| (b - a).abs()).max() // Rust 1.94+
}
```

**Rule**: Prefer `get_disjoint_mut` (`1.86+`) and `array_windows::<N>()` (`1.94+`) over manual slice splitting or runtime window indexing.
