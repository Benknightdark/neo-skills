# 1. Core Principles of Rust Design

Rust's core is not about simply porting OOP / GoF Design Patterns, but rather utilizing:

- ownership
- borrowing
- lifetime
- enum
- trait
- `Option<T>`
- `Result<T, E>`
- iterator
- RAII / `Drop`
- type system

to shift as many errors as possible to compile-time.

## Decision Matrix

| Question | Rust Best Practice |
|---|---|
| Who owns this value? | Use ownership to express lifetime |
| Only reading? | Pass `&T`, `&str`, `&[T]` |
| Need to modify? | Pass `&mut T` |
| Might fail? | Return `Result<T, E>` |
| Might be empty? | Return `Option<T>` |
| Finite states? | Use `enum` |
| Abstract behavior? | Use `trait` |
| Illegal state? | Use the type system to prevent it |
| Need resource cleanup? | Use RAII / `Drop` |
| Shared state? | Prioritize clear ownership boundaries, then consider `Arc<Mutex<T>>` |

---

# 2. Design Patterns: Best Practices

---

## Pattern 1: Borrowing-first API

### Bad Practice

```rust
fn print_name(name: String) {
    println!("{name}");
}

fn main() {
    let name = String::from("Alice");
    print_name(name);

    // name has been moved and can no longer be used
    // println!("{name}");
}
```

Problem: Consumes ownership when only reading is required.

### Best Practice

```rust
fn print_name(name: &str) {
    println!("{name}");
}

fn main() {
    let name = String::from("Alice");

    print_name(&name);
    print_name("Bob");

    println!("{name}");
}
```

### Principle

`String` owns the data; `&str` is a borrowed string slice. Prefer `&str` when only reading text.

---

## Pattern 2: Slice API

### Bad Practice

```rust
fn sum(numbers: &Vec<i32>) -> i32 {
    numbers.iter().sum()
}
```

Problem: Restricts the caller to pass a `Vec<i32>`.

### Best Practice

```rust
fn sum(numbers: &[i32]) -> i32 {
    numbers.iter().sum()
}

fn main() {
    let v = vec![1, 2, 3];
    let arr = [4, 5, 6];

    println!("{}", sum(&v));
    println!("{}", sum(&arr));
}
```

### Principle

When only contiguous data is needed, use `&[T]` instead of binding to `Vec<T>`.

---

## Pattern 3: `Option<T>` for "Possible Absence"

### Bad Practice

```rust
fn find_user_name(id: u64) -> String {
    if id == 1 {
        "Alice".to_string()
    } else {
        "".to_string()
    }
}
```

Problem: Is an empty string "missing data" or "the name is actually empty"?

### Best Practice

```rust
fn find_user_name(id: u64) -> Option<String> {
    if id == 1 {
        Some("Alice".to_string())
    } else {
        None
    }
}

fn main() {
    match find_user_name(2) {
        Some(name) => println!("user: {name}"),
        None => println!("user not found"),
    }
}
```

### Principle

Use `Option<T>` for "no value." Avoid using `null`, empty strings, or `-1` as magic values.

---

## Pattern 4: `Result<T, E>` for "Possible Failure"

### Bad Practice

```rust
use std::fs;

fn read_config() -> String {
    fs::read_to_string("config.toml").unwrap()
}
```

Problem: `unwrap()` will cause the program to panic in production.

### Best Practice

```rust
use std::fs;
use std::io;

fn read_config() -> Result<String, io::Error> {
    let text = fs::read_to_string("config.toml")?;
    Ok(text)
}

fn main() {
    match read_config() {
        Ok(text) => println!("{text}"),
        Err(err) => eprintln!("failed to read config: {err}"),
    }
}
```

### Principle

Avoid reckless `unwrap()` in core logic (libraries, services, CLIs). Return `Result` when errors can occur.

---

## Pattern 5: Enum + Exhaustive Match

### Bad Practice

```rust
struct Payment {
    status: String,
}

fn can_refund(payment: &Payment) -> bool {
    payment.status == "paid"
}
```

Problem: Values like `"paied"`, `"PAID"`, or `"unknown"` could creep in.

### Best Practice

```rust
enum PaymentStatus {
    Pending,
    Paid,
    Refunded,
    Failed,
}

struct Payment {
    status: PaymentStatus,
}

fn can_refund(payment: &Payment) -> bool {
    match payment.status {
        PaymentStatus::Paid => true,
        PaymentStatus::Pending
        | PaymentStatus::Refunded
        | PaymentStatus::Failed => false,
    }
}
```

### Principle

Use `enum` instead of `String` for finite states.

---

## Pattern 6: Newtype Pattern

Purpose: Prevent mixing up different domain values with the same underlying type.

### Bad Practice

```rust
fn load_user(user_id: u64) {}
fn load_order(order_id: u64) {}

fn main() {
    let user_id = 100;
    load_order(user_id); // Compiles, but semantically incorrect
}
```

### Best Practice

