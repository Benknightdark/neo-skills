# ASP.NET Core MVC Anti-Patterns

## 1. Structural & Architectural Anti-Patterns

### Fat Controllers
Putting business logic, data access, or complex calculations inside Controller actions.

**Problem**: Controllers become difficult to test and maintain, violating the Single Responsibility Principle.

```csharp
// BAD: Logic in Controller
[HttpPost]
public async Task<IActionResult> Create(ProductViewModel model)
{
    var product = new Product { Name = model.Name, Price = model.Price };
    _context.Products.Add(product);
    await _context.SaveChangesAsync();
    return RedirectToAction(nameof(Index));
}
```

**Solution**: Delegate to a Service layer.

```csharp
// GOOD: Delegate to service
[HttpPost]
public async Task<IActionResult> Create(ProductViewModel model)
{
    if (!ModelState.IsValid) return View(model);
    await _productService.CreateAsync(model);
    return RedirectToAction(nameof(Index));
}
```

### Business Logic in Views
Performing database queries or complex logic inside Razor Views.

**Problem**: Makes Views hard to debug and test. Razor should only be used for UI logic.

```razor
// BAD: Logic in View
@using App.Data
@inject AppDbContext Context
@{
    var products = Context.Products.Where(p => p.Price > 100).ToList();
}
<ul>
    @foreach(var p in products) { <li>@p.Name</li> }
</ul>
```

**Solution**: Prepare data in the Controller and pass it via a ViewModel.

```razor
// GOOD: Strongly-typed data in ViewModel
@model IEnumerable<ProductViewModel>
<ul>
    @foreach(var p in Model) { <li>@p.Name</li> }
</ul>
```

## 2. Model & Security Anti-Patterns

### Direct Use of Domain Models in Views
Passing Entity Framework entities directly to a View.

**Problem**: This creates tight coupling and exposes internal database structures. It also risks "over-posting" vulnerabilities.

```csharp
// BAD: Direct domain model exposure
public IActionResult Edit(int id)
{
    var user = _context.Users.Find(id);
    return View(user); // Exposes password hash, internal IDs, etc.
}
```

**Solution**: Use dedicated ViewModels.

```csharp
// GOOD: ViewModel usage
public IActionResult Edit(int id)
{
    var user = _service.GetById(id);
    return View(new UserEditViewModel(user));
}
```

### Missing CSRF Protection
Failing to use `[ValidateAntiForgeryToken]` on `POST` actions.

**Problem**: Leaves the application vulnerable to Cross-Site Request Forgery (CSRF).

```csharp
// BAD: No CSRF protection
[HttpPost]
public IActionResult Update(ProfileViewModel model) { ... }
```

**Solution**: Always validate anti-forgery tokens on state-changing requests.

```csharp
// GOOD: Anti-forgery validated
[HttpPost]
[ValidateAntiForgeryToken]
public IActionResult Update(ProfileViewModel model) { ... }
```

## 3. UI Implementation Anti-Patterns

### Over-reliance on ViewBag and ViewData
Using dynamic properties for passing data from Controller to View.

**Problem**: Lacks type safety and compile-time checking, making the application prone to runtime errors.

```csharp
// BAD: Dynamic properties
public IActionResult Index()
{
    ViewBag.Title = "Products";
    ViewData["Count"] = 10;
    return View();
}
```

**Solution**: Prefer strongly-typed ViewModels.

```csharp
// GOOD: Strongly-typed ViewModel
public class IndexViewModel { public string Title { get; set; } public int Count { get; set; } }

public IActionResult Index()
{
    return View(new IndexViewModel { Title = "Products", Count = 10 });
}
```

### Manual HTML Generation in Controllers
Returning raw HTML strings from a Controller action.

**Problem**: Breaks the separation of concerns and makes UI changes harder to manage.

```csharp
// BAD: Raw HTML in Controller
public IActionResult Error()
{
    return Content("<h1>An error occurred</h1>", "text/html");
}
```

**Solution**: Use Razor Views or Partial Views.

```csharp
// GOOD: Use a View
public IActionResult Error()
{
    return View();
}
```
