# Python Modernization & Evolution Guide (3.10 - 3.14+)

這份文件彙整了從 Python 3.10 到最新版本的重要語法演進，對比了「舊式/錯誤寫法」與「現代/正確寫法」，旨在協助開發者編寫更具可讀性、安全性與效能的程式碼。

---

## 0. 基礎陷阱 (不限版本)
這些是 Python 開發中最常見的邏輯錯誤。

### A. 使用可變物件作為預設引數
*   **❌ 錯誤：** `def add_item(item, items=[]):` (導致多次呼叫間共享狀態)
*   **✅ 正確：**
    ```python
    def add_item(item, items: list | None = None):
        if items is None:
            items = []
        items.append(item)
        return items
    ```

### B. 手動檢查型別
*   **❌ 錯誤：** `if type(val) == str:` (破壞繼承關係)
*   **✅ 正確：** `if isinstance(val, str):`

---

## 1. Python 3.10：聯集與結構化比對

### A. 聯集型別運算子 (Union Type Operator)
*   **❌ 舊式寫法：** `from typing import Union; def func(data: Union[int, str]):`
*   **✅ 現代寫法：**
    ```python
    def process_data(data: int | str) -> int | str:
        # 使用直覺的位元或運算子 | 取代 Union[]
        pass
    ```

### B. 結構化模式比對 (Structural Pattern Matching)
*   **❌ 舊式寫法：** 使用冗長的 `if-elif-else` 鏈結。
*   **✅ 現代寫法：**
    ```python
    def http_status(status):
        match status:
            case 200:
                return "OK"
            case 404:
                return "Not Found"
            case _:
                return "Unknown"
    ```

---

## 2. Python 3.11：型別參照與例外群組

### A. Self 型別 (The `Self` Type)
*   **❌ 舊式寫法：** 需要依賴 `TypeVar` 進行繁瑣的類別自身參照。
*   **✅ 現代寫法：**
    ```python
    from typing import Self

    class Config:
        def clone(self) -> Self:
            return self
    ```

### B. 例外群組 (Exception Groups)
*   **❌ 舊式寫法：** 傳統 `except` 容易遺漏併發任務中的其他例外。
*   **✅ 現代寫法：**
    ```python
    try:
        await asyncio.gather(task1(), task2())
    except* ValueError as e:
        print("處理所有 ValueError 群組")
    except* TypeError as e:
        print("處理所有 TypeError 群組")
    ```

---

## 3. Python 3.12：泛型與字串升級

### A. 泛型語法 (Type Parameter Syntax)
*   **❌ 舊式寫法：** 需宣告 `T = TypeVar('T')`。
*   **✅ 現代寫法：**
    ```python
    # 宣告語法大幅簡化，完全移除對 TypeVar 模組的依賴
    def get_first[T](items: list[T]) -> T:
        return items[0]
    ```

### B. F-string 巢狀引號解除限制
*   **❌ 舊式寫法：** 內外引號必須交錯使用，如 `f"{employee['name']}"`。
*   **✅ 現代寫法：**
    ```python
    employee = {"name": "Alice"}
    # 允許直接重複使用雙引號，降低修改代碼時的心智負擔
    message = f"Employee name is {employee["name"]}"
    ```

---

## 4. Python 3.13：棄用標示與型別預設值

### A. 標示棄用 (Deprecation Decorator)
*   **❌ 舊式寫法：** 手動呼叫 `warnings.warn()`。
*   **✅ 現代寫法：**
    ```python
    from warnings import deprecated

    @deprecated("請改用 new_api()")
    def old_api():
        pass
    ```

### B. 不可變物件的副本建立 (copy.replace)
*   **❌ 舊式寫法：** 針對不同型別需調用不同方法（如 `._replace()` 或 `replace()`）。
*   **✅ 現代寫法：**
    ```python
    import copy
    # 3.13 統一了 namedtuple, dataclass, datetime 等物件的副本修改介面
    new_obj = copy.replace(old_obj, field="value")
    ```

### C. 泛型預設值 (Type Parameter Defaults)
*   **✅ 現代寫法：**
    ```python
    # 允許為泛型指定預設型別
    class Box[T = int]:
        def __init__(self, item: T):
            self.item = item
    ```

### D. 精確類型縮減與唯讀保護
*   **✅ 現代寫法：**
    ```python
    from typing import TypeIs, ReadOnly, TypedDict

    class User(TypedDict):
        age: ReadOnly[int] # 標記為唯讀，防止靜態檢查錯誤

    def is_str_list(val: list[object]) -> TypeIs[list[str]]:
        # 提供比 TypeGuard 更直觀的類型縮減
        return all(isinstance(x, str) for x in val)
    ```

### E. 移除過時的「電池」 (PEP 594)
*   **⚠️ 注意：** Python 3.13 已正式移除 `cgi`, `telnetlib`, `crypt` 等 19 個舊版模組，請改用現代替代方案（如 `fastapi`, `paramiko`）。

---

## 5. Python 3.14 (最新預覽)

### A. 無括號例外捕捉 (Unparenthesized Exceptions)
*   **❌ 舊式寫法：** `except (ValueError, TypeError):`
*   **✅ 現代寫法：** `except ValueError, TypeError:` (減少視覺雜訊)

### B. 標記延遲評估 (Deferred Annotations)
*   **❌ 舊式寫法：** `def set_next(self, node: "Node"):` (需用字串包裝前向引用)
*   **✅ 現代寫法：**
    ```python
    class Node:
        # 3.14 預設延遲評估，直接寫類別名稱即可，不再需要引號
        def set_next(self, node: Node):
            pass
    ```

### C. Pathlib 原生複製與移動
*   **❌ 舊式寫法：** `shutil.copy(file, dest)`
*   **✅ 現代寫法：** `from pathlib import Path; Path("f.txt").copy("dest.txt")`

---

## 6. 資源管理 (通用最佳實踐)
始終使用 `with` 語句處理檔案與連線。
*   **❌ 錯誤：** 手動呼叫 `f.close()`。
*   **✅ 正確：** `with open(...) as f:`。
