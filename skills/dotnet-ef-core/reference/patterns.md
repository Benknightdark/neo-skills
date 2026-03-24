# EF Core 現代開發模式 (Modern Patterns)

本文件介紹 .NET 6 至 10+ 在 Entity Framework Core 領域的推薦開發模式。

## 1. 高階查詢模式

### 1.1 拆分查詢 (Split Queries) - .NET 6+
**推薦做法**：在處理包含多個 `Include()` 的複雜關聯時，使用 `.AsSplitQuery()` 避免「笛卡兒積」造成的效能爆炸。

### 1.2 編譯查詢 (Compiled Queries)
**推薦做法**：對於被頻繁執行且參數化的熱點查詢，使用 `EF.CompileAsyncQuery` 提升查詢效率。

---

## 2. 攔截器與事件

### 2.1 儲存攔截器 (SaveChanges Interceptor)
**推薦做法**：實作 `SaveChangesInterceptor` 來自動處理審計欄位（如 `CreatedBy`, `CreatedAt`），確保業務邏輯與資料持久化關注點分離。

### 2.2 查詢攔截器 (Query Interceptors) - .NET 8+
**推薦做法**：使用攔截器在查詢執行前動態修改 SQL（例如：自動加入全域過濾器）。

---

## 3. 進階數據操作

### 3.1 批次更新與刪除 (ExecuteUpdate / ExecuteDelete) - .NET 7+
**推薦做法**：對於不需要載入實體至記憶體的大量更新或刪除操作，直接使用 `ExecuteUpdateAsync` 或 `ExecuteDeleteAsync`。
```csharp
await context.Orders
    .Where(o => o.Status == "Expired")
    .ExecuteDeleteAsync();
```

### 3.2 陰影屬性與 JSON 映射
**推薦做法**：利用 .NET 7+ 增強的 JSON 支援，將複雜結構直接映射至資料庫的 JSON 欄位中。

---

## 4. 環境與工具

### 4.1 DbContextFactory
**推薦做法**：在 Blazor Server 或長週期背景服務中，使用 `IDbContextFactory<T>` 來確保 DbContext 的生命週期正確。

### 4.2 移轉組合 (Migrations Bundles)
**推薦做法**：使用 `dotnet ef migrations bundle` 生成獨立的可執行檔，簡化 CI/CD 中的資料庫部署流程。

---

## 5. C# 14+ 前瞻模式

### 5.1 Extension Types 為實體增加計算屬性
**推薦做法**：利用 C# 14 的 Extension Types 為 POCO 實體增加不影響資料庫架構的計算屬性。
