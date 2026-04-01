# .NET MVC Modern Patterns

This document introduces recommended development patterns in the ASP.NET Core MVC mode for .NET 6 to 10+.

## 1. UI Modularization

### 1.1 View Components
**Recommendation**: For complex and reusable UI blocks (like navigation menus, shopping cart summaries), use `ViewComponent`s instead of `Partial View`s.
```csharp
public class ShoppingCartViewComponent : ViewComponent
{
    public async Task<IViewComponentResult> InvokeAsync() => View(await _service.GetItems());
}
```

### 1.2 Tag Helper Componentization
**Recommendation**: Implement `TagHelper`s to encapsulate complex HTML generation logic, making Razor views more declarative.

---

## 2. Data Flow and Validation

### 2.1 Remote Validation
**Recommendation**: Use the `[Remote]` attribute to implement real-time client-side validation (like checking if an account already exists), improving user experience.

### 2.2 Antiforgery
**Recommendation**: Ensure forms use `asp-antiforgery="true"`. In .NET 8+ global configuration is more straightforward.

---

## 3. Performance Optimization

### 3.1 Cache Tag Helper
**Recommendation**: Use `<cache>` or `<distributed-cache>` tags for view fragments that don't need frequent updates.
```html
<cache expires-after="@TimeSpan.FromMinutes(10)">
    @await Component.InvokeAsync("TopNews")
</cache>
```

### 3.2 Response Compression and Static Resources
**Recommendation**: Configure response compression middleware and use `asp-append-version="true"` to ensure browser caches invalidate upon resource updates.

---

## 4. Architectural Evolution

### 4.1 Vertical Slice Architecture
**Recommendation**: For large MVC applications, consider placing Controllers, ViewModels, and Views in feature directories (e.g., `Features/Orders/`), utilizing `Area`s or a custom `ViewLocationExpander`.

---

## 5. C# 14+ Forward-looking Patterns

### 5.1 Extension Types for IHtmlHelper
**Recommendation**: Leverage C# 14's Extension Types to add domain-specific rendering methods to `IHtmlHelper`, not just static extension methods.
