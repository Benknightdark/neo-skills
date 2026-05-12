# 3. Anti-pattern：不好作法

---

## Anti-pattern 1：到處 `.clone()` 逃避 borrow checker

### 不好

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

### 好

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

### 原則

clone 不是不能用，但要知道為什麼 clone。  
如果只是讀取，先改成 borrow。

---

## Anti-pattern 2：過度使用 `String`

### 不好

```rust
fn is_admin(role: String) -> bool {
    role == "admin"
}
```

### 好

```rust
fn is_admin(role: &str) -> bool {
    role == "admin"
}
```

### 原則

建立 ownership 才用 `String`，讀取文字優先 `&str`。

---

## Anti-pattern 3：用 `bool` 表達複雜狀態

### 不好

```rust
struct User {
    is_active: bool,
    is_deleted: bool,
    is_locked: bool,
}
```

問題：可能出現矛盾狀態，例如 active 又 deleted。

### 好

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

## Anti-pattern 4：用 `String` 表達錯誤

### 不好

```rust
fn parse_age(input: &str) -> Result<u8, String> {
    input.parse::<u8>().map_err(|_| "invalid age".to_string())
}
```

短程式可以，但 library 或大型系統不建議只丟字串。

### 好

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

### 原則

錯誤要可分類、可測試、可處理。

---

## Anti-pattern 5：library 內部亂 `panic!`

### 不好

```rust
pub fn divide(a: i32, b: i32) -> i32 {
    if b == 0 {
        panic!("divide by zero");
    }

    a / b
}
```

### 好

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

### 原則

除非是不可恢復的程式錯誤，否則回傳 `Result`。

---

## Anti-pattern 6：過度 Trait 化

### 不好

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

問題：只有一個 struct、一個方法、沒有替換需求時，trait 只是噪音。

### 好

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

### 原則

先用 concrete type。真的需要抽象再抽 trait。

---

## Anti-pattern 7：公開欄位破壞 invariant

### 不好

```rust
pub struct Account {
    pub balance: i64,
}

fn main() {
    let mut account = Account { balance: 100 };
    account.balance = -999;
}
```

### 好

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

## Anti-pattern 8：`Arc<Mutex<T>>` 到處傳

### 不好

```rust
use std::sync::{Arc, Mutex};

struct AppState {
    users: Arc<Mutex<Vec<String>>>,
    logs: Arc<Mutex<Vec<String>>>,
    configs: Arc<Mutex<Vec<String>>>,
}
```

問題：鎖太多、責任不清楚、容易死鎖、測試困難。

### 好

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

### 原則

能單一 ownership 就不要共享。  
需要跨 thread 再考慮 `Arc<Mutex<T>>`。

---

## Anti-pattern 9：在 async 中持有 lock 跨 `.await`

### 不好

```rust
// 概念示意
let mut guard = state.lock().await;
do_async_work().await;
guard.push(1);
```

問題：lock 持有時間太長，容易造成效能問題或 deadlock-like 行為。

### 好

```rust
let data = {
    let mut guard = state.lock().await;
    guard.push(1);
    guard.clone()
};

do_async_work(data).await;
```

### 原則

鎖內只做最短、同步、必要的事情。

---

## Anti-pattern 10：濫用 `unsafe`

### 不好

```rust
unsafe {
    // 為了繞過 borrow checker 亂用 raw pointer
}
```

### 好

先問：

1. 能不能用 ownership 改設計？
2. 能不能用 `Rc` / `Arc`？
3. 能不能用 `RefCell` / `Mutex`？
4. 能不能拆資料結構？
5. 真的需要 FFI、SIMD、底層記憶體操作嗎？

### 原則

`unsafe` 不是效能開關，是你接手編譯器無法保證的安全責任。

---

