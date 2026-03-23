# Modern Python Patterns (3.10 - 3.14)

This document lists recommended patterns and best practices for development in Python versions 3.10 through the latest 3.14.

## 1. Structural Pattern Matching (3.10+)
Use `match` statements to handle complex branching logic, data deconstruction, and Guard conditions.

### ✅ Recommended
```python
def handle_event(event: dict):
    match event:
        case {"type": "click", "position": (x, y)}:
            print(f"Click at {x}, {y}")
        case {"type": "keypress", "key": key} if key.isalnum(): # Supports Guard conditions
            print(f"Key pressed: {key}")
        case _:
            print("Unknown event")
```

## 2. Union Type Operator (3.10+)
Use `X | Y` instead of `Union[X, Y]` for more readable type annotations.

### ✅ Recommended
```python
def process_data(data: int | str | None) -> None:
    # Supports both type hints and isinstance()
    if isinstance(data, int | str):
        print(f"Processing: {data}")
```

## 3. Exception Handling and Concurrent Tasks (3.11+)
Use Exception Groups and `asyncio.TaskGroup` to manage concurrency.

### ✅ Recommended
```python
import asyncio

async def main():
    # New code should prefer TaskGroup over asyncio.gather()
    async with asyncio.TaskGroup() as tg:
        tg.create_task(fetch_data())
        tg.create_task(process_data())

try:
    await main()
except* ValueError as eg: # Use except* to handle Exception Groups
    for e in eg.exceptions:
        print(f"Caught error: {e}")
```

## 4. Modern Generics and Type Aliases (3.12+)
Use the new square bracket syntax for generic declarations and the `type` keyword for type aliases.

### ✅ Recommended
```python
# Generic function declaration (PEP 695)
def get_first[T](items: list[T]) -> T:
    return items[0]

# Generic classes and type aliases
type Point[T] = tuple[T, T]

class Container[T]:
    def __init__(self, value: T):
        self.value = value
```

## 5. Enhanced f-strings (3.12+)
Leverage unrestricted f-strings to improve code flexibility.

### ✅ Recommended
```python
songs = ["Playlist A", "Playlist B"]
# Supports quote reuse and multiline comments
message = f"Songs: {
    ", ".join(songs) # Quotes can be reused internally
} total: {len(songs)} # Supports internal comments"
```

## 6. PEP 758: Unparenthesized Exception Handling (3.14+)
Parentheses can be omitted when catching multiple exceptions if the exception instance is not accessed.

### ✅ Recommended
```python
try:
    resource = fetch()
except ConnectionError, TimeoutError: # Omit parentheses allowed from 3.14+
    log_error("Network request failed")
```

## 7. Deferred Annotation Evaluation (3.14+)
String quotes are no longer required when a class refers to itself or classes not yet defined.

### ✅ Recommended
```python
class Node:
    # 3.14 supports deferred evaluation; Node name can be used directly
    def set_next(self, node: Node):
        self.next = node
```

## 8. Pathlib Native Operations (3.14+)
Prefer native copy and move methods built into `pathlib`.

### ✅ Recommended
```python
from pathlib import Path

source = Path("data.json")
# 3.14+ supports native copy
source.copy("backup.json")
```
