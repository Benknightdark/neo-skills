# Python Anti-Patterns & Modern Guide (3.13 - 3.14+)

這份文件列出了應避免的過時 Python 寫法、常見錯誤，以及針對 Python 3.13 與 3.14 最新標準的寫法指南。

## 1. 基礎陷阱：使用可變物件作為預設引數
這會導致預設引數在多次呼叫間共享狀態。

### ❌ 錯誤
```python
def add_item(item, items=[]):
    items.append(item)
    return items
```

### ✅ 修正
```python
def add_item(item, items: list | None = None):
    if items is None:
        items = []
    items.append(item)
    return items
```

---

## 2. Python 3.13+ 最新寫法指南

### A. 不可變物件的副本建立 (copy.replace)
在 3.13 以前，修改 `namedtuple` 或 `dataclass` 的副本通常需要使用 `._replace()` 或 `dataclasses.replace()`。3.13 統一了這個介面。

* **❌ 舊式寫法：**
    ```python
    from dataclasses import replace
    new_obj = replace(old_obj, field="value")
    # 或者針對 namedtuple
    new_point = old_point._replace(x=10)
    ```
* **✅ 最新寫法 (3.13+)：**
    ```python
    import copy
    # 支援 namedtuple, dataclass, datetime 等多種不可變物件
    new_obj = copy.replace(old_obj, field="value")
    ```

### B. 類型縮減與靜態檢查 (Typing Improvements)
3.13 引入了更精確的類型檢查工具，避免開發時的邏輯漏洞。

* **❌ 舊式 / 較不精確寫法：**
    ```python
    from typing import TypeGuard, TypedDict

    class User(TypedDict):
        name: str
        age: int # 難以在靜態檢查中防止被修改

    def is_str_list(val: list[object]) -> TypeGuard[list[str]]:
        return all(isinstance(x, str) for x in val)
    ```
* **✅ 最新寫法 (3.13+)：**
    ```python
    from typing import TypeIs, ReadOnly, TypedDict

    class User(TypedDict):
        name: str
        age: ReadOnly[int] # 標記為唯讀，防止靜態檢查錯誤

    def is_str_list(val: list[object]) -> TypeIs[list[str]]:
        # TypeIs 比 TypeGuard 提供更直觀的類型縮減邏輯
        return all(isinstance(x, str) for x in val)
    ```

### C. 移除過時的「電池」 (PEP 594)
3.13 正式移除了 19 個舊版標準庫。請停止使用這些模組並尋找替代方案。

* **❌ 應避免使用的模組 (3.13 已移除)：**
    * `cgi`, `cgitb` (請改用 `fastapi`, `flask` 等 Web 框架)
    * `telnetlib` (請改用 `netmiko` 或 `paramiko`)
    * `crypt`, `nis`, `nntplib`, `pipes`, `sndhdr`, `uu`, `xdrlib` 等。

---

## 3. Python 3.14+ 最新寫法指南

### A. 例外處理 (Exception Handling - PEP 758)
Python 3.14 捕捉多個例外時不再強制需要括號。

* **❌ 舊式寫法：**
    ```python
    try:
        process_data()
    except (ValueError, TypeError): # 舊版必須使用 tuple 括號
        pass
    ```
* **✅ 最新寫法 (3.14+)：**
    ```python
    try:
        process_data()
    except ValueError, TypeError: # 3.14 起可省略括號
        pass
    ```

### B. 型別提示 (Type Hinting)
3.14 支援型別延遲評估，不再需要用字串包裝尚未定義的類別（前向引用）。

* **❌ 舊式寫法：**
    ```python
    def process(node: "Node"): # 舊版需要引號包裝
        pass
    ```
* **✅ 最新寫法 (3.14+)：**
    ```python
    def process(node: Node): # 直接引用，支援延遲評估
        pass
    ```

### C. 路徑操作 (Pathlib Improvements)
3.14 為 `Path` 物件加入了原生的複製與移動方法。

* **❌ 舊式寫法：**
    ```python
    import shutil
    shutil.copy(file_path, "dest.txt")
    ```
* **✅ 最新寫法 (3.14+)：**
    ```python
    from pathlib import Path
    Path("file.txt").copy("dest.txt") # 3.14 支援原生 .copy()
    ```

## 4. 資源管理 (通用最佳實踐)
始終使用 `with` 語句處理檔案與連線。

* **❌ 錯誤：** 手動呼叫 `f.close()`。
* **✅ 正確：** `with open(...) as f:`。
