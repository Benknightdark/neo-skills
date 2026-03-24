---
name: dotnet-webapi
version: "1.0.0"
category: "Framework"
description: "開發 ASP.NET Core Web API (Controller-based) 的專家指引。支援從 .NET 6 (LTS) 到 .NET 10 (LTS) 的現代開發模式，涵蓋控制器設計、Problem Details、全域異常處理與 API 版本控制。"
compatibility: "Supports .NET 6.0 through 10.0 environments. Requires .NET SDK installed locally."
---

# .NET Web API 專家技能

## Trigger On
- 使用者要求建立、除錯、重構或審查 ASP.NET Core Web API。
- 專案包含 `Controllers` 目錄且繼承自 `ControllerBase`。
- 目標框架為 .NET 6.0 (LTS) 及以上版本。
- 需要進行 API 代碼現代化（如從 Middleware 異常處理遷移至 .NET 8+ 的 `IExceptionHandler`）。

## Workflow
1. **Perceive (架構感知):**
   - 檢查 `.csproj` 識別 `TargetFramework`。
   - 分析專案結構，確認是否採用分層架構 (N-Tier) 或垂直切片 (Vertical Slice)。
   - 識別現有的跨切點關注點處理方式（過濾器、中介軟體）。
2. **Reason (規劃階段):**
   - 評估是否需要引入「問題詳情 (Problem Details)」標準。
   - 決定是否使用 .NET 8+ 的全域異常處理機制。
   - 根據專案規模選擇合適的版本控制策略。
3. **Act (執行階段):**
   - 編寫符合 `[ApiController]` 規範的高品質控制器。
   - 實作強型別與不可變的 DTO (優先使用 `record`)。
   - 整合依賴注入，優先使用 Primary Constructors (C# 12+)。
4. **Validate (規範驗證):**
   - 驗證 Action 回傳型別是否符合 `ActionResult<T>` 規範。
   - 檢查 NRT (Nullable Reference Types) 安全性。
   - 確保非同步操作正確傳遞了 `CancellationToken`。

## Feature Roadmap (.NET 6 - 10)

### .NET 6 & 7 (Foundation)
- **Controllers Architecture**: 傳統的控制器模式與特性路由。
- **Problem Details**: 統一錯誤回應標準。
- **Output Caching**: 伺服器端高效能緩存。
- **Nullable Reference Types**: 全面的空值安全支援。

### .NET 8 & 9 (Productivity)
- **IExceptionHandler**: 更優雅的中央異常處理。
- **Antiforgery**: Web API 內建防偽支援。
- **Keyed Services**: 更靈活的依賴注入選項。
- **HybridCache**: 多級緩存優化。

### .NET 10+ (Cutting Edge)
- **Extension Members for Controllers**: 擴充控制器基底功能。
- **Enhanced Serialization**: 針對大型 Payload 的 JSON 優化。

## Coding Standards
- **Strong Typing**: 優先使用 `ActionResult<T>` 以提升 Swagger 支援。
- **NRT Compliance**: 嚴格執行 Null 安全，減少運行時錯誤。
- **Async Best Practices**: 始終接受並傳遞 `CancellationToken`。
- **Naming**: 控制器名稱必須以 `Controller` 結尾，非同步方法必須以 `Async` 結尾。

## Deliver
- **Version-Optimized Web API Code**: 提供符合目標版本的現代化控制器與設定。
- **Architectural Insights**: 針對 N-Tier 或 Clean Architecture 提供重構建議。
- **Security Recommendations**: 提供關於 Problem Details 與異常處理的安全建議。

## Validate
- 確保代碼符合 C# 10+ 現代語法標準。
- 驗證端點正確回傳符合 RFC 7807 的錯誤格式。
- 確認代碼在受測環境下無資源洩漏（正確使用 `using` 與非同步）。

## Documentation
### Official References
- [ASP.NET Core Web API 概觀](https://learn.microsoft.com/aspnet/core/web-api/)
- [處理 Web API 中的錯誤 (Problem Details)](https://learn.microsoft.com/aspnet/core/web-api/handle-errors)
- [控制器中的動作回傳類型](https://learn.microsoft.com/aspnet/core/web-api/action-return-types)

### Internal References
- [Web API 程式碼風格與命名規範](reference/coding-style.md)
- [Web API 反模式與最佳實踐](reference/anti-patterns.md)
- [Web API 現代開發模式指南](reference/patterns.md)
