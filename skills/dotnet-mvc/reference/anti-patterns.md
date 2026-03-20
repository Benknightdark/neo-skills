# ASP.NET Core MVC Anti-Patterns

Avoid these common pitfalls in MVC development.

## 1. Fat Controllers

Do not place business logic, data access, or complex calculations inside Controller actions. Controllers should only handle routing, Model Binding, and returning the correct View/Result.

## 2. Business Logic in Views

Keep your Razor Views as dumb as possible. Avoid using `@using` for database contexts or performing complex `if/else` logic that could be handled in the Controller or a Service.

## 3. Direct Use of Domain Models in Views

Never pass your Entity Framework or database models directly to a View. This creates tight coupling and risks exposing sensitive fields (like passwords or internal IDs) via "over-posting."

## 4. Manual HTML Generation in Controllers

Never return raw HTML strings from a Controller. Use Razor Views or `Content()` results for simple text only.

## 5. Missing CSRF Protection

Failing to use `[ValidateAntiForgeryToken]` on `POST` actions can leave your application vulnerable to Cross-Site Request Forgery (CSRF).

```csharp
// BAD: No CSRF protection
[HttpPost]
public IActionResult Update(ProfileViewModel model) { ... }

// GOOD: Anti-forgery validated
[HttpPost]
[ValidateAntiForgeryToken]
public IActionResult Update(ProfileViewModel model) { ... }
```

## 6. Over-reliance on ViewBag and ViewData

Avoid using dynamic properties like `ViewBag` or `ViewData` for passing data from Controller to View. They lack type safety and make the View harder to maintain. Prefer strongly-typed ViewModels.
