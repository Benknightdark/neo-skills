# Modern C# Patterns Guide

This document introduces recommended development patterns in C# 10 through 14+, aiming to simplify code and improve performance using modern syntax.

## 1. Architecture and Declaration Patterns

### 1.1 File-scoped Namespaces (C# 10+)
**Recommendation**: Reduce brace nesting to make the code structure flatter.
```csharp
namespace MyProject.Services; // Recommended

public class CustomerService { ... }
```

### 1.2 Primary Constructors (C# 12+)
**Recommendation**: Simplify class-level dependency injection declarations.
```csharp
// Declare parameters directly after the class name to initialize properties or fields
public class UserService(IUserRepository repository, ILogger logger)
{
    public async Task<User?> GetUserAsync(int id) => await repository.FindByIdAsync(id);
}
```

---

## 2. Data Structures and Initialization

### 2.1 Use Record for Immutable Data
**Recommendation**: When defining DTOs or value objects, prioritize using `record` to gain built-in equality comparison and immutability.
```csharp
public record UserDto(int Id, string Name, string Email);
```

### 2.2 Collection Expressions (C# 12+)
**Recommendation**: Use the consistent `[]` syntax to initialize various collection types.
```csharp
int[] array = [1, 2, 3];
List<string> names = ["Alice", "Bob"];
Span<byte> buffer = [0x01, 0x02];
```

### 2.3 Raw String Literals (C# 11+)
**Recommendation**: Avoid tedious escape characters when dealing with JSON, SQL, or multi-line text.
```csharp
string json = """
{
    "name": "Gemini",
    "version": "1.4"
}
""";
```

---

## 3. Logic and Expressions

### 3.1 Pattern Matching
**Recommendation**: Use `switch` expressions instead of traditional `switch` statements, and utilize property patterns.
```csharp
public decimal GetDiscount(Order order) => order switch
{
    { TotalAmount: > 1000 } => 0.1m,
    { Items.Count: > 5 } => 0.05m,
    _ => 0m
};
```

### 3.2 Expression-bodied Members
**Recommendation**: Use `=>` to shorten code for single-line methods or read-only properties.
```csharp
public override string ToString() => $"{FirstName} {LastName}";
```

---

## 4. C# 14+ Forward-looking Patterns

### 4.1 Field-backed Properties
**Recommendation**: Use the `field` keyword in auto-properties that require simple logic.
```csharp
public string Nickname 
{ 
    get; 
    set => field = value?.Trim() ?? "Guest"; 
}
```

### 4.2 Extension Members
**Recommendation**: Use `extension` blocks to add properties or static members to existing types, not just methods.
```csharp
public extension UserExtension for User
{
    public bool IsAdmin => this.Roles.Contains("Admin");
}
```

---

## 5. Security and Performance

### 5.1 Readonly Members
**Recommendation**: In `struct`s, if a method does not modify state, it should be marked as `readonly` to facilitate compiler optimizations.
```csharp
public readonly struct Point(double x, double y)
{
    public readonly double Distance => Math.Sqrt(x * x + y * y);
}
```

### 5.2 Default Lambda Parameters
**Recommendation**: Provide default values for Lambda expressions to increase flexibility.
```csharp
var greeter = (string name = "Guest") => $"Hello, {name}!";
```

---

## 6. Null Safety

### 6.1 Nullable Reference Types (C# 8.0+)
**Recommendation**: Enable NRT at the project level, explicitly distinguish between "non-nullable" and "nullable" reference types, and shift null checks from runtime to compile time.
```csharp
public class UserProfile
{
    // Use required to ensure it's not Null after construction
    public required string Username { get; set; } 

    // Use ? to mark this field as allowing Null
    public string? Bio { get; set; }             
}
```

### 6.2 Improved Null Check Semantics
**Recommendation**: Use `is not null` and the `??=` operator to make null handling logic cleaner and more readable.
```csharp
// Use is not null
if (input is not null) { ... }

// Use null-coalescing assignment operator
_logger ??= NullLogger.Instance;
```