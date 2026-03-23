---
name: dotnet-mvc
version: "1.0.0"
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

## Documentation

- [MVC Overview](https://learn.microsoft.com/en-us/aspnet/core/mvc/overview?view=aspnetcore-10.0)
- [Razor Views](https://learn.microsoft.com/en-us/aspnet/core/mvc/views/overview?view=aspnetcore-10.0)
- [Tag Helpers](https://learn.microsoft.com/en-us/aspnet/core/mvc/views/tag-helpers/intro?view=aspnetcore-10.0)
- [View Components](https://learn.microsoft.com/en-us/aspnet/core/mvc/views/view-components?view=aspnetcore-10.0)
- [Model Validation](https://learn.microsoft.com/en-us/aspnet/core/mvc/models/validation?view=aspnetcore-10.0)

### References

- [patterns.md](reference/patterns.md) - detailed ViewModel, Tag Helper, and UI composition patterns
- [anti-patterns.md](reference/anti-patterns.md) - common MVC mistakes like fat controllers and business logic in views

## Workflow

1. **Analyze Project Context**: Identify the target .NET version and check if it's a new or existing MVC project.
2. **Define ViewModels**: Create strongly-typed models for each view to decouple the UI from domain entities.
3. **Implement Controllers**: Handle requests, validate `ModelState`, and return appropriate `IActionResult`.
4. **Design Razor Views**: Use Tag Helpers for form elements and layout sections for modularity.
5. **Optimize UI Components**: Move repetitive or complex UI logic into View Components or Partial Views.
6. **Ensure Security**: Apply `[ValidateAntiForgeryToken]` and ensure proper input encoding.

## Basic Patterns

### ViewModel Pattern
```csharp
public record ProductViewModel(
    int Id,
    string DisplayName,
    string PriceFormatted,
    bool IsInStock);
```

### Strongly-Typed Views
```razor
@model ProductViewModel

<h2>@Model.DisplayName</h2>
<p>Price: @Model.PriceFormatted</p>

@if (Model.IsInStock)
{
    <span class="badge badge-success">Available</span>
}
```

### Tag Helpers
```html
<form asp-controller="Products" asp-action="Create" method="post">
    <div class="form-group">
        <label asp-for="Name"></label>
        <input asp-for="Name" class="form-control" />
        <span asp-validation-for="Name" class="text-danger"></span>
    </div>
    <button type="submit" class="btn btn-primary">Create</button>
</form>
```

### ModelState Validation
```csharp
[HttpPost]
[ValidateAntiForgeryToken]
public async Task<IActionResult> Create(ProductViewModel model)
{
    if (!ModelState.IsValid)
    {
        return View(model);
    }

    await _service.CreateAsync(model);
    return RedirectToAction(nameof(Index));
}
```

## Anti-Patterns to Avoid

| Anti-Pattern | Why It's Bad | Better Approach |
|--------------|--------------|-----------------|
| Fat Controllers | Hard to maintain | Use Service Layer |
| Logic in Views | Hard to test | Use ViewModels/Components |
| Direct Entity Use | Over-posting risk | Use ViewModels |
| ViewBag/ViewData | No type safety | Use Strongly-typed models |
| Missing CSRF | Security vulnerability | Use `[ValidateAntiForgeryToken]` |
| Manual HTML in Code | Breaks separation | Use Razor Views/Tag Helpers |

## Deliver

- clean, organized MVC Controllers
- strongly-typed ViewModels for all views
- modular Razor Views utilizing Tag Helpers
- reusable UI components (View Components/Partial Views)
- secure forms with Anti-Forgery protection

## Validate

- `ModelState.IsValid` is checked before performing actions
- `[ValidateAntiForgeryToken]` is present on all POST actions
- Views are free of database access or complex business logic
- UI renders correctly with expected data from ViewModels
- Navigation and routing match requirements
