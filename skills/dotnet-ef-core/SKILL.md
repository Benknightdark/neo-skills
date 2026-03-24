---
name: dotnet-ef-core
version: "1.0.0"
category: "Framework"
description: "Entity Framework Core (EF Core) 專家指引。支援從 .NET 6 (LTS) 到 .NET 10 (LTS) 的現代開發模式，涵蓋 Code-First 移轉、查詢優化、陰影屬性與複雜資料建模。"
compatibility: "Supports .NET 6.0 through 10.0 environments. Compatible with SQL Server, PostgreSQL, MySQL, and SQLite."
---

# EF Core 專家技能

## Trigger On
- 使用者要求進行資料庫建模、撰寫 Linq 查詢或處理資料庫移轉。
- 專案包含 `DbContext` 類別或引用了 `Microsoft.EntityFrameworkCore` 套件。
- 需要優化資料庫存取效能或解決 N+1 查詢問題。
- 涉及複雜的資料關聯設計（一對多、多對多、繼承映射）。

## Workflow
1. **Perceive (模型感知):**
   - 檢查 `.csproj` 識別 EF Core 版本與資料庫供應商。
   - 分析 `DbContext` 與實體配置，確認是否採用 Fluent API 模式。
   - 識別現有的移轉 (Migrations) 狀態。
2. **Reason (規劃階段):**
   - 評估查詢是否需要 `.AsNoTracking()` 或 `.AsSplitQuery()`。
   - 決定是否需要自定義攔截器處理審計欄位。
   - 針對大量數據更新評估是否使用 `ExecuteUpdate/Delete` ( .NET 7+)。
3. **Act (執行階段):**
   - 編寫高效、安全的 Linq 查詢。
   - 實作實體配置類別 (`IEntityTypeConfiguration`)。
   - 建立並執行資料庫移轉指令。
4. **Validate (規範驗證):**
   - 檢查產出的 SQL 是否符合預期效能（避免全表掃描）。
   - 驗證併發衝突處理邏輯。
   - 確保所有資料庫存取皆遵循非同步模式。

## Feature Roadmap (.NET 6 - 10)

### .NET 6 & 7 (Foundation)
- **Split Queries**: 解決笛卡兒積問題。
- **Bulk Operations**: 使用 `ExecuteUpdate/Delete` 進行高效能更新。
- **JSON Columns**: 內建的 JSON 映射支援。
- **Compiled Models**: 縮短大型模型的啟動時間。

### .NET 8 & 9 (Productivity)
- **Primitive Collections**: 在查詢中使用簡單型別集合。
- **HierarchyId**: 支援 SQL Server 的階層式資料。
- **Auto-compiled Queries**: 進一步優化查詢編譯流程。
- **Complex Types**: 更好的值對象 (Value Objects) 支援。

### .NET 10+ (Cutting Edge)
- **Advanced Interceptors**: 更多的查詢生命週期勾子。
- **Optimized AOT Support**: 針對雲原生環境的 AOT 預編譯優化。

## Coding Standards
- **Fluent API Preference**: 優先使用實體配置類別而非 Data Annotations。
- **Async Always**: 所有的 I/O 操作必須是非同步的。
- **No-Tracking by Default**: 唯讀查詢一律使用 `.AsNoTracking()`。
- **Naming**: 實體名稱與資料表對應，外鍵名稱具備明確語意。

## Deliver
- **Optimized Linq Queries**: 提供具備高效能 SQL 轉化潛力的查詢代碼。
- **Migration Scripts & Guidance**: 提供正確的移轉指令與手動調整建議。
- **Database Schema Design**: 根據業務需求設計規範化的實體關聯。

## Validate
- 確保提供的代碼符合 EF Core 的效能最佳實踐。
- 驗證代碼是否正確處理 Null 與資料庫約束。
- 確認資料庫連線與資源釋放邏輯正確（使用 `using` 或 Scoped DI）。

## Documentation
### Official References
- [Entity Framework Core 概觀](https://learn.microsoft.com/ef/core/)
- [EF Core 中的效能優化建議](https://learn.microsoft.com/ef/core/performance/)
- [受支援的資料庫提供者](https://learn.microsoft.com/ef/core/providers/)

### Internal References
- [EF Core 程式碼風格與命名規範](reference/coding-style.md)
- [EF Core 反模式與最佳實踐](reference/anti-patterns.md)
- [EF Core 現代開發模式指南](reference/patterns.md)
