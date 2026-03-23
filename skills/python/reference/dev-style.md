# Modern Python Style Guide: Evolution & Conventions

This guide integrates syntax evolutions from Python 3.10 to 3.14 with PEP 8 naming conventions, aimed at providing a consistent, modern, and high-quality development standard.

---

## Part 1: Modern Syntax & Type Evolution (3.10 - 3.14)

### 1. Union Type Operator (3.10+)
Use `|` instead of `typing.Union` and `Optional`.
*   **✅ Recommended:** `def process(data: int | str | None):`
*   **❌ Avoid:** `def process(data: Union[int, str, None]):`

### 2. Structural Pattern Matching (3.10+)
Use `match/case` for clear data deconstruction.
*   **✅ Recommended:**
    ```python
    match response:
        case {"status": 200, "data": content}:
            return content
        case _:
            raise ValueError("Unknown response")
    ```

### 3. Self Type Annotation (3.11+)
Use `typing.Self` when a class method returns an instance of itself.
*   **✅ Recommended:** `def clone(self) -> Self: return self`

### 4. Exception Groups and Propagation (3.11+)
Use `except*` to handle `ExceptionGroup` thrown in concurrent tasks.
*   **✅ Recommended:**
    ```python
    try:
        await asyncio.gather(t1, t2)
    except* ValueError:
        log.error("Handling value errors")
    ```

### 5. Simplified Generics Syntax (3.12+)
Use `[T]` directly after the function or class name.
*   **✅ Recommended:** `def get_first[T](items: list[T]) -> T:`
*   **❌ Avoid:** `T = TypeVar('T'); def get_first(items: List[T]) -> T:`

### 6. f-string Restrictions Lifted (3.12+)
Allows quote reuse and internal expression comments.
*   **✅ Recommended:** `f"Name: {user["name"]}"`

### 7. Deprecation Markers and Generic Defaults (3.13+)
Use the `@deprecated` decorator and `Box[T = int]`.

### 8. 3.14 Preview Features
*   **Unparenthesized Exception Catching:** `except ValueError, TypeError:`
*   **Deferred Annotation Evaluation:** `def set_next(self, node: Node):` (no string quotes required for Node)

---

## Part 2: Naming Conventions (PEP 8)

### 1. Modules and Packages
*   **Convention:** All lowercase, separated by underscores.
*   **Example:** `data_processor.py`, `auth_utils/`

### 2. Variables, Objects, and Parameters
*   **Convention:** **snake_case**.
*   **Conflict Handling:** If a name conflicts with a keyword, append a trailing underscore, e.g., `id_`, `class_`.
*   **Example:** `user_count = 5`, `def fetch(id_: int):`

### 3. Functions and Methods
*   **Convention:** **snake_case**.
*   **Internal Use:** Single leading underscore `_internal_method()`.
*   **Name Mangling:** Double leading underscores `__private_attr` (to avoid collision in subclasses).

### 4. Classes and Exceptions
*   **Convention:** **PascalCase**.
*   **Example:** `class UserProfile:`, `class DatabaseError(Exception):`

### 5. Constants
*   **Convention:** **SCREAMING_SNAKE_CASE**.
*   **Example:** `MAX_RETRIES = 3`, `API_URL = "https://..."`

---

## Part 3: Resource Management & Security

### 1. Context Managers
Always use the `with` statement to ensure resource release.
*   **✅ Recommended:** `with open("file.txt") as f:`
*   **❌ Avoid:** `f = open(...); f.close()`

### 2. Security (3.11+)
Use `LiteralString` to prevent SQL/Shell injection.
*   **✅ Recommended:** `def query(sql: LiteralString):`
