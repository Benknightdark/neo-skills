# .NET Web API 程式碼風格與命名規範 (Coding Conventions)

本指南基於 ASP.NET Core Web API 的產業標準，旨在提升控制器模式下 API 的組織與維護效率。

## 1. 控制器 (Controllers)

### 1.1 命名與屬性
- **PascalCase**：所有控制器類別必須使用 `PascalCase` 並以 `Controller` 結尾（如 `UsersController`）。
- **[ApiController]**：所有 API 控制器必須標記 `[ApiController]` 特性，以啟用自動模型驗證、推斷參數綁定源及 `ProblemDetails` 回應。
- **[Route]**：建議使用 `[Route("api/[controller]")]` 或顯式版本路徑（如 `[Route("api/v1/users")]`）。

### 1.2 動作方法 (Action Methods)
- **語意化命名**：方法名稱應反映業務意圖（如 `GetUserAsync`），且非同步方法必須以 `Async` 結尾。
- **HTTP 動詞**：明確使用 `[HttpGet]`, `[HttpPost]`, `[HttpPut]`, `[HttpDelete]` 或 `[HttpPatch]`。

---

## 2. 數據傳輸 (Data Transfer)

- **DTO 命名**：使用 `Request` 或 `Response` 作為字尾（如 `UserCreateRequest`, `UserSummaryResponse`）。
- **Record 類型**：對於唯讀的資料傳輸物件，優先使用 `record` 類型。

---

## 3. 回應處理 (Response Handling)

- **ActionResult<T>**：方法應回傳 `Task<ActionResult<T>>`，這比 `IActionResult` 具備更好的型別安全性與 Swagger 支持。
- **標準回應方法**：
  - `Ok(data)` (200)
  - `CreatedAtAction(...)` (201)
  - `NoContent()` (204)
  - `BadRequest(ModelState)` (400)
  - `NotFound()` (404)

---

## 4. 依賴注入與服務 (DI & Services)

- **建構函式注入**：一律使用建構函式注入服務（優先考慮使用 C# 12+ 的 Primary Constructors）。
- **介面導向**：注入介面而非具體類別，以利單元測試。

---

## 5. 檔案與命名空間

- **垂直切片 (Vertical Slicing)**：對於大型專案，建議按功能領域（Feature）組織資料夾，而非傳統的 Controllers/Models/Services 分層。
- **File-scoped Namespace**：一律使用 File-scoped Namespace (C# 10+)。
