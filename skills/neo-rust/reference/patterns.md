# Rust Design Patterns & Modern Idioms

Constructive design patterns and modern language idioms (Rust 2021 / 2024 Editions through **1.100+**) for shifting errors to compile time using ownership, types, traits, and RAII. For code-review pitfalls and legacy-to-modern fixes, see [anti-patterns.md](anti-patterns.md).

## Core Principles & Decision Matrix

| Goal / Scenario | Constructive Pattern | Avoid / Pitfall |
|---|---|---|
| Read-only vs owned parameters | [Parameter Intake Priority](#1-parameter-intake-priority) (`&T`, `&str`, `&[T]`) | [Cloning / Owned Params](anti-patterns.md#1-excessive-cloning-and-owned-input-params) |
| Absence & recoverable failure | [Result & Option Composition](#2-result-and-option-composition) | [`unwrap` / `panic` / Indexing](anti-patterns.md#4-unchecked-unwrap-panic-and-indexing), [`String` Errors](anti-patterns.md#5-string-errors-and-sentinel-magic-values) |
| Distinct IDs & finite states | [Enums & Newtypes](#3-enums-and-newtypes) | [String / `bool` Flag States](anti-patterns.md#6-stringly-typed-states-and-boolean-flags) |
| Type invariants | [Smart Constructors](#4-smart-constructors-and-private-invariants) | [Public Mutable Fields](anti-patterns.md#2-public-mutable-fields-breaking-invariants) |
| Multi-option configuration | [Builder Pattern](#5-builder-pattern) | Long positional constructors |
| Compile-time state machines | [Typestate Pattern](#6-typestate-pattern) | Runtime state flags + panics |
| Polymorphism & upcasting | [Trait Dispatch & Upcasting](#7-trait-dispatch-and-upcasting) (`1.86+`) | [Over-Abstraction](anti-patterns.md#3-over-abstraction-with-traits) |
| Data transformation pipelines | [Iterator Pipelines](#8-iterator-pipelines) | Temporary mutable `Vec` loops |
| Deterministic cleanup | [RAII, Drop & DropGuard](#9-raii-drop-and-dropguard) (`1.100+`) | Manual close / rollback calls |
| Shared state & actors | [Smart Pointers](#10-smart-pointers-matrix), [Actors](#11-message-passing-and-actors) | [`Arc<Mutex<T>>` Sprawl](anti-patterns.md#7-spreading-arc-and-mutex-everywhere), [Lock Across `.await`](anti-patterns.md#8-holding-locks-across-await) |
| Throttled async tasks | [Bounded Concurrency](#12-bounded-async-concurrency) (`Semaphore`) | [Unbounded `spawn`](anti-patterns.md#9-unbounded-task-spawning) |
| Conditional match & bindings | [`if let` Match Guards](#13-match-guards-with-if-let) (`1.95+`) | [Nested `if let` Pyramids](anti-patterns.md#12-nested-if-let-pyramids) |
| Async callbacks & RPIT | [Async Closures](#14-async-closures-and-asyncfn) (`1.85+`), [RPIT `use<..>`](#15-precise-capturing-in-rpit) | Manual `BoxFuture`, over-captured borrows |
| Infallibility & allocation | [Never Type `!` & Allocators](#16-never-type-and-custom-allocators) (`1.100+`) | Dummy error enums |
| Safe slicing & lint hygiene | `get_disjoint_mut` (`1.86+`), `array_windows` (`1.94+`), `#[expect]` | [`#[allow]` Drift](anti-patterns.md#13-using-allow-instead-of-expect), [Manual Slice Math](anti-patterns.md#14-manual-slice-math-and-runtime-windows) |

---

## API & Type-Driven Design

### 1. Parameter Intake Priority

Choose the least-restrictive ownership mode required by the function:

| Priority | Signature | Use When |
|---|---|---|
| 1 | `&T`, `&str`, `&[T]` | Reading values without taking ownership (default) |
| 2 | `&mut T`, `&mut [T]` | Mutating caller-owned data in place |
| 3 | `T` | Consuming or storing the value directly |
| 4 | `impl Into<T>` | Accepting flexible borrowed/owned inputs when constructing owned state |

### 2. Result and Option Composition

Compose fallible and optional steps with `?`, `Option` combinators, and checked indexing rather than sentinel values or early panics:

```rust
use std::{fs, io};

fn read_port(path: &str, ports: &[u16], raw_idx: i32) -> Result<Option<u16>, io::Error> {
    let _config = fs::read_to_string(path)?;
    let maybe_port = usize::try_from(raw_idx)
        .ok()
        .and_then(|idx| ports.get(idx).copied());
    Ok(maybe_port)
}
```

For domain/library error design, define explicit error `enum`s (see [anti-patterns.md](anti-patterns.md#5-string-errors-and-sentinel-magic-values)); reserve `Box<dyn std::error::Error>` for CLI/binary boundaries (see [coding-style.md](coding-style.md#module--project-structure)).

### 3. Enums and Newtypes

Model closed domain variants with `enum` + exhaustive `match`, and distinguish domain primitives with zero-cost Newtypes:

```rust
enum PaymentStatus { Pending, Paid, Refunded, Failed }

fn can_refund(status: PaymentStatus) -> bool {
    match status {
        PaymentStatus::Paid => true,
        PaymentStatus::Pending | PaymentStatus::Refunded | PaymentStatus::Failed => false,
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
struct UserId(u64);

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
struct OrderId(u64);

fn load_order(order_id: OrderId) {
    let _ = order_id;
}
// load_order(UserId(1)) fails at compile time
```

### 4. Smart Constructors and Private Invariants

Keep representation fields private and validate invariants at construction and mutation boundaries:

```rust
#[derive(Debug)]
pub enum EmailError { InvalidFormat }

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Email(String);

impl Email {
    pub fn new(value: impl Into<String>) -> Result<Self, EmailError> {
        let value = value.into();
        value.contains('@').then_some(Self(value)).ok_or(EmailError::InvalidFormat)
    }

    pub fn as_str(&self) -> &str { &self.0 }
}
```

### 5. Builder Pattern

Use Builders when types have many optional fields or defaults where positional constructors invite argument-order bugs:

```rust
#[derive(Debug)]
struct ServerConfig { host: String, port: u16, workers: usize, tls: bool }

struct ServerConfigBuilder { host: String, port: u16, workers: usize, tls: bool }

impl ServerConfigBuilder {
    fn new(host: impl Into<String>) -> Self {
        Self { host: host.into(), port: 8080, workers: 4, tls: false }
    }
    fn port(mut self, port: u16) -> Self { self.port = port; self }
    fn workers(mut self, workers: usize) -> Self { self.workers = workers; self }
    fn tls(mut self, tls: bool) -> Self { self.tls = tls; self }
    fn build(self) -> ServerConfig {
        ServerConfig { host: self.host, port: self.port, workers: self.workers, tls: self.tls }
    }
}
```

### 6. Typestate Pattern

Encode strict protocol/lifecycle states as generic type parameters so illegal transitions fail to compile:

```rust
use std::marker::PhantomData;

struct Disconnected;
struct Connected;

struct Connection<State> {
    address: String,
    _state: PhantomData<State>,
}

impl Connection<Disconnected> {
    fn new(address: impl Into<String>) -> Self {
        Self { address: address.into(), _state: PhantomData }
    }
    fn connect(self) -> Connection<Connected> {
        Connection { address: self.address, _state: PhantomData }
    }
}

impl Connection<Connected> {
    fn send(&self, msg: &str) {
        println!("send to {}: {msg}", self.address);
    }
}
```

### 7. Trait Dispatch and Upcasting

Start with concrete methods; reach for traits only when polymorphism or test substitution is required:

| Dispatch | Syntax | Best For |
|---|---|---|
| Static (default) | `R: Repository` / `&impl Repository` | Known compile-time type; zero indirection |
| Dynamic | `&dyn Repository` / `Box<dyn Repository>` | Heterogeneous collections or runtime selection |

```rust
trait BaseService { fn name(&self) -> &str; }
trait HealthChecked: BaseService { fn is_healthy(&self) -> bool; }

fn log_service(service: &dyn BaseService) {
    println!("service: {}", service.name());
}

fn inspect(checked: &dyn HealthChecked) {
    if checked.is_healthy() {
        log_service(checked); // Direct trait object upcast (Rust 1.86+)
    }
}
```

### 8. Iterator Pipelines

Prefer lazy iterator chains over imperative temporary `Vec` loops for filter/map transformations:

```rust
struct User { name: String, active: bool }

fn active_names(users: Vec<User>) -> Vec<String> {
    users.into_iter().filter(|u| u.active).map(|u| u.name).collect()
}
```

### 9. RAII, Drop, and DropGuard

Bind cleanup to scope lifetime via custom `Drop` implementations or `std::mem::DropGuard` (`1.100+`) for inline rollback without boilerplate structs:

```rust
use std::mem::DropGuard;

struct Transaction { committed: bool }
impl Transaction {
    fn new() -> Self { Self { committed: false } }
    fn commit(mut self) { self.committed = true; }
}
impl Drop for Transaction {
    fn drop(&mut self) {
        if !self.committed { println!("ROLLBACK"); }
    }
}

fn write_staged_file(path: &str, commit: bool) -> Result<(), &'static str> {
    let guard = DropGuard::new(path.to_string(), |staged| {
        println!("rolling back uncommitted file: {staged}");
    });
    if !commit { return Err("aborted before commit"); }
    let committed = DropGuard::dismiss(guard);
    println!("committed: {committed}");
    Ok(())
}
```

---

## Concurrency & Resource Ownership

### 10. Smart Pointers Matrix

| Type | Ownership / Mutability Model |
|---|---|
| `Box<T>` | Unique heap ownership, recursive types, trait objects |
| `Rc<T>` / `Arc<T>` | Single-threaded / multi-threaded shared ownership |
| `RefCell<T>` | Single-threaded runtime-checked interior mutability |
| `Mutex<T>` / `RwLock<T>` | Multi-threaded exclusive / reader-writer synchronization |
| `Cow<'a, T>` | Clone-on-write; borrowed until mutation is needed |

### 11. Message Passing and Actors

Isolate mutable state inside a dedicated worker driven by channels for queues, pipelines, and command loops:

```rust
use std::sync::mpsc;
use std::thread;

enum Command { CreateUser(String), Shutdown }

fn spawn_worker() -> (mpsc::Sender<Command>, thread::JoinHandle<()>) {
    let (tx, rx) = mpsc::channel::<Command>();
    let handle = thread::spawn(move || {
        while let Ok(cmd) = rx.recv() {
            match cmd {
                Command::CreateUser(name) => println!("create user: {name}"),
                Command::Shutdown => break,
            }
        }
    });
    (tx, handle)
}
```

### 12. Bounded Async Concurrency

Cap concurrent spawned tasks with `tokio::sync::Semaphore` or buffered streams to protect memory, connection pools, and downstream rate limits:

```rust
use std::sync::Arc;
use tokio::sync::Semaphore;

async fn process(item: u32) { println!("process {item}"); }

async fn run_bounded(items: Vec<u32>) {
    let limit = Arc::new(Semaphore::new(10));
    let mut handles = Vec::with_capacity(items.len());

    for item in items {
        let Ok(permit) = Arc::clone(&limit).acquire_owned().await else { break };
        handles.push(tokio::spawn(async move {
            let _permit = permit;
            process(item).await;
        }));
    }

    for handle in handles {
        if let Err(err) = handle.await {
            eprintln!("task failed: {err}");
        }
    }
}
```

---

## Modern Rust Capabilities (1.85 / Edition 2024 – 1.100+)

> Legacy-to-modern migrations (`let` chains, `let-else`, `#[expect]`, `get_disjoint_mut`, `array_windows`) are documented in [anti-patterns.md](anti-patterns.md#edition-2024-and-modern-migrations-181--195).

### 13. Match Guards with `if let`

Requires Rust `1.95+`; combine pattern arms with inline fallible destructuring:

```rust
enum Event<'a> { Payload(&'a str), Heartbeat }

fn handle_event(event: Event<'_>) {
    match event {
        Event::Payload(raw) if let Ok(id) = raw.parse::<u64>() => println!("id: {id}"),
        Event::Payload(raw) => println!("invalid payload: {raw}"),
        Event::Heartbeat => println!("heartbeat"),
    }
}
```

### 14. Async Closures and `AsyncFn`

Requires Rust `1.85+` / Edition 2024; native `async || {}` closures borrow captured state across `.await` without `Fn(...) -> Fut` boilerplate:

```rust
async fn retry_with_prefix<F, E>(prefix: &str, items: &[&str], op: F) -> Result<(), E>
where
    F: AsyncFn(&str, &str) -> Result<(), E>,
{
    for item in items {
        op(prefix, item).await?;
    }
    Ok(())
}

async fn run(client_tag: String) -> Result<(), &'static str> {
    retry_with_prefix("sync", &["order-1", "order-2"], async |prefix, item| {
        println!("[{client_tag}] {prefix}:{item}");
        Ok(())
    })
    .await
}
```

### 15. Precise Capturing in RPIT

In Rust 2024 Edition (`1.85+`, trait methods in `1.87+`), return-position `impl Trait` captures all generic parameters by default; restrict captures with `+ use<'a, T>`:

```rust
fn non_empty_lines<'a>(
    input: &'a str,
    _filter_tag: &str,
) -> impl Iterator<Item = &'a str> + use<'a> {
    input.lines().filter(|line| !line.is_empty())
}
```

### 16. Never Type and Custom Allocators

Requires Rust `1.100+`; model infallible results with `!` and explicit memory placement with `std::alloc::Allocator`:

```rust
use std::alloc::{Allocator, System};

trait Handler {
    type Error;
    fn handle(&self, input: &str) -> Result<usize, Self::Error>;
}

struct CountingHandler;
impl Handler for CountingHandler {
    type Error = !;
    fn handle(&self, input: &str) -> Result<usize, !> { Ok(input.len()) }
}

fn collect_in<A: Allocator>(alloc: A) -> Vec<u32, A> {
    let mut items = Vec::with_capacity_in(4, alloc);
    items.push(1);
    items
}

fn example_alloc() {
    let boxed = Box::new_in("system-allocated", System);
    let items = collect_in(System);
    println!("{boxed}, len={}", items.len());
}
```
