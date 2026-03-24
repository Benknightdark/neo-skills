# .NET Minimal APIs 現代開發模式 (Modern Patterns)

本文件介紹 .NET 6 至 10+ 在 Minimal APIs 領域的推薦開發模式。

## 1. 架構模式

### 1.1 端點組態分離 (Module-based Configuration)
**推薦做法**：使用擴充方法將路由配置從 `Program.cs` 中抽離，保持啟動檔案的簡潔。
```csharp
// Program.cs
app.MapUserEndpoints();
app.MapOrderEndpoints();
```

### 1.2 端點過濾器 (Endpoint Filters) - .NET 7+
**推薦做法**：使用過濾器處理共通邏輯（如驗證、日誌），而非在 Handler 內撰寫重複代碼。
```csharp
group.MapPost("/", CreateUser)
     .AddEndpointFilter<ValidationFilter<UserDto>>();
```

---

## 2. 數據傳輸與驗證

### 2.1 使用 Record 處理 DTO
**推薦做法**：配合 `asParameters` 特性，簡化 Handler 的參數列表。
```csharp
// 使用 [AsParameters] 映射多個來源
app.MapGet("/search", ([AsParameters] SearchCriteria criteria) => { ... });

public record SearchCriteria(string? Query, int Page = 1, int PageSize = 10);
```

### 2.2 強型別回應 (Typed Results) - .NET 7+
**推薦做法**：使用 `Results<T1, T2>` 提升 Swagger 的自動文件化能力與單元測試的便利性。

---

## 3. 安全性與文件化

### 3.1 OpenAPI (Swagger) 整合
**推薦做法**：使用 `.WithOpenApi()` 與 `.WithName()` 顯式標記端點。
```csharp
app.MapGet("/users", () => ...)
   .WithName("GetUsers")
   .WithOpenApi(operation => 
   {
       operation.Summary = "獲取所有使用者";
       return operation;
   });
```

### 3.2 Antiforgery (防偽標記) - .NET 8+
**推薦做法**：在 Minimal APIs 中直接使用 `.DisableAntiforgery()` 或 `.ValidateAntiforgery()`。

---

## 4. 效能優化

### 4.1 HybridCache - .NET 9+
**推薦做法**：使用 `HybridCache` 代替 `IDistributedCache` 以獲得更好的序列化效能與預防緩存擊穿。

### 4.2 靜態端點優化
**推薦做法**：對於不依賴請求上下文的端點，使用靜態 Lambda 以減少閉包分配。
```csharp
app.MapGet("/health", static () => "Healthy");
```
