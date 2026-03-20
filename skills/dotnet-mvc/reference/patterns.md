# ASP.NET Core MVC Best Practices & Patterns

## 1. The ViewModel Pattern

Always use ViewModels instead of Database Entities in your Views. This decouples the UI from the database and prevents "over-posting" vulnerabilities.

```csharp
public class UserViewModel
{
    public int Id { get; set; }
    public string DisplayName { get; set; }
    // Only UI-relevant properties
}
```

## 2. Strongly-Typed Views

Always define the `@model` in your Razor files to get IntelliSense and compile-time type checking.

```razor
@model UserViewModel
<h2>Welcome, @Model.DisplayName!</h2>
```

## 3. Tag Helpers over HTML Helpers

Modern ASP.NET Core MVC prefers Tag Helpers (e.g., `<a asp-controller="...">`) because they feel like standard HTML and are easier to read and maintain.

```html
<!-- Recommended: Tag Helper -->
<a asp-controller="Home" asp-action="Index">Home</a>

<!-- Older Style: HTML Helper -->
@Html.ActionLink("Home", "Index", "Home")
```

## 4. View Components for Reusable UI

For complex, self-contained UI logic (like a shopping cart summary or a dynamic menu), use **View Components** instead of Partial Views to keep the logic separate.

## 5. ModelState Validation

Always check `ModelState.IsValid` in your Controller actions before proceeding with business logic.

```csharp
[HttpPost]
[ValidateAntiForgeryToken]
public IActionResult Create(UserViewModel model)
{
    if (!ModelState.IsValid)
    {
        return View(model);
    }
    // Proceed with service logic
}
```
