# .NET Web API 現代開發模式 (Modern Patterns)

本文件介紹 .NET 6 至 10+ 在控制器模式 (Controller-based) 下的推薦開發模式。

## 1. 錯誤處理與回應格式

### 1.1 Problem Details (RFC 7807)
**推薦做法**：統一使用 `ProblemDetails` 處理錯誤回應。在 .NET 7+ 中，可在 `Program.cs` 呼叫 `builder.Services.AddProblemDetails()`。

### 1.2 全域異常處理器 (IExceptionHandler) - .NET 8+
**推薦做法**：實作 `IExceptionHandler` 介面來集中處理未捕獲的異常，取代舊式的 Middleware 方式。

---

## 2. 參數綁定與驗證

### 2.1 原始型別以外的綁定 (Complex Type Binding)
**推薦做法**：善用 `[FromRoute]`, `[FromQuery]`, `[FromBody]` 與 `[FromHeader]` 顯式定義綁定源。

### 2.2 FluentValidation 整合
**推薦做法**：結合 `FluentValidation` 進行複雜的模型驗證，將驗證邏輯與 DTO 定義分離。

---

## 3. 架構設計

### 3.1 API 版本控制 (Asp.Versioning.Http)
**推薦做法**：使用官方版本控制套件，透過 URL 或 Header 支援多版本並存。
```csharp
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/[controller]")]
```

### 3.2 動作過濾器 (Action Filters)
**推薦做法**：對於橫切關注點（如權限校驗、日誌），實作 `IAsyncActionFilter`。

---

## 4. 文件化與效能

### 4.1 Swagger/OpenAPI 豐富化
**推薦做法**：使用 `[ProducesResponseType]` 標記所有可能的 HTTP 狀態碼與回應型別。

### 4.2 輸出快取 (Output Caching) - .NET 7+
**推薦做法**：使用 `builder.Services.AddOutputCache()` 提供伺服器端的高效能緩存，減少控制器處理壓力。

---

## 5. C# 14+ 前瞻模式

### 5.1 Extension Types 為控制器增加輔助功能
**推薦做法**：利用 Extension Types 為基底 `ControllerBase` 擴充常用的輔助屬性或方法。
