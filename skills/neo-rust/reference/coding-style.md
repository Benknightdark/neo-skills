# 4. Coding Style

---

## 命名規則

| 類型 | 好作法 |
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

## Getter 命名

Rust 慣例通常不加 `get_`。

### 不好

```rust
impl User {
    fn get_name(&self) -> &str {
        &self.name
    }
}
```

### 好

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

## Conversion 命名：`as_`、`to_`、`into_`

| 命名 | 意義 | 範例 |
|---|---|---|
| `as_` | 便宜借用轉換 | `as_str()` |
| `to_` | 產生新值，可能配置記憶體 | `to_string()` |
| `into_` | 消耗自己，轉成別的 owned value | `into_bytes()` |

### 範例

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

## Iterator 命名

Collection 類型建議提供：

```rust
fn iter(&self) -> Iter
fn iter_mut(&mut self) -> IterMut
fn into_iter(self) -> IntoIter
```

---

## Module Style

建議結構：

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

### 原則

| 原則 | 說明 |
|---|---|
| `main.rs` 薄一點 | 只負責組裝與啟動 |
| business logic 放 `lib.rs` | 方便測試 |
| domain type 不依賴 infra | 避免耦合 |
| `pub` 越少越好 | 預設私有 |
| error 集中管理 | 不要到處 `String` error |
| tests 靠近程式 | 小單元測試可放同檔 `mod tests` |

---

## Import Style

### 不好

```rust
use crate::domain::user::User;
use crate::domain::user::UserId;
use crate::domain::user::UserStatus;
```

### 好

```rust
use crate::domain::user::{User, UserId, UserStatus};
```

### 不建議濫用

```rust
use crate::domain::user::*;
```

`*` 在 test 或 prelude 可接受，正式模組少用。

---

## Error Style

### Application / CLI

可以用較彈性的 error：

```rust
fn run() -> Result<(), Box<dyn std::error::Error>> {
    Ok(())
}
```

### Library / domain

建議明確 enum：

```rust
#[derive(Debug)]
pub enum CreateUserError {
    InvalidEmail,
    DuplicateEmail,
}
```

### Service

建議保留錯誤上下文：

```rust
fn create_user(email: &str) -> Result<(), CreateUserError> {
    if !email.contains('@') {
        return Err(CreateUserError::InvalidEmail);
    }

    Ok(())
}
```

---

# 5. Rust 工具鏈 Coding Standard

## 建議指令

```bash
cargo fmt -- --check
cargo check
cargo clippy -- -D warnings
cargo test
cargo build --release
```

## 建議 CI

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

# 6. 總表：好作法 VS 不好作法

| 主題 | 好作法 | 不好作法 |
|---|---|---|
| 讀取文字 | `&str` | `String` |
| 讀取陣列 | `&[T]` | `&Vec<T>` |
| 可能沒值 | `Option<T>` | 空字串、`-1`、假資料 |
| 可能失敗 | `Result<T, E>` | `panic!`、`unwrap()` |
| 有限狀態 | `enum` | `String`、多個 bool |
| ID / 金額 / 單位 | Newtype | 全部用 `u64` / `String` |
| 參數很多 | Builder | 超長 constructor |
| 狀態流程 | Typestate | runtime flag |
| 抽象行為 | trait | 硬寫 concrete dependency |
| 資料轉換 | iterator chain | 大量暫存 mutable vec |
| 資源管理 | RAII / `Drop` | 手動 close，容易忘 |
| 共享資料 | 明確 ownership / channel | 到處 `Arc<Mutex<T>>` |
| async concurrency | 有界並行 | 無限制 `spawn` |
| 格式 | `cargo fmt` | 手排格式 |
| 靜態檢查 | `cargo clippy` | 靠人工 review |

---

# 7. 實務上的 Rust 寫法準則

---

## 寫 function 時

優先順序：

```rust
fn read_only(value: &T)
fn read_text(value: &str)
fn read_list(value: &[T])
fn mutate(value: &mut T)
fn consume(value: T)
fn flexible_owned(value: impl Into<T>)
```

---

## 寫 struct 時

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

## 寫 enum 時

```rust
enum Command {
    CreateUser { email: Email },
    DeleteUser { id: UserId },
    Shutdown,
}
```

比這種好：

```rust
struct Command {
    action: String,
    payload: String,
}
```

---

## 寫錯誤時

```rust
#[derive(Debug)]
enum AppError {
    ConfigMissing,
    InvalidInput,
    DatabaseUnavailable,
}
```

比這種好：

```rust
Err("something went wrong".to_string())
```

---

# 8. 專案起手式建議

---

## CLI / 小工具

```text
src/
  main.rs
  cli.rs
  config.rs
  error.rs
```

重點：

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

重點：

| 層 | 責任 |
|---|---|
| `domain` | 型別、規則、狀態 |
| `service` | use case |
| `infra` | DB、HTTP、Redis、檔案 |
| `app` | DI / router / runtime 組裝 |
| `main` | 啟動 |

---

# 9. 最重要的結論

Rust 的好程式碼通常長這樣：

```rust
pub fn create_user(repo: &impl UserRepository, email: &str) -> Result<UserId, CreateUserError> {
    let email = Email::new(email).map_err(|_| CreateUserError::InvalidEmail)?;

    if repo.exists(&email)? {
        return Err(CreateUserError::DuplicateEmail);
    }

    repo.insert(&email)
}
```

它具備幾個特徵：

1. 輸入用 borrow：`&str`
2. 不合法資料用 smart constructor 擋住：`Email::new`
3. 錯誤用 `Result`
4. 業務錯誤可分類：`CreateUserError`
5. dependency 用 trait 抽象：`UserRepository`
6. 沒有亂 `unwrap`
7. 沒有 stringly-typed 狀態
8. 沒有多餘 clone
9. 測試容易
10. 編譯器幫你擋掉大量錯誤

真正的 Rust design pattern 不是「把 class 設計得漂亮」，而是：

> 讓不合法狀態無法表示，讓錯誤路徑被型別強迫處理，讓 ownership 清楚到不用猜。

---

# 10. 參考來源

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
