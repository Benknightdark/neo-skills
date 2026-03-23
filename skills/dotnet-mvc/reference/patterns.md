# ASP.NET Core MVC Patterns

## 1. The ViewModel Pattern

Always use **ViewModels** instead of **Domain Entities** in your Views. This decouples the UI from the database and prevents "over-posting" vulnerabilities.

```csharp
public class UserViewModel
{
    public int Id { get; set; }
    public string DisplayName { get; set; }
    public string Email { get; set; }
    // Only UI-relevant properties, no navigation properties
}
```

## 2. Strongly-Typed Views

Always define the `@model` in your Razor files to get IntelliSense and compile-time type checking.

```razor
@model UserViewModel

<h2>Welcome, @Model.DisplayName!</h2>
<p>Email: @Model.Email</p>
```

## 3. Tag Helpers & Form Patterns

Modern ASP.NET Core MVC prefers **Tag Helpers** over **HTML Helpers**.

```html
<!-- Tag Helper (Recommended) -->
<div class="form-group">
    <label asp-for="Username"></label>
    <input asp-for="Username" class="form-control" />
    <span asp-validation-for="Username" class="text-danger"></span>
</div>

<!-- Older HTML Helper Style (Avoid) -->
<div class="form-group">
    @Html.LabelFor(m => m.Username)
    @Html.TextBoxFor(m => m.Username, new { @class = "form-control" })
    @Html.ValidationMessageFor(m => m.Username, "", new { @class = "text-danger" })
</div>
```

## 4. Reusable UI Composition

### View Components
For complex, self-contained UI logic (e.g., shopping carts, dynamic menus).

```csharp
// View Component Class
public class CartSummaryViewComponent(ICartService cartService) : ViewComponent
{
    public async Task<IViewComponentResult> InvokeAsync()
    {
        var items = await cartService.GetItemsAsync();
        return View(items);
    }
}

// In Layout or View
@await Component.InvokeAsync("CartSummary")
```

### Partial Views
For simple, reusable HTML fragments that don't require independent logic.

```razor
@await Html.PartialAsync("_ProductCard", product)
```

## 5. Layout & Content Organization

### Layout Sections
Use sections to inject scripts or styles only when needed by specific views.

```razor
<!-- _Layout.cshtml -->
<head>
    @RenderSection("Styles", required: false)
</head>
<body>
    @RenderBody()
    @RenderSection("Scripts", required: false)
</body>

<!-- View.cshtml -->
@section Scripts {
    <script src="~/js/custom.js"></script>
}
```

## 6. Controller & Validation Patterns

### Post-Redirect-Get (PRG) Pattern
Always redirect after a successful POST to prevent duplicate form submissions.

```csharp
[HttpPost]
[ValidateAntiForgeryToken]
public async Task<IActionResult> Create(ProductViewModel model)
{
    if (!ModelState.IsValid) return View(model);
    
    await _service.CreateAsync(model);
    return RedirectToAction(nameof(Index)); // PRG
}
```

### Model Validation (Remote)
Use the `[Remote]` attribute for client-side validation that requires server checks (e.g., username availability).

```csharp
public class UserViewModel
{
    [Remote(action: "IsUsernameAvailable", controller: "Users")]
    public string Username { get; set; }
}
```
