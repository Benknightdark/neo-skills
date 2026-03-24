# C# 程式碼風格與命名規範指南 (C# Coding Conventions)

本指南基於 Microsoft 官方的 [C# 程式碼慣例](https://learn.microsoft.com/zh-tw/dotnet/csharp/fundamentals/coding-style/coding-conventions) 和 [C# 命名規範](https://learn.microsoft.com/zh-tw/dotnet/csharp/programming-guide/concepts/coding-style/naming-conventions)，旨在提升開發效率並維持專案的一致性。

## 1. 命名規範 (Naming Conventions)

良好的命名是程式碼自定義文件的核心，能減少溝通成本。

### 1.1 大駝峰命名法 (PascalCase)
用於**公有 (Public) 成員**與**型別名稱**。
- **類別與結構 (Class & Struct)**：`public class OrderManager`
- **介面 (Interface)**：必須以大寫 **`I`** 開頭，如 `public interface IRepository`
- **屬性 (Property)**：`public string FullName { get; set; }`
- **方法 (Method)**：`public void ExecuteTask()`
- **列舉 (Enum)**：`public enum OrderStatus`

### 1.2 小駝峰命名法 (camelCase)
用於**內部、局部或私有成員**。
- **區域變數 (Local Variable)**：`var totalCount = 0;`
- **方法參數 (Parameter)**：`public void UpdateUser(int userId)`
- **私有欄位 (Private Field)**：**必須加上底線前綴 `_`**。這能一眼辨識出它是類別的狀態，而非區域變數或參數。
  - 推薦做法：`private readonly ILogger _logger;`

---

## 2. 檔案組織 (File Organization)

- **檔名對應**：檔案名稱必須與主要型別名稱一致（如 `CustomerService.cs` 內容應為 `class CustomerService`）。
- **單一職責**：原則上**一個檔案只定義一個型別**（Class, Interface, Enum），以利版本控制與代碼搜尋。
- **命名空間 (Namespace)**：
  - 優先使用 **File-scoped Namespace** (C# 10+) 以減少代碼嵌套層級：
    ```csharp
    namespace MyProject.Services; // 推薦做法 (C# 10+)
    ```

---

## 3. 程式碼排版 (Formatting)

### 3.1 Allman 風格 (大括號換行)
大括號 `{` 必須獨立成行，與類別、方法或控制語句對齊，這是 C# 的標準風格。
```csharp
// 正確做法
public void Process()
{
    if (isReady)
    {
        DoWork();
    }
}
```

### 3.2 縮排與空白
- **縮排**：固定使用 **4 個半形空格 (Spaces)**，嚴禁使用 Tab 字元，確保在不同平台上顯示一致。
- **空行**：方法之間應保留一個空行；方法內部邏輯段落之間可使用單一空行分隔。

---

## 4. 非同步程式設計 (Asynchronous Programming)

- **Async 字尾**：所有回傳 `Task` 或 `ValueTask` 的非同步方法，名稱必須以 **`Async`** 結尾。
- **CancellationToken**：非同步方法應優先考慮接受 `CancellationToken` 參數，並將其傳遞給下游非同步操作。
```csharp
public async Task<User?> GetUserByIdAsync(int id, CancellationToken ct = default)
{
    return await _context.Users.FindAsync([id], ct);
}
```

---

## 5. 現代 C# 語法建議 (Modern C# Best Practices)

- **型別推導 (var)**：當變數型別在指派側顯而易見時（如 `new`、轉型），建議使用 `var`。
  - 推薦：`var users = new List<User>();`
- **空值檢查**：使用 `is not null` 進行檢查，語意更接近自然語言且避開運算子多載。
  - 推薦：`if (input is not null) { ... }`
- **物件初始化**：優先使用物件初始設定式與集合運算式 (C# 12+)。
  - 推薦：`List<int> numbers = [1, 2, 3];`

---

## 6. 註解規範

- **XML 註解**：公有 API 必須使用 `///` 提供 XML 註解，以便 IDE 提供 IntelliSense 說明。
- **邏輯註解**：註解應說明「為什麼 (Why)」進行此處理，而非重複程式碼「做了什麼 (What)」。
