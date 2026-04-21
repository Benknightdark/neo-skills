# .NET Tag Helper Anti-Patterns & Best Practices

This document lists common mistakes in ASP.NET Core Tag Helper development and their corresponding correct practices.

## 1. Output Construction

### 1.1 Avoid String Concatenation for HTML
**Problem**: Manually building HTML strings (e.g., `$"<div class='{cssClass}'>"`).

- **Bad**: Susceptible to XSS and hard to maintain.
- **Good**: Use `TagBuilder` and its `Attributes` / `InnerHtml` methods for safe and structured generation.

---

## 2. Resource Management & Performance

### 2.1 Avoid Blocking Async Tasks
- **Problem**: Using `.Result` or `.Wait()` inside `Process`.
- **Bad**: Causes thread pool starvation.
- **Good**: Always override `ProcessAsync` and use `await` if any async calls are made.

### 2.2 Avoid Storing State in Fields
- **Problem**: Storing request-specific data in the Tag Helper's instance fields.
- **Bad**: Tag Helpers can be pooled and reused; state leakage between requests may occur.
- **Good**: Pass state through method parameters or use transient/scoped services.

---

## 3. Configuration & Registration

### 3.1 Avoid Forgetting `_ViewImports.cshtml`
- **Bad**: Forgetting to add `@addTagHelper *, MyAssembly` in `_ViewImports.cshtml`.
- **Good**: Ensure registration is correct so the runtime can identify custom tags.

---

## 4. Logical Design

### 4.1 Avoid Excessive Logic
- **Bad**: Writing complex business logic or database queries directly inside the Tag Helper.
- **Good**: Delegate business logic to services; use the Tag Helper only for UI/HTML construction.

### 4.2 Avoid Ignoring Null Values
- **Bad**: Assuming all properties will be set by the user.
- **Good**: Handle null or default values gracefully to prevent `NullReferenceException`.
