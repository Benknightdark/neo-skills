# .NET MVC Coding Conventions

This guide aims to improve the structural degree of ASP.NET Core MVC applications and optimize the development efficiency of Razor views and controllers.

## 1. ViewModels

### 1.1 Naming and Roles
- **ViewModel Suffix**: All data models designed specifically for views must end with `ViewModel` (e.g., `UserLoginViewModel`).
- **Strict Separation**: **Prohibited** to pass database entities directly to views. View models should only contain data required by the view.

### 1.2 Data Annotations
- **Validation Attributes**: Use attributes like `[Required]`, `[StringLength]`, `[EmailAddress]` on ViewModels to declare validation rules.
- **Display Names**: Use `[Display(Name = "User Name")]` to ensure label consistency across different languages.

---

## 2. Views & Layouts

### 2.1 View Naming
- **PascalCase View Names**: View file names should match action methods and use `PascalCase` (e.g., `Index.cshtml`, `Edit.cshtml`).
- **Strongly Typed Views**: All views must declare a strong type using `@model` at the top.
- **Layout Management**: Make good use of `_ViewStart.cshtml` and `_Layout.cshtml` to unify styles. Use `@section` to handle scripts or styles specific to individual pages.

---

## 3. Tag Helpers

- **Prioritize Use**: Prioritize using Tag Helpers (e.g., `asp-for`, `asp-action`) over traditional HTML Helpers (e.g., `@Html.TextBoxFor`).
- **Custom Tags**: For repetitive UI logic (like pagination navigation, complex buttons), it is recommended to implement custom `TagHelper`s.

---

## 4. Controllers

- **Inherit Controller**: Inherit from `Microsoft.AspNetCore.Mvc.Controller` (instead of `ControllerBase`) to gain View-related support.
- **Action Returns**: Action methods should explicitly return `IActionResult` or `Task<IActionResult>`.

---

## 5. File Organization

- **Standard Structure**: Follow the standard directory structure of `Controllers/`, `Models/` (ViewModels), and `Views/`.
- **Partial Views**: Common view components should be placed in `Views/Shared/` and start with an underscore (e.g., `_UserCard.cshtml`).
