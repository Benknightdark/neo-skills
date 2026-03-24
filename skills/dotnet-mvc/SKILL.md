---
name: dotnet-mvc
version: "1.0.0"
category: "Framework"
description: "開發 ASP.NET Core MVC 應用程式的專家指引。支援從 .NET 6 (LTS) 到 .NET 10 (LTS) 的現代開發模式，涵蓋視圖模型、標籤協助程式、視圖元件與伺服器端渲染的最佳實踐。"
compatibility: "Supports .NET 6.0 through 10.0 environments. Requires .NET SDK installed locally."
---

# .NET MVC 專家技能

## Trigger On
- 使用者要求建立、除錯、重構或審查 ASP.NET Core MVC 應用程式。
- 專案包含 `Views` 與 `Controllers` 目錄且繼承自 `Controller`（非 `ControllerBase`）。
- 目標框架為 .NET 6.0 (LTS) 及以上版本。
- 需要優化伺服器端渲染 (SSR) 效能或改進視圖組織結構。

## Workflow
1. **Perceive (架構感知):**
   - 檢查 `.csproj` 識別 `TargetFramework`。
   - 分析 `Views/Shared` 確認佈局與部分視圖的現有配置。
   - 識別是否啟用了標籤協助程式 (Tag Helpers) 與靜態資源版本化。
2. **Reason (規劃階段):**
   - 評估是否需要將複雜的 Partial Views 遷移至 View Components。
   - 決定是否需要自定義 Tag Helpers 來簡化 UI 邏輯。
   - 根據專案規模選擇合適的 ViewModel 組織方式。
3. **Act (執行階段):**
   - 編寫高品質的控制器與強型別視圖。
   - 實作資料驗證 (Data Annotations) 並整合至 ViewModel。
   - 配置並使用標籤協助程式，確保表單與連結的語意正確。
4. **Validate (規範驗證):**
   - 驗證頁面渲染是否符合預期的 HTML 結構。
   - 檢查模型驗證是否在前端與後端皆正確運作。
   - 確保抗防偽標記 (Antiforgery) 已正確套用於所有狀態修改請求。

## Feature Roadmap (.NET 6 - 10)

### .NET 6 & 7 (Foundation)
- **Tag Helpers**: 聲明式 HTML 屬性擴充。
- **View Components**: 邏輯導向的 UI 區塊化。
- **Cache Tag Helper**: 伺服器端視圖片段緩存。
- **Nullable Views**: 更好的 Razor 空值安全支援。

### .NET 8 & 9 (Productivity)
- **Blazor Integration**: MVC 與 Blazor 組件的混合開發支援。
- **Antiforgery Improvements**: 全局防偽自動驗證優化。
- **Keyed Services in Controllers**: 更細緻的依賴注入支援。
- **Native AOT for MVC**: 針對 AOT 的元數據編譯優化。

### .NET 10+ (Cutting Edge)
- **Extension Members for IHtmlHelper**: 擴充視圖輔助功能。
- **Advanced Serialization in Views**: 針對大型視圖模型的效能優化。

## Coding Standards
- **Strongly Typed Views**: 所有視圖必須具備明確的 `@model`。
- **ViewModel Separation**: 嚴禁將資料庫實體直接暴露給視圖。
- **Naming**: 視圖模型必須以 `ViewModel` 結尾，動作方法優先使用非同步。
- **Formatting**: 遵循 Allman 風格並使用標籤協助程式代替 HTML Helper。

## Deliver
- **Version-Optimized MVC Code**: 提供符合目標版本的現代化控制器、模型與視圖。
- **UI Architecture Suggestions**: 針對視圖元件與標籤協助程式提供設計建議。
- **Validation Logic**: 提供完整的模型驗證與錯誤提示實作方案。

## Validate
- 確保代碼符合 C# 10+ 語法標準。
- 驗證端點正確處理模型驗證失敗並回傳表單狀態。
- 確認靜態資源與腳本透過 `asp-append-version` 正確快取。

## Documentation
### Official References
- [ASP.NET Core MVC 概觀](https://learn.microsoft.com/aspnet/core/mvc/overview)
- [Razor 視圖中的標籤協助程式](https://learn.microsoft.com/aspnet/core/mvc/views/tag-helpers/intro)
- [ASP.NET Core 中的視圖元件](https://learn.microsoft.com/aspnet/core/mvc/views/view-components)

### Internal References
- [MVC 程式碼風格與命名規範](reference/coding-style.md)
- [MVC 反模式與最佳實踐](reference/anti-patterns.md)
- [MVC 現代開發模式指南](reference/patterns.md)
