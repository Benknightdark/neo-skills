# Modern Python Style Guide: Evolution & Conventions

本指南整合了 Python 3.10 至 3.14 的語法演進與 PEP 8 命名規範，旨在提供一致、現代且高品質的開發標準。

---

## 第一部分：現代語法與型別演進 (3.10 - 3.14)

### 1. 聯集型別運算子 (3.10+)
使用 `|` 取代 `typing.Union` 與 `Optional`。
*   **✅ 推薦：** `def process(data: int | str | None):`
*   **❌ 避免：** `def process(data: Union[int, str, None]):`

### 2. 結構化模式比對 (3.10+)
使用 `match/case` 進行清晰的資料解構。
*   **✅ 推薦：**
    ```python
    match response:
        case {"status": 200, "data": content}:
            return content
        case _:
            raise ValueError("Unknown response")
    ```

### 3. Self 型別標註 (3.11+)
在類別方法回傳自身實例時，使用 `typing.Self`。
*   **✅ 推薦：** `def clone(self) -> Self: return self`

### 4. 例外群組與傳播 (3.11+)
使用 `except*` 處理併發任務中拋出的 `ExceptionGroup`。
*   **✅ 推薦：**
    ```python
    try:
        await asyncio.gather(t1, t2)
    except* ValueError:
        log.error("Handling value errors")
    ```

### 5. 簡化泛型語法 (3.12+)
直接在函數或類別名稱後方使用 `[T]`。
*   **✅ 推薦：** `def get_first[T](items: list[T]) -> T:`
*   **❌ 避免：** `T = TypeVar('T'); def get_first(items: List[T]) -> T:`

### 6. F-string 限制解除 (3.12+)
允許引號重用與內部表達式註解。
*   **✅ 推薦：** `f"Name: {user["name"]}"`

### 7. 標記棄用與泛型預設值 (3.13+)
使用 `@deprecated` 裝飾器與 `Box[T = int]`。

### 8. 3.14 預覽特性
*   **無括號例外捕捉：** `except ValueError, TypeError:`
*   **標記延遲評估：** `def set_next(self, node: Node):` (不須引號包裝 Node)

---

## 第二部分：命名慣例 (PEP 8)

### 1. 模組與套件 (Modules & Packages)
*   **規範：** 全小寫字母，底線分隔。
*   **範例：** `data_processor.py`, `auth_utils/`

### 2. 變數、物件與參數 (Variables & Parameters)
*   **規範：** **蛇形命名 (snake_case)**。
*   **衝突處理：** 若與關鍵字衝突，字尾加底線，如 `id_`, `class_`。
*   **範例：** `user_count = 5`, `def fetch(id_: int):`

### 3. 函式與方法 (Functions & Methods)
*   **規範：** **蛇形命名 (snake_case)**。
*   **內部使用：** 單前導底線 `_internal_method()`。
*   **名稱修飾：** 雙前導底線 `__private_attr` (避免子類別覆寫衝突)。

### 4. 類別與例外 (Classes & Exceptions)
*   **規範：** **帕斯卡命名 (PascalCase)**。
*   **範例：** `class UserProfile:`, `class DatabaseError(Exception):`

### 5. 常數 (Constants)
*   **規範：** **全大寫底線 (SCREAMING_SNAKE_CASE)**。
*   **範例：** `MAX_RETRIES = 3`, `API_URL = "https://..."`

---

## 第三部分：資源管理與安全性

### 1. Context Managers
始終使用 `with` 語句確保資源釋放。
*   **✅ 推薦：** `with open("file.txt") as f:`
*   **❌ 避免：** `f = open(...); f.close()`

### 2. 安全性 (3.11+)
使用 `LiteralString` 防止 SQL/Shell 注入。
*   **✅ 推薦：** `def query(sql: LiteralString):`
