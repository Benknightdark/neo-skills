# C# 現代開發模式指南 (Modern C# Patterns)

本文件介紹 C# 10 至 14+ 的推薦開發模式，旨在利用現代語法簡化程式碼並提升效能。

## 1. 架構與宣告模式

### 1.1 檔案範圍命名空間 (File-scoped Namespaces) - C# 10+
**推薦做法**：減少大括號嵌套，使程式碼結構更扁平。
```csharp
namespace MyProject.Services; // 推薦

public class CustomerService { ... }
```

### 1.2 主建構函式 (Primary Constructors) - C# 12+
**推薦做法**：簡化類別的依賴注入宣告。
```csharp
// 直接在類別名稱後宣告參數，用於初始化屬性或欄位
public class UserService(IUserRepository repository, ILogger logger)
{
    public async Task<User?> GetUserAsync(int id) => await repository.FindByIdAsync(id);
}
```

---

## 2. 數據結構與初始化

### 2.1 使用 Record 處理不可變數據
**推薦做法**：定義 DTO 或值對象時，優先與使用 `record` 以獲得內建的相等性比較與不可變性。
```csharp
public record UserDto(int Id, string Name, string Email);
```

### 2.2 集合運算式 (Collection Expressions) - C# 12+
**推薦做法**：使用一致的 `[]` 語法初始化各種集合類型。
```csharp
int[] array = [1, 2, 3];
List<string> names = ["Alice", "Bob"];
Span<byte> buffer = [0x01, 0x02];
```

### 2.3 原始字串常值 (Raw String Literals) - C# 11+
**推薦做法**：處理 JSON、SQL 或多行文字時，避免繁瑣的逸脫字元。
```csharp
string json = """
{
    "name": "Gemini",
    "version": "1.4"
}
""";
```

---

## 3. 邏輯與表達式

### 3.1 模式比對 (Pattern Matching)
**推薦做法**：使用 `switch` 表達式代替傳統的 `switch` 語句，並運用屬性模式。
```csharp
public decimal GetDiscount(Order order) => order switch
{
    { TotalAmount: > 1000 } => 0.1m,
    { Items.Count: > 5 } => 0.05m,
    _ => 0m
};
```

### 3.2 運算式主體成員 (Expression-bodied Members)
**推薦做法**：對於單行方法或唯讀屬性，使用 `=>` 縮減代碼。
```csharp
public override string ToString() => $"{FirstName} {LastName}";
```

---

## 4. C# 14+ 前瞻模式

### 4.1 屬性後備欄位 (Field-backed Properties)
**推薦做法**：在需要簡單邏輯的自動屬性中使用 `field` 關鍵字。
```csharp
public string Nickname 
{ 
    get; 
    set => field = value?.Trim() ?? "Guest"; 
}
```

### 4.2 擴充成員 (Extension Members)
**推薦做法**：使用 `extension` 區塊為現有型別增加屬性或靜態成員，而不僅僅是方法。
```csharp
public extension UserExtension for User
{
    public bool IsAdmin => this.Roles.Contains("Admin");
}
```

---

## 5. 安全性與效能

### 5.1 唯讀成員 (Readonly Members)
**推薦做法**：在 `struct` 中，若方法不會修改狀態，應標記為 `readonly` 以利編譯器優化。
```csharp
public readonly struct Point(double x, double y)
{
    public readonly double Distance => Math.Sqrt(x * x + y * y);
}
```

### 5.2 預設 Lambda 參數
**推薦做法**：為 Lambda 運算式提供預設值，增加彈性。
```csharp
var greeter = (string name = "Guest") => $"Hello, {name}!";
```

---

## 6. 空值安全 (Null Safety)

### 6.1 可為 Null 的引用類型 (Nullable Reference Types) - C# 8.0+
**推薦做法**：在專案級別啟用 NRT，並明確區分「不可為 Null」與「可為 Null」的參考類型，將 Null 檢查從執行階段提前至編譯階段。
```csharp
public class UserProfile
{
    // 配合 required 確保建構後不為 Null
    public required string Username { get; set; } 

    // 使用 ? 標示此欄位允許為 Null
    public string? Bio { get; set; }             
}
```

### 6.2 改善空值檢查語意
**推薦做法**：使用 `is not null` 與 `??=` 運算子，讓空值處理邏輯更簡潔且具備更高的可讀性。
```csharp
// 使用 is not null
if (input is not null) { ... }

// 使用空值聯合指派運算子
_logger ??= NullLogger.Instance;
```
