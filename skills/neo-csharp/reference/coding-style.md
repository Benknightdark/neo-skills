# C# Coding Conventions

This guide is based on Microsoft's official [C# Coding Conventions](https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/coding-style/coding-conventions) and [C# Naming Conventions](https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/concepts/coding-style/naming-conventions), aimed at improving development efficiency and maintaining project consistency.

## 1. Naming Conventions

Good naming is the core of self-documenting code and reduces communication overhead.

### 1.1 PascalCase
Used for **public members** and **type names**.
- **Class & Struct**: `public class OrderManager`
- **Interface**: Must start with a capital **`I`**, e.g., `public interface IRepository`
- **Property**: `public string FullName { get; set; }`
- **Method**: `public void ExecuteTask()`
- **Enum**: `public enum OrderStatus`

### 1.2 camelCase
Used for **internal, local, or private members**.
- **Local Variable**: `var totalCount = 0;`
- **Parameter**: `public void UpdateUser(int userId)`
- **Private Field**: **Must have an underscore prefix `_`**. This instantly distinguishes it as class state rather than a local variable or parameter.
  - Recommended: `private readonly ILogger _logger;`

---

## 2. File Organization

- **File name matching**: The file name must match the primary type name (e.g., `CustomerService.cs` should contain `class CustomerService`).
- **Single Responsibility**: In principle, **one file should define only one type** (Class, Interface, Enum) to facilitate version control and code search.
- **Namespace**:
  - Prioritize **File-scoped Namespace** (C# 10+) to reduce indentation levels:
    ```csharp
    namespace MyProject.Services; // Recommended (C# 10+)
    ```

---

## 3. Formatting

### 3.1 Allman Style (Braces on new line)
The opening brace `{` must be on its own line, aligned with the class, method, or control statement. This is the standard C# style.
```csharp
// Correct approach
public void Process()
{
    if (isReady)
    {
        DoWork();
    }
}
```

### 3.2 Indentation and Spacing
- **Indentation**: Fixed at **4 spaces**. The use of Tab characters is strictly prohibited to ensure consistent display across platforms.
- **Blank lines**: Leave one blank line between methods; use a single blank line to separate logical blocks within a method.

---

## 4. Asynchronous Programming

- **Async Suffix**: All asynchronous methods returning `Task` or `ValueTask` must end with the **`Async`** suffix.
- **CancellationToken**: Asynchronous methods should prioritize accepting a `CancellationToken` parameter and pass it to downstream asynchronous operations.
```csharp
public async Task<User?> GetUserByIdAsync(int id, CancellationToken ct = default)
{
    return await _context.Users.FindAsync([id], ct);
}
```

---

## 5. Modern C# Best Practices

- **Type Inference (var)**: When the variable type is obvious from the right side of the assignment (like `new`, casting), use `var`.
  - Recommended: `var users = new List<User>();`
- **Null Checks**: Use `is not null` for checking, as the semantics are closer to natural language and bypass operator overloading.
  - Recommended: `if (input is not null) { ... }`
- **Object Initialization**: Prioritize using object initializers and collection expressions (C# 12+).
  - Recommended: `List<int> numbers = [1, 2, 3];`

---

## 6. Commenting Conventions

- **XML Comments**: Public APIs must use `///` to provide XML comments so IDEs can show IntelliSense descriptions.
- **Logical Comments**: Comments should explain "Why" the processing is done this way, rather than repeating "What" the code does.
