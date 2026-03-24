# .NET Minimal APIs 反模式與最佳實踐 (Anti-Patterns & Best Practices)

本文件列出 Minimal APIs 開發中常見的錯誤做法及其對應的正確實踐。

## 1. 路由與組織 (Routing & Organization)

### 1.1 避免肥大的 `Program.cs` (Fat Program.cs)
**問題**：將所有路由、DI 註冊與中介軟體通通塞在 `Program.cs`，導致維護困難。

- **錯誤**：在單一檔案中撰寫數百行 `app.MapGet`。
- **正確**：使用擴充方法將不同模組的路由拆分至獨立檔案。

### 1.2 避免忽視路由衝突
**問題**：Minimal APIs 路由匹配極其靈活，不當的參數定義可能導致路由衝突。

- **錯誤**：`/users/{id}` (int) 與 `/users/{name}` (string) 同時存在而未加約束。
- **正確**：使用路由約束，例如 `/users/{id:int}`。

---

## 2. 回應處理 (Response Handling)

### 2.1 避免過度使用匿名型別回應
**問題**：回傳 `Results.Ok(new { id = 1 })` 會使 Swagger 無法得知回應結構。

- **錯誤**：回傳匿名物件。
- **正確**：定義明確的 `DTO` 或 `Record`，並使用 `TypedResults`。

### 2.2 避免忽視 `TypedResults`
- **問題**：`Results.Ok()` 返回的是 `IResult`，在單元測試中需要轉型才能驗證內容。
- **正確**：使用 `TypedResults.Ok(data)`，它返回 `Ok<T>`，可直接測試 `Value` 屬性。

---

## 3. 效能與非同步 (Performance & Async)

### 3.1 避免同步阻塞 Handler
- **問題**：在 Lambda 中使用同步 API（如 `File.ReadAllText`）會阻塞 Thread Pool。
- **正確**：始終使用 `await` 與非同步版本（如 `File.ReadAllTextAsync`）。

### 3.2 忘記傳遞 `CancellationToken`
- **問題**：當使用者取消請求（關閉瀏覽器）時，後端仍繼續執行昂貴的查詢。
- **正確**：在 Handler 參數中加入 `CancellationToken ct` 並傳遞給資料庫或 HTTP 客戶端。

---

## 4. 依賴注入 (Dependency Injection)

### 4.1 避免從 `app.Services` 手動獲取服務 (Service Locator)
- **錯誤**：`var service = app.Services.GetRequiredService<IMyService>();`。
- **正確**：直接在 Handler 參數中宣告服務，由框架自動注入。

---

## 5. 文件化 (Documentation)

### 5.1 忽視標記回應狀態碼
- **問題**：Swagger 只顯示 `200 OK`，忽略了 `404 NotFound` 或 `400 BadRequest`。
- **正確**：使用 `.Produces<T>(StatusCodes.Status200OK)` 或直接回傳 `Results<T1, T2>`。
