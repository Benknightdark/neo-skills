# Modern C# Patterns Guide

This document introduces recommended development patterns in C# 10 through 15+, aiming to simplify code and improve performance using modern syntax.

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

---

## 7. C# 15 Modern Patterns

### 7.1 Union Types for Domain Modeling
**Recommendation**: Use `union` types to model closed variants without complex inheritance hierarchies, enabling exhaustive pattern matching.
```csharp
public record class Cat(string Name);
public record class Dog(string Name);
public record class Bird(string Name);

public union Pet(Cat, Dog, Bird);

// Exhaustive switch expression enforced by compiler
public string DescribePet(Pet pet) => pet switch
{
    Cat c => $"Cat named {c.Name}",
    Dog d => $"Dog named {d.Name}",
    Bird b => $"Bird named {b.Name}"
    // No default discard _ needed
};
```

### 7.2 Closed Hierarchies for Secure Domain Classes
**Recommendation**: Use the `closed` modifier on base classes or records to prevent external libraries from subclassing domain states.
```csharp
public closed abstract record class OrderStatus;
public record class Pending() : OrderStatus;
public record class Shipped(DateTime ShippedAt) : OrderStatus;
```

### 7.3 Collection Expressions with Arguments
**Recommendation**: Use `with(...)` at the start of a collection expression to supply constructor arguments such as capacity or comparers inline.
```csharp
// Inline capacity
List<string> items = [with(capacity: initialCount * 2), .. existingItems];

// Inline comparer
HashSet<string> keywords = [with(StringComparer.OrdinalIgnoreCase), "NET", "C#", "Rust"];
```

### 7.4 Labeled Break and Continue
**Recommendation**: In nested loops, use labeled `break` or `continue` to escape directly to the desired level without boolean flags.
```csharp
search:
foreach (var batch in batches)
{
    foreach (var item in batch)
    {
        if (item.IsTarget)
        {
            Process(item);
            break search;
        }
    }
}
```
