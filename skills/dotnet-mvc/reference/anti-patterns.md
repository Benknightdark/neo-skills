# .NET MVC 反模式與最佳實踐 (Anti-Patterns & Best Practices)

本文件列出 ASP.NET Core MVC 開發中常見的錯誤做法及其對應的正確實踐。

## 1. 視圖與資料傳遞 (Views & Data)

### 1.1 避免在視圖中撰寫過多邏輯
**問題**：在 `.cshtml` 檔案中使用大量的 `if`, `switch` 或 `foreach` 進行複雜運算。

- **錯誤**：視圖內包含資料庫查詢或複雜的業務規則。
- **正確**：所有顯示前的處理應在 Controller 或 ViewModel 中完成，視圖應僅負責渲染。

### 1.2 避免過度使用 `ViewData` 或 `ViewBag`
**問題**：`ViewData/ViewBag` 是動態的且不具備型別安全性，易導致運行時錯誤。

- **錯誤**：依賴字串鍵值來傳遞大量資料。
- **正確**：始終建立強型別的 `ViewModel` 並使用 `@model` 指令。

---

## 2. 資源管理與效能 (Resources & Performance)

### 2.1 避免忽視靜態檔案快取
- **問題**：每次重新整理頁面都要重新下載相同的 CSS/JS。
- **正確**：在 `app.UseStaticFiles()` 中正確配置 Cache-Control Header。

### 2.2 避免在循環中調用 `@Html.Action` (Legacy Style)
- **問題**：在 .NET Core 之後應避免頻繁調用引發完整子請求的機制。
- **正確**：改用 `ViewComponent` 以獲得更高的執行效率。

---

## 3. 安全性 (Security)

### 3.1 避免關閉抗防偽驗證 (Antiforgery)
- **錯誤**：為了省事在 POST 動作上標記 `[IgnoreAntiforgeryToken]`。
- **正確**：全域啟用防偽標記驗證，並確保所有表單包含 Hidden Token。

### 3.2 避免直接回傳 HTML 字串
- **問題**：直接從 Controller 返回 HTML 代碼。
- **正確**：應始終使用 Razor 視圖，讓系統自動處理 HTML 逸脫，預防 XSS 攻擊。

---

## 4. 開發實踐

### 4.1 避免忽視模型驗證狀態
- **錯誤**：在 POST 動作中不檢查 `if (!ModelState.IsValid)` 直接處理資料。
- **正確**：先檢查驗證狀態，若失敗則重新導向回表單頁面並顯示錯誤訊息。
