# Python Modernization & Evolution Guide (3.10 - 3.14+)

This document summarizes important syntax evolutions from Python 3.10 to the latest versions, comparing "Outdated/Incorrect Practices" with "Modern/Correct Practices" to help developers write more readable, secure, and performant code.

---

## 0. Fundamental Pitfalls (Version Independent)
These are the most common logical errors in Python development.

### A. Using Mutable Objects as Default Arguments
*   **❌ Incorrect:** `def add_item(item, items=[]):` (causes shared state across multiple calls)
*   **✅ Correct:**
    ```python
    def add_item(item, items: list | None = None):
        if items is None:
            items = []
        items.append(item)
        return items
    ```

### B. Manual Type Checking
*   **❌ Incorrect:** `if type(val) == str:` (breaks inheritance relationships)
*   **✅ Correct:** `if isinstance(val, str):`

---

## 1. Python 3.10: Union Types and Structural Matching

### A. Union Type Operator
*   **❌ Outdated:** `from typing import Union; def func(data: Union[int, str]):`
*   **✅ Modern:**
    ```python
    def process_data(data: int | str) -> int | str:
        # Use the intuitive bitwise OR operator | instead of Union[]
        pass
    ```

### B. Structural Pattern Matching
*   **❌ Outdated:** Using long `if-elif-else` chains.
*   **✅ Modern:**
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

## 2. Python 3.11: Type References and Exception Groups

### A. The `Self` Type
*   **❌ Outdated:** Relying on `TypeVar` for verbose class self-references.
*   **✅ Modern:**
    ```python
    from typing import Self

    class Config:
        def clone(self) -> Self:
            return self
    ```

### B. Exception Groups
*   **❌ Outdated:** Traditional `except` easily misses other exceptions in concurrent tasks.
*   **✅ Modern:**
    ```python
    try:
        await asyncio.gather(task1(), task2())
    except* ValueError as e:
        print("Handling all ValueError groups")
    except* TypeError as e:
        print("Handling all TypeError groups")
    ```

---

## 3. Python 3.12: Generics and f-string Upgrades

### A. Type Parameter Syntax
*   **❌ Outdated:** Declaring `T = TypeVar('T')`.
*   **✅ Modern:**
    ```python
    # Syntax is greatly simplified, completely removing dependency on TypeVar
    def get_first[T](items: list[T]) -> T:
        return items[0]
    ```

### B. f-string Nested Quote Restriction Lifted
*   **❌ Outdated:** Inner and outer quotes must be alternated, e.g., `f"{employee['name']}"`.
*   **✅ Modern:**
    ```python
    employee = {"name": "Alice"}
    # Allows direct reuse of double quotes, reducing mental load when modifying code
    message = f"Employee name is {employee["name"]}"
    ```

---

## 4. Python 3.13: Deprecation Markers and Type Defaults

### A. Deprecation Decorator
*   **❌ Outdated:** Manually calling `warnings.warn()`.
*   **✅ Modern:**
    ```python
    from warnings import deprecated

    @deprecated("Please use new_api() instead")
    def old_api():
        pass
    ```

### B. Copy and Replace for Immutable Objects (`copy.replace`)
*   **❌ Outdated:** Calling different methods (e.g., `._replace()` or `replace()`) for different types.
*   **✅ Modern:**
    ```python
    import copy
    # 3.13 unifies the interface for modifying copies of namedtuple, dataclass, datetime, etc.
    new_obj = copy.replace(old_obj, field="value")
    ```

### C. Type Parameter Defaults
*   **✅ Modern:**
    ```python
    # Allows specifying default types for generics
    class Box[T = int]:
        def __init__(self, item: T):
            self.item = item
    ```

### D. Precise Type Narrowing and Read-Only Protection
*   **✅ Modern:**
    ```python
    from typing import TypeIs, ReadOnly, TypedDict

    class User(TypedDict):
        age: ReadOnly[int] # Marked as read-only to prevent static check errors

    def is_str_list(val: list[object]) -> TypeIs[list[str]]:
        # Provides more intuitive type narrowing than TypeGuard
        return all(isinstance(x, str) for x in val)
    ```

### E. Removal of "Dead Batteries" (PEP 594)
*   **⚠️ Note:** Python 3.13 has officially removed 19 legacy modules including `cgi`, `telnetlib`, and `crypt`. Please use modern alternatives (e.g., `fastapi`, `paramiko`).

---

## 5. Python 3.14 (Latest Preview)

### A. Unparenthesized Exception Handling
*   **❌ Outdated:** `except (ValueError, TypeError):`
*   **✅ Modern:** `except ValueError, TypeError:` (reduces visual noise)

### B. Deferred Annotation Evaluation
*   **❌ Outdated:** `def set_next(self, node: "Node"):` (requires string quotes for forward references)
*   **✅ Modern:**
    ```python
    class Node:
        # 3.14 defaults to deferred evaluation; refer to the class directly without quotes
        def set_next(self, node: Node):
            pass
    ```

### C. Pathlib Native Copy and Move
*   **❌ Outdated:** `shutil.copy(file, dest)`
*   **✅ Modern:** `from pathlib import Path; Path("f.txt").copy("dest.txt")`

---

## 6. Resource Management (General Best Practice)
Always use `with` statements to handle files and connections.
*   **❌ Incorrect:** Manually calling `f.close()`.
*   **✅ Correct:** `with open(...) as f:`.
