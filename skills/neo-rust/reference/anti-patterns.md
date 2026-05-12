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
