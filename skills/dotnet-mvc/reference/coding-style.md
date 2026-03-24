# .NET MVC 程式碼風格與命名規範 (Coding Conventions)

本指南旨在提升 ASP.NET Core MVC 應用程式的結構化程度，並優化 Razor 視圖與控制器的開發效率。

## 1. 視圖模型 (ViewModels)

### 1.1 命名與角色
- **ViewModel 字尾**：所有專為視圖設計的資料模型必須以 `ViewModel` 結尾（如 `UserLoginViewModel`）。
- **嚴格區分**：**禁止**直接將資料庫實體 (Entity) 傳遞給視圖。視圖模型應僅包含視圖所需的資料。

### 1.2 資料註釋 (Data Annotations)
- **驗證屬性**：在 ViewModel 上使用 `[Required]`, `[StringLength]`, `[EmailAddress]` 等特性來宣告驗證規則。
- **顯示名稱**：使用 `[Display(Name = "使用者名稱")]` 以確保標籤在不同語言下的一致性。

---

## 2. 視圖與佈局 (Views & Layouts)

- **PascalCase 視圖名**：視圖檔案名稱應與動作方法一致，使用 `PascalCase`（如 `Index.cshtml`, `Edit.cshtml`）。
- **強型別視圖**：所有視圖必須在頂部使用 `@model` 宣告強型別。
- **佈局管理**：善用 `_ViewStart.cshtml` 與 `_Layout.cshtml` 統一樣式。使用 `@section` 處理各頁面專屬的腳本或樣式。

---

## 3. 標籤協助程式 (Tag Helpers)

- **優先使用**：優先使用標籤協助程式（如 `asp-for`, `asp-action`）而非傳統的 HTML Helper（如 `@Html.TextBoxFor`）。
- **自定義標籤**：對於重複的 UI 邏輯（如分頁導覽、複雜按鈕），建議實作自定義 `TagHelper`。

---

## 4. 控制器 (Controllers)

- **繼承 Controller**：繼承自 `Microsoft.AspNetCore.Mvc.Controller`（而非 `ControllerBase`），以獲得 View 相關的支援。
- **動作回傳**：動作方法應明確回傳 `IActionResult` 或 `Task<IActionResult>`。

---

## 5. 檔案組織

- **標準結構**：遵循 `Controllers/`, `Models/` (ViewModels), `Views/` 的標準目錄結構。
- **部分視圖 (Partial Views)**：通用的視圖組件應放置於 `Views/Shared/` 且名稱以底線開頭（如 `_UserCard.cshtml`）。