```rust
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
struct UserId(u64);

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
struct OrderId(u64);

fn load_user(user_id: UserId) {}
fn load_order(order_id: OrderId) {}

fn main() {
    let user_id = UserId(100);

    load_user(user_id);
    // load_order(user_id); // Compile error, prevents semantic mistakes
}
```

### Principle

Wrap IDs, amounts, units, permissions, and states in Newtypes.

---

## Pattern 7: Smart Constructor

Purpose: Ensure invariants when creating objects.

### Bad Practice

```rust
struct Email(String);

fn main() {
    let email = Email("not-an-email".to_string());
}
```

### Best Practice

```rust
#[derive(Debug, Clone, PartialEq, Eq)]
struct Email(String);

impl Email {
    pub fn new(value: impl Into<String>) -> Result<Self, String> {
        let value = value.into();

        if value.contains('@') {
            Ok(Self(value))
        } else {
            Err("invalid email".to_string())
        }
    }

    pub fn as_str(&self) -> &str {
        &self.0
    }
}

fn main() -> Result<(), String> {
    let email = Email::new("user@example.com")?;
    println!("{}", email.as_str());

    Ok(())
}
```

### Principle

Do not allow illegal objects to be constructed haphazardly. Keep fields private and provide a constructor.

---

## Pattern 8: Builder Pattern

Suitable for objects with many parameters or optional settings.

### Bad Practice

```rust
struct ServerConfig {
    host: String,
    port: u16,
    workers: usize,
    timeout_ms: u64,
    tls: bool,
}

fn new_config(
    host: String,
    port: u16,
    workers: usize,
    timeout_ms: u64,
    tls: bool,
) -> ServerConfig {
    ServerConfig {
        host,
        port,
        workers,
        timeout_ms,
        tls,
    }
}
```

Problem: Parameter order is error-prone, and extension is difficult.

### Best Practice

```rust
#[derive(Debug)]
struct ServerConfig {
    host: String,
    port: u16,
    workers: usize,
    timeout_ms: u64,
    tls: bool,
}

struct ServerConfigBuilder {
    host: String,
    port: u16,
    workers: usize,
    timeout_ms: u64,
    tls: bool,
}

impl ServerConfigBuilder {
    fn new(host: impl Into<String>) -> Self {
        Self {
            host: host.into(),
            port: 8080,
            workers: 4,
            timeout_ms: 30_000,
            tls: false,
        }
    }

    fn port(mut self, port: u16) -> Self {
        self.port = port;
        self
    }

    fn workers(mut self, workers: usize) -> Self {
        self.workers = workers;
        self
    }

    fn tls(mut self, tls: bool) -> Self {
        self.tls = tls;
        self
    }

    fn build(self) -> ServerConfig {
        ServerConfig {
            host: self.host,
            port: self.port,
            workers: self.workers,
            timeout_ms: self.timeout_ms,
            tls: self.tls,
        }
    }
}

fn main() {
    let config = ServerConfigBuilder::new("127.0.0.1")
        .port(3000)
        .workers(8)
        .tls(true)
        .build();

    println!("{config:?}");
}
```

---

## Pattern 9: Typestate Pattern

Purpose: Incorporate state flows into the type system, making invalid state transitions uncompilable.

### Bad Practice

```rust
struct Connection {
    connected: bool,
}

impl Connection {
    fn send(&self, msg: &str) {
        if self.connected {
            println!("send: {msg}");
        } else {
            panic!("not connected");
        }
    }
}
```

### Best Practice

```rust
struct Disconnected;
struct Connected;

struct Connection<State> {
    address: String,
    _state: std::marker::PhantomData<State>,
}

impl Connection<Disconnected> {
    fn new(address: impl Into<String>) -> Self {
        Self {
            address: address.into(),
            _state: std::marker::PhantomData,
        }
    }

    fn connect(self) -> Connection<Connected> {
        println!("connect to {}", self.address);

        Connection {
            address: self.address,
            _state: std::marker::PhantomData,
        }
    }
}

impl Connection<Connected> {
    fn send(&self, msg: &str) {
        println!("send to {}: {msg}", self.address);
    }
}

fn main() {
    let conn = Connection::<Disconnected>::new("localhost");
    let conn = conn.connect();

    conn.send("hello");
}
```

### Principle

When state flows are fixed, Typestate can cause incorrect usage to fail at compile time.

---

## Pattern 10: Trait Abstraction

Polymorphism in Rust primarily relies on traits.

| Form | Syntax | Best For |
|---|---|---|
| Static dispatch | `T: Trait` | Type decided at compile-time; better performance |
| Dynamic dispatch | `dyn Trait` | Implementation type decided at runtime |

### Static Dispatch

```rust
trait Repository {
    fn save(&self, value: &str);
}

struct SqlRepository;

impl Repository for SqlRepository {
    fn save(&self, value: &str) {
        println!("save to sql: {value}");
    }
}

fn create_user<R: Repository>(repo: &R, name: &str) {
    repo.save(name);
}
```

