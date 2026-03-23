# Modern Python Patterns (Up to 3.14)

這份文件列出了 Python 3.8+ 到最新 3.14 版本開發中的推薦模式與最佳實踐。

## 1. 使用 Dataclasses (3.7+)
對於純粹的資料容器，優先使用 `dataclasses` 而非傳統的類別。

### ✅ 推薦
```python
from dataclasses import dataclass

@dataclass(frozen=True)
class User:
    id: int
    name: str
    email: str
```

## 2. 現代型別標註 (3.9+)
在 Python 3.9+ 中，可以直接使用內建型別作為泛型，且在 3.14+ 中支援延遲評估。

### ✅ 推薦
```python
# 3.14+ 不再需要字串包裝前向引用 (Forward References)
def process_node(node: Node) -> list[int | str]:
    return [node.id, node.name]

class Node:
    id: int
    name: str
```

## 3. 非同步處理與任務追蹤 (3.14+)
正確管理非同步資源，並利用 3.14 的內省工具追蹤任務。

### ✅ 推薦
```python
import asyncio

async def main():
    # 3.14+ 可以使用 python -m asyncio ps <PID> 追蹤這些任務
    async with AsyncResource() as res:
        await asyncio.sleep(1)
```

## 4. 結構化模式比對 (3.10+)
使用 `match` 語句處理複雜的分支邏輯。

### ✅ 推薦
```python
def handle_command(command: str | list[str]):
    match command:
        case "quit":
            exit()
        case ["load", filename]:
            print(f"Loading {filename}")
        case _:
            print("Unknown command")
```

## 5. PEP 758：簡化異常處理 (3.14+)
當擷取多個異常且不需要存取異常實例時，可省略括號。

### ✅ 推薦
```python
try:
    data = fetch_resource()
except ConnectionError, TimeoutError: # 3.14+ 省略括號
    log_error("網路請求失敗")
```

## 6. PEP 750：t-string 模板字串 (3.14+)
用於需要安全轉義（如 SQL, HTML）或延遲解析的場景。

### ✅ 推薦
```python
# t-string 返回 Template 物件而非立即渲染字串
def safe_query(query_template):
    # 處理插值內容以防止注入
    pass

user_id = 123
# template = t"SELECT * FROM users WHERE id = {user_id}"
```

## 7. Pathlib 原生複製與移動 (3.14+)
優先使用 `pathlib` 取代 `os.path` 與 `shutil` 以維持程式碼風格一致。

### ✅ 推薦
```python
from pathlib import Path

source = Path("data/config.json")
dest = Path("backup/")

# 3.14+ 支援原生複製與移動
source.copy(dest / "config_v1.json")
source.move(dest / "config_old.json")
```

## 8. Pydantic 與資料驗證
在處理外部資料（API, JSON）時，結合 Pydantic 確保型別安全。

### ✅ 推薦
```python
from pydantic import BaseModel, EmailStr

class UserProfile(BaseModel):
    username: str
    email: EmailStr
    age: int
```
