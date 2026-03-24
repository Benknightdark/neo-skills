# .NET MVC 現代開發模式 (Modern Patterns)

本文件介紹 .NET 6 至 10+ 在 ASP.NET Core MVC 模式下的推薦開發模式。

## 1. UI 模組化

### 1.1 視圖元件 (View Components)
**推薦做法**：對於邏輯複雜且可重用的 UI 區塊（如導覽選單、購物車摘要），使用 `ViewComponent` 代替 `Partial View`。
```csharp
public class ShoppingCartViewComponent : ViewComponent
{
    public async Task<IViewComponentResult> InvokeAsync() => View(await _service.GetItems());
}
```

### 1.2 標記協助程式組件化
**推薦做法**：實作 `TagHelper` 來封裝複雜的 HTML 生成邏輯，使 Razor 視圖更具聲明性。

---

## 2. 數據流與驗證

### 2.1 遠端驗證 (Remote Validation)
**推薦做法**：使用 `[Remote]` 特性來實作即時的用戶端驗證（如檢查帳號是否已存在），提升使用者體驗。

### 2.2 抗掃描與安全性 (Antiforgery)
**推薦做法**：確保表單使用 `asp-antiforgery="true"`。在 .NET 8+ 中，全局配置更加簡便。

---

## 3. 效能優化

### 3.1 快取標籤協助程式 (Cache Tag Helper)
**推薦做法**：對不需要頻繁更新的視圖片段使用 `<cache>` 或 `<distributed-cache>` 標籤。
```html
<cache expires-after="@TimeSpan.FromMinutes(10)">
    @await Component.InvokeAsync("TopNews")
</cache>
```

### 3.2 回應壓縮與靜態資源
**推薦做法**：配置回應壓縮中介軟體，並使用 `asp-append-version="true"` 確保瀏覽器緩存能隨資源更新失效。

---

## 4. 架構演進

### 4.1 垂直切片架構 (Vertical Slice Architecture)
**推薦做法**：對於大型 MVC 應用程式，考慮將 Controller、ViewModel 與 Views 放置在功能目錄中（例如 `Features/Orders/`），利用 `Area` 或自定義 `ViewLocationExpander`。

---

## 5. C# 14+ 前瞻模式

### 5.1 擴充型別為 HTML Helper 增加輔助方法
**推薦做法**：利用 C# 14 的 Extension Types 為 `IHtmlHelper` 擴充特定領域的渲染方法，而不僅僅是靜態擴充方法。
