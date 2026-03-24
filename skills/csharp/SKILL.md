---
name: csharp
version: "1.4.0"
category: "Core"
description: "跨版本 C# 專家技能 (10, 11, 12, 13, 14+)。支援從 .NET 6 (LTS) 到 .NET 10 (LTS) 的現代開發模式，涵蓋 File-scoped namespaces 到 Extension Types 的全方位演進。"
compatibility: "Supports C# 10 through 14. Adaptive to .NET 6.0, 7.0, 8.0, 9.0, and 10.0 environments."
---

# Modern C# (10+) Expert Skill

## Trigger On
- 使用者要求編寫、除錯、重構或審查 C# 代碼。
- 專案目錄中包含 `*.cs`、`*.csproj` 或單一檔案 C# 腳本。
- 目標框架為 .NET 6.0 (LTS) 及以上版本。
- 需要進行代碼現代化（如將舊有的巢狀命名空間轉為 File-scoped namespaces）。

## Workflow
1. **Perceive (版本感知):**
   - 檢查 `.csproj` 識別 `TargetFramework` 以決定語法上限：
     - `net6.0`: C# 10 (File-scoped namespaces, Global usings).
     - `net7.0`: C# 11 (Raw string literals, Required members).
     - `net8.0`: C# 12 (Primary Constructors, Collection Expressions).
     - `net9.0`: C# 13 (`params` collections, `Lock` object).
     - `net10.0`: C# 14 (Extension members, `field` keyword).
2. **Reason (規劃階段):**
   - 評估當前代碼的現代化程度，決定重構策略。
   - 在低版本環境（如 .NET 6）中，避免使用高版本語法（如 Primary Constructors），但應優先使用 File-scoped namespaces。
   - 在高版本環境中，積極導入新特性以減少樣板代碼。
3. **Act (執行階段):**
   - 編寫高品質代碼，優先使用「語法糖」提升可讀性。
   - 實作強型別與不可變數據結構（`record`, `record struct`）。
   - 運用 **Interpolated string handlers** 與 **Span<T>** 優化效能敏感路徑。
4. **Validate (規範驗證):**
   - 驗證 NRT (Nullable Reference Types) 的安全性。
   - 檢查非同步操作是否正確處理取消權杖 (`CancellationToken`)。
   - 確保命名規範符合 .NET 官方建議。

## Feature Roadmap (C# 10 - 14)

### C# 10 & 11 (Foundation)
- **File-scoped Namespaces:** 減少縮排層次。
- **Global Using Directives:** 集中管理常用命名空間。
- **Raw String Literals:** `"""..."""` 輕鬆處理多行與特殊字元。
- **Required Members:** 確保物件初始化時必填屬性。
- **List Patterns:** `if (list is [1, 2, ..])` 強大的集合比對。

### C# 12 & 13 (Productivity)
- **Primary Constructors:** 類別層級的依賴注入簡化。
- **Collection Expressions:** 統一使用 `[1, 2, 3]` 初始化集合。
- **`params` Collections:** 方法參數支援多種集合類型。
- **Implicit Span Conversion:** 更自然地處理記憶體安全代碼。

### C# 14+ (Cutting Edge)
- **Extension Members:** 擴充屬性、運算子與靜態成員。
- **`field` Keyword:** 屬性邏輯中直接存取後備欄位。
- **Null-conditional Assignment:** `target?.Property = value;`。
- **Scripting:** 支援 `dotnet run file.cs` 直接執行。

## Coding Standards
- **Clean Structure:** 優先使用 File-scoped namespaces。
- **Immutability:** 數據傳輸物件 (DTO) 優先使用 `record`。
- **Performance:** 在關鍵路徑使用 `Span<T>` 與 `ReadOnlySpan<char>`。
- **Async Safety:** 始終傳遞 `CancellationToken`，避免 `.Result` 或 `.Wait()`。


## Deliver
- **Version-Optimized Code:** 根據目標 C# 版本提供最合適的現代化語法代碼。
- **Modernization Insights:** 提供從舊版 C# 語法升級至新版特性的具體重構建議（例如：從巢狀命名空間改為 File-scoped namespaces）。
- **Syntax Explanations:** 清晰解釋所使用的 C# 新特性其背後的設計意圖與語法優勢。

## Validate
- 確保提供的代碼符合目標 C# 版本的語法規範。
- 驗證代碼是否遵循 C# 的強型別與 Null 安全（NRT）原則。
- 確認代碼在純 C# 語言層面具有良好的可讀性與最佳實踐（例如：適當使用 `Span<T>`、`record` 等）。

## Documentation
### Official References
- [C# 14 的新功能 (Extension Members, field keyword)](https://learn.microsoft.com/zh-tw/dotnet/csharp/whats-new/csharp-14)
- [C# 13 的新功能 (params collections, Lock object)](https://learn.microsoft.com/zh-tw/dotnet/csharp/whats-new/csharp-13)
- [C# 12 的新功能 (Primary Constructors, Collection Expressions)](https://learn.microsoft.com/zh-tw/dotnet/csharp/whats-new/csharp-12)
- [C# 11 的新功能 (Raw String Literals, Required Members)](https://learn.microsoft.com/zh-tw/dotnet/csharp/whats-new/csharp-version-history#c-version-11)
- [C# 10 的新功能 (File-scoped Namespaces, Global Usings)](https://learn.microsoft.com/zh-tw/dotnet/csharp/whats-new/csharp-version-history#c-version-10)
- [可為 Null 的引用類型 (Nullable Reference Types)](https://learn.microsoft.com/zh-tw/dotnet/csharp/nullable-references)

### Internal References
- [C# 程式碼風格與命名規範指南](reference/coding-style.md)
- [C# 反模式與最佳實踐](reference/anti-patterns.md)
- [C# 現代開發模式指南](reference/patterns.md)
