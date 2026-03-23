# Modern Python Patterns (3.10 - 3.14)

這份文件列出了 Python 3.10 到最新 3.14 版本開發中的推薦模式與最佳實踐。

## 1. 結構化模式比對 (3.10+)
使用 `match` 語句處理複雜的分支邏輯、資料解構與 Guard 條件。

### ✅ 推薦
```python
def handle_event(event: dict):
    match event:
        case {"type": "click", "position": (x, y)}:
            print(f"Click at {x}, {y}")
        case {"type": "keypress", "key": key} if key.isalnum(): # 支援 Guard 條件
            print(f"Key pressed: {key}")
        case _:
            print("Unknown event")
```

## 2. 聯集型別運算子 (3.10+)
使用 `X | Y` 取代 `Union[X, Y]` 以獲得更具可讀性的型別標註。

### ✅ 推薦
```python
def process_data(data: int | str | None) -> None:
    # 同時支援型別提示與 isinstance()
    if isinstance(data, int | str):
        print(f"Processing: {data}")
```

## 3. 異常處理與併發任務 (3.11+)
使用例外群組 (Exception Groups) 與 `asyncio.TaskGroup` 管理併發。

### ✅ 推薦
```python
import asyncio

async def main():
    # 新程式碼應優先使用 TaskGroup 取代 asyncio.gather()
    async with asyncio.TaskGroup() as tg:
        tg.create_task(fetch_data())
        tg.create_task(process_data())

try:
    await main()
except* ValueError as eg: # 使用 except* 處理例外群組
    for e in eg.exceptions:
        print(f"Caught error: {e}")
```

## 4. 現代泛型與型別別名 (3.12+)
使用新的方括號語法宣告泛型，並利用 `type` 關鍵字建立型別別名。

### ✅ 推薦
```python
# 泛型函數宣告 (PEP 695)
def get_first[T](items: list[T]) -> T:
    return items[0]

# 泛型類別與型別別名
type Point[T] = tuple[T, T]

class Container[T]:
    def __init__(self, value: T):
        self.value = value
```

## 5. 強化版 f-string (3.12+)
利用解除限制後的 f-string 提升代碼靈活性。

### ✅ 推薦
```python
songs = ["Playlist A", "Playlist B"]
# 支援引號重用與多行註解
message = f"Songs: {
    ", ".join(songs) # 內部可以直接使用雙引號
} total: {len(songs)} # 支援內部註解"
```

## 6. PEP 758：簡化異常擷取 (3.14+)
當不需要存取異常實例時，捕捉多個異常可省略括號。

### ✅ 推薦
```python
try:
    resource = fetch()
except ConnectionError, TimeoutError: # 3.14+ 起允許省略括號
    log_error("網路請求失敗")
```

## 7. 標記延遲評估 (3.14+)
類別參照自身或尚未定義的類別時，不再需要使用字串引號。

### ✅ 推薦
```python
class Node:
    # 3.14 支援延遲評估，Node 名稱可直接使用
    def set_next(self, node: Node):
        self.next = node
```

## 8. Pathlib 原生操作 (3.14+)
優先使用 `pathlib` 內建的複製與移動方法。

### ✅ 推薦
```python
from pathlib import Path

source = Path("data.json")
# 3.14+ 支援原生複製
source.copy("backup.json")
```
