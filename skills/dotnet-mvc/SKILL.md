---
name: dotnet-mvc
version: "1.1.0"
category: "Web"
description: "開發使用 Razor 視圖的 ASP.NET Core MVC 應用程式的專家指引。涵蓋視圖模型 (ViewModel) 模式、標記協助程式 (Tag Helpers) 與視圖元件 (View Components)。"
compatibility: "Requires ASP.NET Core 2.1+, supports up to .NET 10.0."
---

# ASP.NET Core MVC

## Trigger On

- building web applications with server-side Razor Views
- maintaining existing MVC or Razor Pages projects
- implementing complex UI logic with View Components or Partial Views
- refactoring legacy MVC code (e.g., from ASP.NET MVC 5)
- organizing UI models using the ViewModel pattern

## Workflow

1. **Perceive (Perception Phase):**
   - Use `list_directory` to confirm the presence of `Controllers`, `Views`, and `Models` folders.
   - Use `grep_search` in `_ViewImports.cshtml` to identify active Tag Helpers.
   - Identify the Layout structure in `Views/Shared/_Layout.cshtml`.
   - Check if the project uses **Razor Pages** alongside MVC (`Pages` folder).
2. **Reason (Planning Phase):**
   - Decide if a change requires a new Controller action, a View Component, or just a Partial View.
   - Define ViewModels as `record` (.NET 6+) for immutability and clean code.
   - Produce an **MVC Implementation Plan** (in Traditional Chinese) covering Routes, ViewModels, and UI components.
3. **Act (Execution Phase):**
   - Implement "Thin Controllers" using **Primary Constructors** (.NET 8+) for dependency injection.
   - Create strongly-typed Razor Views using Tag Helpers.
   - Apply `[ValidateAntiForgeryToken]` to all state-changing POST actions.
   - Use Layout sections (`@section Scripts`) for page-specific assets.
4. **Validate (Validation Phase):**
   - Ensure `ModelState.IsValid` is checked and errors are displayed in the UI.
   - Verify that no business or database logic exists inside Razor Views.
   - Check that anti-forgery tokens are being generated and validated.
   - Confirm UI responsiveness and correct rendering of ViewModel data.

## Best Practices & Patterns

### Modern MVC Controller (.NET 8+)
```csharp
[Authorize]
public class ProductsController(IProductService service, ILogger<ProductsController> logger) : Controller
{
    [HttpGet]
    public async Task<IActionResult> Index()
    {
        var products = await service.GetAllAsync();
        var viewModel = products.Select(p => new ProductViewModel(p.Id, p.Name, p.Price));
        return View(viewModel);
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Create(CreateProductViewModel model)
    {
        if (!ModelState.IsValid) return View(model);
        
        await service.CreateAsync(model);
        return RedirectToAction(nameof(Index)); // Post-Redirect-Get (PRG)
    }
}
```

### Record-based ViewModels
```csharp
public record ProductViewModel(int Id, string Name, decimal Price);
public record CreateProductViewModel([Required] string Name, [Range(0, 1000)] decimal Price);
```

### View Components for Reusable UI
```csharp
// Use for dynamic parts like shopping carts or sidebars
public class CartSummaryViewComponent(ICartService cartService) : ViewComponent
{
    public async Task<IViewComponentResult> InvokeAsync()
    {
        var items = await cartService.GetItemsAsync();
        return View(items);
    }
}
```

## Documentation

- [MVC Overview](https://learn.microsoft.com/en-us/aspnet/core/mvc/overview?view=aspnetcore-10.0)
- [Razor Layouts](https://learn.microsoft.com/en-us/aspnet/core/mvc/views/layout?view=aspnetcore-10.0)

### References

- [patterns.md](reference/patterns.md) - ViewModel, Tag Helper, and UI composition patterns
- [anti-patterns.md](reference/anti-patterns.md) - common MVC mistakes to avoid

## Deliver

- **MVC Implementation Plan:** Summary of Controller actions, ViewModels, and View changes (in Traditional Chinese).
- **Clean MVC Code:** Thin controllers using modern C# features and strongly-typed models.
- **Secure Views:** Razor views with proper Tag Helper usage and anti-forgery protection.

## Validate

- Form validation works both client-side and server-side.
- State-changing actions are protected against CSRF.
- No direct domain entity exposure in views.
- Shared UI logic is correctly encapsulated in View Components or Partial Views.
