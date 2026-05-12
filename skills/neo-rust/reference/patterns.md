# 1. Rust 設計總原則

Rust 的核心不是把 OOP / GoF Design Patterns 照搬過來，而是用：

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

把錯誤盡量移到編譯期處理。

## 核心判斷表

| 問題 | Rust 好作法 |
|---|---|
| 這個值誰擁有？ | 用 ownership 表達生命週期 |
| 只是讀取？ | 傳 `&T`、`&str`、`&[T]` |
| 需要修改？ | 傳 `&mut T` |
| 可能失敗？ | 回傳 `Result<T, E>` |
| 可能沒有值？ | 回傳 `Option<T>` |
| 狀態有限？ | 用 `enum` |
| 行為抽象？ | 用 `trait` |
| 不合法狀態？ | 用 type system 阻止它 |
| 資源需要釋放？ | 用 RAII / `Drop` |
| 共享狀態？ | 優先清楚劃分 ownership，再考慮 `Arc<Mutex<T>>` |

---

# 2. Design Pattern：好作法

---

## Pattern 1：Borrowing-first API

### 不好作法

```rust
fn print_name(name: String) {
    println!("{name}");
}

fn main() {
    let name = String::from("Alice");
    print_name(name);

    // name 已經被 move，不能再用
    // println!("{name}");
}
```

問題：只是讀取，卻把 ownership 吃掉。

### 好作法

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

### 原則

`String` 是擁有資料，`&str` 是借用文字切片。只讀文字時，優先收 `&str`。

---

## Pattern 2：Slice API

### 不好作法

```rust
fn sum(numbers: &Vec<i32>) -> i32 {
    numbers.iter().sum()
}
```

問題：限制呼叫者一定要傳 `Vec<i32>`。

### 好作法

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

### 原則

只需要連續資料時，用 `&[T]`，不要綁死 `Vec<T>`。

---

## Pattern 3：`Option<T>` 表示「可能沒有」

### 不好作法

```rust
fn find_user_name(id: u64) -> String {
    if id == 1 {
        "Alice".to_string()
    } else {
        "".to_string()
    }
}
```

問題：空字串到底是「沒有資料」還是「名字就是空」？

### 好作法

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

### 原則

「沒有值」就用 `Option<T>`，不要用 `null`、空字串、`-1` 當暗號。

---

## Pattern 4：`Result<T, E>` 表示「可能失敗」

### 不好作法

```rust
use std::fs;

fn read_config() -> String {
    fs::read_to_string("config.toml").unwrap()
}
```

問題：正式程式中 `unwrap()` 會讓程式直接 panic。

### 好作法

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

### 原則

library、service、CLI 的核心邏輯不要亂 `unwrap()`。能回傳錯誤就回傳 `Result`。

---

## Pattern 5：Enum + Exhaustive Match

### 不好作法

```rust
struct Payment {
    status: String,
}

fn can_refund(payment: &Payment) -> bool {
    payment.status == "paid"
}
```

問題：`"paied"`、`"PAID"`、`"unknown"` 都可能混進來。

### 好作法

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

### 原則

有限狀態不要用 `String`，用 `enum`。

---

## Pattern 6：Newtype Pattern

用途：避免把同樣底層型別混用。

### 不好作法

```rust
fn load_user(user_id: u64) {}
fn load_order(order_id: u64) {}

fn main() {
    let user_id = 100;
    load_order(user_id); // 編譯會過，但語意錯
}
```

### 好作法

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
    // load_order(user_id); // 編譯錯，避免語意錯誤
}
```

### 原則

ID、金額、單位、權限、狀態，常用 Newtype 包起來。

---

## Pattern 7：Smart Constructor

用途：建立物件時保證 invariant。

### 不好作法

```rust
struct Email(String);

fn main() {
    let email = Email("not-an-email".to_string());
}
```

### 好作法

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

### 原則

不要讓外部隨便組出不合法物件。欄位私有，提供 constructor。

---

## Pattern 8：Builder Pattern

適合參數很多、可選設定多的物件。

### 不好作法

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

問題：參數順序容易錯，擴充困難。

### 好作法

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

## Pattern 9：Typestate Pattern

用途：把狀態流程放進型別系統，讓錯誤流程無法編譯。

### 不好作法

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

### 好作法

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

### 原則

狀態流程固定時，Typestate 可以讓錯誤使用方式直接編譯失敗。

---

## Pattern 10：Trait 抽象

Rust 的 polymorphism 主要靠 trait。

| 形式 | 寫法 | 適合 |
|---|---|---|
| Static dispatch | `T: Trait` | 編譯期決定型別，效能好 |
| Dynamic dispatch | `dyn Trait` | runtime 才決定實作型別 |

### Static dispatch

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

### Dynamic dispatch

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

### 建議

預設用 generic `T: Trait`。需要把不同實作放進同一個 collection，或 runtime 注入時，再用 `Box<dyn Trait>` / `&dyn Trait`。

---

## Pattern 11：Iterator Pattern

### 不好作法

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

### 好作法

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

### 原則

資料轉換流程適合用 iterator chain。  
但不要為了炫技把簡單邏輯寫到難懂。

---

## Pattern 12：RAII / Drop Guard

用途：DB transaction、file lock、mutex guard、temp file、resource cleanup。

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

    // 如果中途 return 或 panic，Drop 會觸發 rollback
    tx.commit();
}
```

### 原則

資源取得與釋放綁在 object lifetime。  
值離開 scope 時，由 `Drop` 負責清理。

---

## Pattern 13：Smart Pointer 選擇

| 型別 | 用途 |
|---|---|
| `Box<T>` | heap allocation、recursive type、trait object ownership |
| `Rc<T>` | 單執行緒 shared ownership |
| `Arc<T>` | 多執行緒 shared ownership |
| `RefCell<T>` | 單執行緒 interior mutability，runtime borrow check |
| `Mutex<T>` | 多執行緒可變共享資料 |
| `RwLock<T>` | 多讀少寫 |
| `Cow<'a, T>` | 可能借用，也可能需要 clone-on-write |

### 典型範例

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

### 注意

`Arc<Mutex<T>>` 很常見，但不是預設答案。可以用 channel / actor 拆 ownership 時，通常更清楚。

---

## Pattern 14：Message Passing / Actor-like Pattern

適合：

- queue worker
- background task
- pipeline
- command processor
- proxy server

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

## Pattern 15：Async Bounded Concurrency

### 不好作法

```rust
// 概念示意：大量任務無限制 spawn
for item in items {
    tokio::spawn(async move {
        process(item).await;
    });
}
```

問題：可能打爆 CPU、記憶體、DB connection、API rate limit。

### 好作法

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

### 原則

Async 任務要有上限。不要無限制 `spawn`。

---

