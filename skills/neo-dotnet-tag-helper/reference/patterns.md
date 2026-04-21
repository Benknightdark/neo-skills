# .NET Tag Helper Coding Conventions

This guide defines the standards for developing high-quality, reusable C# Tag Helpers in .NET 6+.

## 1. Naming and Attributes

### 1.1 Class Naming
- **TagHelper Suffix**: All Tag Helper classes must end with `TagHelper` (e.g., `MarkdownTagHelper.cs`).
- **Namespace**: Place Tag Helpers in a `TagHelpers` namespace or a feature-specific sub-namespace.

### 1.2 Attribute Mapping
- **PascalCase to kebab-case**: C# properties (e.g., `IsActive`) automatically map to HTML attributes (e.g., `is-active`).
- **Explicit Naming**: Use `[HtmlAttributeName("your-name")]` if the automatic mapping is insufficient or needs to avoid conflicts.

---

## 2. Implementation Patterns

### 2.1 Use TagBuilder
- **Standard**: Always use `Microsoft.AspNetCore.Mvc.Rendering.TagBuilder` to generate HTML elements.
- **Advantage**: It handles attribute encoding and provides a fluent API for building complex structures.

### 2.2 Lifecycle Methods
- **Synchronous (`Process`)**: Use when the output depends only on properties and does not involve I/O.
- **Asynchronous (`ProcessAsync`)**: Use when calling database services, external APIs, or reading from the file system.

### 2.3 Dependency Injection
- **Constructor Injection**: Inject services (e.g., `IUrlHelperFactory`, `LinkGenerator`) via the constructor.
- **Thread Safety**: Ensure injected services are thread-safe or that the Tag Helper is registered as transient/scoped appropriately.

---

## 3. UI Composition

### 3.1 Content Management
- **SetHtmlContent**: Use `output.Content.SetHtmlContent()` to replace the tag's inner content.
- **AppendHtml**: Use `output.Content.AppendHtml()` to add to existing content.
- **Wrap Content**: Use `output.PreContent` and `output.PostContent` to wrap the original inner content.

### 3.2 Tag Mode
- **TagMode.StartTagAndEndTag**: Standard for most UI components.
- **TagMode.SelfClosing**: For tags like `<img />` or custom leaf nodes.

---

## 4. ViewContext Access

- Use the `[ViewContext]` and `[HtmlAttributeNotBound]` attributes to access the current `ViewContext`.
```csharp
[ViewContext]
[HtmlAttributeNotBound]
public ViewContext ViewContext { get; set; }
```
- This is essential for generating context-aware URLs or accessing `HttpContext`.
