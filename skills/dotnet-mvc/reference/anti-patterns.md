# .NET MVC Anti-Patterns & Best Practices

This document lists common mistakes in ASP.NET Core MVC development and their corresponding correct practices.

## 1. Views and Data Transfer (Views & Data)

### 1.1 Avoid Writing Too Much Logic in Views
**Problem**: Using massive amounts of `if`, `switch`, or `foreach` for complex calculations in `.cshtml` files.

- **Bad**: Views containing database queries or complex business rules.
- **Good**: All pre-display processing should be done in the Controller or ViewModel; the view should only be responsible for rendering.

### 1.2 Avoid Overusing `ViewData` or `ViewBag`
**Problem**: `ViewData/ViewBag` are dynamic and lack type safety, which easily leads to runtime errors.

- **Bad**: Relying on string keys to pass large amounts of data.
- **Good**: Always create strongly-typed `ViewModel`s and use the `@model` directive.

---

## 2. Resource Management & Performance

### 2.1 Avoid Ignoring Static File Caching
- **Problem**: Redownloading the same CSS/JS every time the page is refreshed.
- **Good**: Correctly configure Cache-Control Headers in `app.UseStaticFiles()`.

### 2.2 Avoid Calling `@Html.Action` in Loops (Legacy Style)
- **Problem**: In .NET Core and later, mechanisms that trigger full sub-requests frequently should be avoided.
- **Good**: Switch to `ViewComponent`s to achieve higher execution efficiency.

---

## 3. Security

### 3.1 Avoid Disabling Antiforgery Validation
- **Bad**: Marking `[IgnoreAntiforgeryToken]` on POST actions to save effort.
- **Good**: Enable Antiforgery token validation globally and ensure all forms contain the Hidden Token.

### 3.2 Avoid Directly Returning HTML Strings
- **Problem**: Returning HTML code directly from the Controller.
- **Good**: Always use Razor views to let the system automatically handle HTML escaping, preventing XSS attacks.

---

## 4. Development Practices

### 4.1 Avoid Ignoring Model Validation State
- **Bad**: Processing data directly in POST actions without checking `if (!ModelState.IsValid)`.
- **Good**: Check the validation state first. If it fails, redirect back to the form page and display error messages.
