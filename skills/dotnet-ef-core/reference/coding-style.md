# EF Core 程式碼風格與命名規範 (Coding Conventions)

本指南旨在提升 Entity Framework Core 的代碼可讀性與維護性，並確保資料庫模型的定義具有高度一致性。

## 1. 實體與建模 (Entities & Modeling)

### 1.1 實體類別
- **PascalCase**：所有實體類別名稱必須與資料庫資料表對應，並使用 `PascalCase`（如 `Order`, `ProductCategory`）。
- **陰影屬性 (Shadow Properties)**：對於不需要暴露給業務邏輯但資料庫需要的欄位（如 `CreatedDate`, `LastUpdated`），應使用陰影屬性定義。

### 1.2 關聯命名
- **導覽屬性 (Navigation Properties)**：集合型別應使用複數（如 `public ICollection<Order> Orders { get; set; }`），單一實體則使用單數。
- **外鍵命名**：優先遵循 `<EntityName>Id` 的慣例（如 `CategoryId`）。

---

## 2. DbContext 配置

- **Fluent API 優先**：優先使用 `IEntityTypeConfiguration<T>` 類別來進行實體配置，而非在 `OnModelCreating` 中堆疊代碼，或在實體上使用 Data Annotations。
- **配置目錄**：將所有配置類別放置於 `Data/Configurations` 目錄下。

---

## 3. 查詢規範 (Querying)

- **非同步執行**：所有資料庫存取操作必須優先使用非同步方法（如 `ToListAsync()`, `FirstOrDefaultAsync()`）。
- **唯讀查詢**：對於不需要更新的查詢，必須顯式呼叫 `.AsNoTracking()` 以減少記憶體開銷。
- **特定欄位投影**：避免 `Select *`，應使用 `.Select(x => new Dto { ... })` 僅擷取所需的資料。

---

## 4. 移轉管理 (Migrations)

- **具名移轉**：移轉名稱必須反映變更內容（如 `AddUserPhoneNumber`, `FixOrderDiscountTypo`），禁止使用亂數或無意義名稱。
- **預防數據遺失**：在手動修改移轉腳本時，必須檢查是否有隱含的刪除動作。

---

## 5. 檔案組織

- **Data 目錄**：將 `DbContext`、實體定義與配置放置於 `Data/` 或 `Infrastructure/Persistence/` 下。
- **File-scoped Namespace**：一律使用 File-scoped Namespace (C# 10+)。
