# .NET Web API 反模式與最佳實踐 (Anti-Patterns & Best Practices)

本文件列出控制器式 Web API 開發中常見的錯誤做法及其對應的正確實踐。

## 1. 控制器組織 (Controller Organization)

### 1.1 避免過大的控制器 (Fat Controllers)
**問題**：在控制器動作中直接撰寫大量業務邏輯、資料庫存取或複雜驗證。

- **錯誤**：Action 超過 20 行，且包含直接操作 `DbContext` 的程式碼。
- **正確**：將業務邏輯封裝至 Service 層或使用 MediatR (CQRS 模式)，使 Action 僅負責協調請求與回應。

### 1.2 避免忽視 `[ApiController]` 特性
**問題**：遺漏此特性會導致模型驗證需要手動處理 `if (!ModelState.IsValid)`。

- **正確**：始終在 API 控制器上加上 `[ApiController]`。

---

## 2. 非同步與資源 (Async & Resources)

### 2.1 避免忽視 `CancellationToken`
- **問題**：在長時間運行的查詢中不傳遞取消權杖，當客戶端取消連線時，伺服器資源仍被無效佔用。
- **正確**：Action 參數應包含 `CancellationToken ct`，並將其傳遞給非同步資料庫操作或外部 HTTP 呼叫。

### 2.2 避免同步讀取請求主體
- **問題**：同步讀取 Body 會造成執行緒阻塞。
- **正確**：使用框架提供的非同步參數綁定。

---

## 3. 異常與安全性 (Security & Exceptions)

### 3.1 避免返回敏感的異常訊息
- **問題**：在生產環境將 `ex.StackTrace` 直接回傳給客戶端。
- **正確**：透過全域異常處理轉化為 `ProblemDetails`，僅記錄詳細日誌於後端，回傳標準錯誤格式給前端。

### 3.2 避免過度暴露實體模型 (Domain Models)
- **問題**：直接將資料庫實體物件當作回應回傳，可能洩漏敏感欄位（如密碼 Hash）或導致循環引用。
- **正確**：建立專屬的 `Response DTO`，並使用 AutoMapper 或手動對應。

---

## 4. 文件化 (Documentation)

### 4.1 忽視狀態碼定義
- **問題**：Swagger UI 只顯示 `200`，使前端開發者難以得知其他錯誤情況。
- **正確**：使用 `[ProducesResponseType(StatusCodes.Status404NotFound)]` 等標記。