### Dynamic Dispatch

```rust
trait Repository {
    fn save(&self, value: &str);
}

struct SqlRepository;

impl Repository for SqlRepository {
    fn save(&self, value: &str) {
        println!("save to sql: {value}");
    }
}

fn create_user(repo: &dyn Repository, name: &str) {
    repo.save(name);
}
```

### Recommendation

Default to generic `T: Trait`. Use `Box<dyn Trait>` / `&dyn Trait` only when you need to put different implementations into the same collection or when runtime injection is required.

---

## Pattern 11: Iterator Pattern

### Bad Practice

```rust
fn active_names(users: Vec<User>) -> Vec<String> {
    let mut result = Vec::new();

    for user in users {
        if user.active {
            result.push(user.name);
        }
    }

    result
}
```

### Best Practice

```rust
struct User {
    name: String,
    active: bool,
}

fn active_names(users: Vec<User>) -> Vec<String> {
    users
        .into_iter()
        .filter(|user| user.active)
        .map(|user| user.name)
        .collect()
}
```

### Principle

Data transformation flows are well-suited for iterator chains. However, do not over-engineer simple logic to the point of being unreadable.

---

## Pattern 12: RAII / Drop Guard

Purpose: DB transactions, file locks, mutex guards, temp files, resource cleanup.

```rust
struct Transaction {
    committed: bool,
}

impl Transaction {
    fn new() -> Self {
        println!("BEGIN");
        Self { committed: false }
    }

    fn commit(mut self) {
        println!("COMMIT");
        self.committed = true;
    }
}

impl Drop for Transaction {
    fn drop(&mut self) {
        if !self.committed {
            println!("ROLLBACK");
        }
    }
}

fn main() {
    let tx = Transaction::new();

    // If a return or panic occurs midway, Drop will trigger a rollback
    tx.commit();
}
```

### Principle

Resource acquisition and release are bound to object lifetime. Cleanup is handled by `Drop` when a value leaves scope.

---

## Pattern 13: Choosing Smart Pointers

| Type | Purpose |
|---|---|
| `Box<T>` | Heap allocation, recursive types, trait object ownership |
| `Rc<T>` | Single-threaded shared ownership |
| `Arc<T>` | Multi-threaded shared ownership |
| `RefCell<T>` | Single-threaded interior mutability, runtime borrow check |
| `Mutex<T>` | Multi-threaded mutable shared data |
| `RwLock<T>` | Multiple readers, single writer |
| `Cow<'a, T>` | Clone-on-write; can be either borrowed or owned |

### Typical Example

```rust
use std::sync::{Arc, Mutex};
use std::thread;

fn main() {
    let counter = Arc::new(Mutex::new(0));

    let handles: Vec<_> = (0..10)
        .map(|_| {
            let counter = Arc::clone(&counter);

            thread::spawn(move || {
                let mut value = counter.lock().unwrap();
                *value += 1;
            })
        })
        .collect();

    for handle in handles {
        handle.join().unwrap();
    }

    println!("{}", *counter.lock().unwrap());
}
```

### Note

`Arc<Mutex<T>>` is common but not the default answer. Using channels or an actor pattern to split ownership is often clearer.

---

## Pattern 14: Message Passing / Actor-like Pattern

Suitable for:

- Queue workers
- Background tasks
- Pipelines
- Command processors
- Proxy servers

```rust
use std::sync::mpsc;
use std::thread;

enum Command {
    CreateUser(String),
    Shutdown,
}

fn main() {
    let (tx, rx) = mpsc::channel::<Command>();

    let worker = thread::spawn(move || {
        while let Ok(cmd) = rx.recv() {
            match cmd {
                Command::CreateUser(name) => {
                    println!("create user: {name}");
                }
                Command::Shutdown => break,
            }
        }
    });

    tx.send(Command::CreateUser("Alice".to_string())).unwrap();
    tx.send(Command::Shutdown).unwrap();

    worker.join().unwrap();
}
```

---

## Pattern 15: Async Bounded Concurrency

### Bad Practice

```rust
// Conceptual illustration: Spawning tasks without limits
for item in items {
    tokio::spawn(async move {
        process(item).await;
    });
}
```

Problem: Can overwhelm CPU, memory, DB connections, or API rate limits.

### Best Practice

```rust
use std::sync::Arc;
use tokio::sync::Semaphore;

async fn process(item: u32) {
    println!("process {item}");
}

#[tokio::main]
async fn main() {
    let limit = Arc::new(Semaphore::new(10));

    let mut handles = Vec::new();

    for item in 0..100 {
        let permit = Arc::clone(&limit).acquire_owned().await.unwrap();

        handles.push(tokio::spawn(async move {
            let _permit = permit;
            process(item).await;
        }));
    }

    for handle in handles {
        handle.await.unwrap();
    }
}
```

### Principle

Async tasks should have a cap. Do not `spawn` without limits.
