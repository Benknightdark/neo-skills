---
name: dotnet-minimal-apis
version: "1.0.0"
category: "Framework"
description: "開發高效能、輕量級 .NET Minimal API 的專家指引。支援從 .NET 6 (LTS) 到 .NET 10 (LTS) 的現代開發模式，涵蓋路由群組、端點過濾器與符合 OpenAPI 規範的強型別回應。"
compatibility: "Supports .NET 6.0 through 10.0 environments. Requires .NET SDK installed locally."
---

# .NET Minimal APIs 專家技能

## Trigger On
- 使用者要求建立、除錯、重構或審查 .NET Minimal APIs。
- 專案 `Program.cs` 包含 `WebApplication.CreateBuilder(args)` 且未配置 Controllers 目錄。
- 目標框架為 .NET 6.0 (LTS) 及以上版本。
- 需要優化 API 效能或簡化 Web API 架構。

## Workflow
1. **Perceive (架構感知):**
   - 檢查 `.csproj` 識別 `TargetFramework`。
   - 分析 `Program.cs` 以區分簡單端點還是採用了 Module-based 或 Vertical Slice 的組織方式。
   - 識別是否已配置 OpenAPI (Swagger) 支援。
2. **Reason (規劃階段):**
   - 評估是否需要引入「路由群組 (Route Groups)」來優化組織結構。
   - 決定是否使用「端點過濾器 (Endpoint Filters)」來處理跨切點關注點（如參數驗證）。
   - 根據 .NET 版本選擇最適語法（如 .NET 7+ 的 `TypedResults`）。
3. **Act (執行階段):**
   - 編寫乾淨、高效的 Minimal API 代碼，優先使用 Lambda 或擴充方法。
   - 實作強型別與 DTO (優先使用 `record`)。
   - 整合依賴注入，避免 Service Locator 模式。
4. **Validate (規範驗證):**
   - 驗證端點是否正確回傳預期的 HTTP 狀態碼。
   - 檢查 OpenAPI 文件生成是否完整。
   - 確保異步操作正確傳遞了 `CancellationToken`。

## Feature Roadmap (.NET 6 - 10)

### .NET 6 & 7 (Foundation)
- **Minimal Hosting**: 簡化啟動流程與頂層陳述式。
- **Route Groups**: 使用 `MapGroup` 整合前綴與認證。
- **Endpoint Filters**: 在 Minimal APIs 中實作攔截邏輯。
- **Typed Results**: 改善單元測試與 Swagger 支援。

### .NET 8 & 9 (Productivity)
- **Antiforgery**: 內建防偽標記支援。
- **Form Binding**: 支援 `[FromForm]` 參數綁定。
- **HybridCache**: 高效能的多級緩存支援。
- **OpenAPI Improvements**: 更好的 OpenAPI 代碼生成。

### .NET 10+ (Cutting Edge)
- **Native AOT Optimization**: 針對 Minimal APIs 的 AOT 最佳化編譯。
- **Enhanced Middleware Patterns**: 針對輕量級架構的新型中介軟體。

## Coding Standards
- **Clean Routing**: 優先使用擴充方法將路由模組化。
- **Strong Typing**: 優先使用 `TypedResults` 與 `Results<T1, T2>`。
- **Async Safety**: 始終接受並傳遞 `CancellationToken`。
- **DI Best Practices**: 服務應直接在 Handler 參數中定義。

## Deliver
- **Version-Optimized API Code**: 根據目標 .NET 版本提供最合適的現代化 API 代碼。
- **Modular Architecture**: 提供將 `Program.cs` 路由抽離至擴充方法的結構建議。
- **OpenAPI Configuration**: 提供完整的 Swagger/OpenAPI 配置建議。

## Validate
- 確保提供的代碼在 .NET 6+ 環境中可正確執行。
- 驗證端點安全性（認證、授權、Antiforgery）。
- 檢查代碼是否符合 Minimal APIs 的高效能最佳實踐（如避免閉包、減少分配）。

## Documentation
### Official References
- [.NET Minimal API 概觀](https://learn.microsoft.com/aspnet/core/fundamentals/minimal-apis)
- [路由群組與過濾器實作](https://learn.microsoft.com/aspnet/core/fundamentals/minimal-apis/route-handlers)
- [Minimal APIs 中的強型別回應 (TypedResults)](https://learn.microsoft.com/aspnet/core/fundamentals/minimal-apis/responses)

### Internal References
- [Minimal APIs 程式碼風格與命名規範](reference/coding-style.md)
- [Minimal APIs 反模式與最佳實踐](reference/anti-patterns.md)
- [Minimal APIs 現代開發模式指南](reference/patterns.md)
