# EF Core 反模式與最佳實踐 (Anti-Patterns & Best Practices)

本文件列出 Entity Framework Core 開發中常見的錯誤做法及其對應的正確實踐。

## 1. 效能與查詢 (Performance & Querying)

### 1.1 避免 N+1 查詢問題
**問題**：在循環中存取導覽屬性，導致執行過量的 SQL 查詢。

- **錯誤**：遍歷 Users 並在循環內存取 `user.Orders` 而未預先載入。
- **正確**：使用 `.Include(u => u.Orders)` 進行預先載入 (Eager Loading)，或使用專門的投影。

### 1.2 避免在查詢中使用複雜的 C# 函式
**問題**：EF Core 無法將自定義的 C# 方法轉換為 SQL，導致查詢被迫在客戶端 (In-Memory) 執行。

- **錯誤**：`Where(u => MyCustomLogic(u.Name))`。
- **正確**：儘量使用 SQL 內建函式或 `EF.Functions` 提供的方法。

---

## 2. 生命週期管理 (Lifecycle)

### 2.1 避免共用 DbContext
**問題**：DbContext 不是執行緒安全的。在多個執行緒或併發請求中共享同一個實例會導致資料損毀或異常。

- **錯誤**：在靜態變數或單例服務中存放 DbContext。
- **正確**：將 DbContext 註冊為 `Scoped` 生命週期（ASP.NET Core 的預設做法）。

### 2.2 避免過長的生命週期
- **問題**：隨著時間推移，DbContext 的 Change Tracker 會累積大量實體，使查詢與 `SaveChanges` 越來越慢。
- **正確**：對於大型批次任務，應定期釋放舊的 Context 並建立新的實例。

---

## 3. 模型定義 (Model Definition)

### 3.1 避免過度依賴 Data Annotations
- **問題**：實體類別被資料庫配置特性（如 `[Table]`, `[Column]`）污染，違反單一職責。
- **正確**：使用 Fluent API (`IEntityTypeConfiguration`) 保持實體的純粹性。

### 3.2 避免忽視併發衝突 (Concurrency)
- **錯誤**：多個使用者同時修改同一筆資料時，最後一筆會直接覆蓋前面的修改。
- **正確**：在關鍵實體上加入 `RowVersion` 或 `Timestamp` 欄位，實作樂觀併發控制。

---

## 4. 工具與開發

### 4.1 避免將開發用資料庫與移轉腳本脫鉤
- **問題**：直接修改資料庫結構而不建立 Migrations。
- **正確**：一律透過 `dotnet ef migrations add` 管理結構變更，確保團隊環境一致。
