# C# Anti-Patterns & Best Practices

This document lists common mistakes (Anti-Patterns) in C# development and their corresponding correct practices (Best Practices).

## 1. Asynchronous Programming

### 1.1 Avoid `Sync over Async`
**Problem**: Using `.Result` or `.Wait()` blocks the thread and can easily lead to deadlocks in ASP.NET or UI applications.

- **Bad**:
  ```csharp
  public IActionResult Get()
  {
      var data = _service.GetDataAsync().Result; // May cause deadlock
      return Ok(data);
  }
  ```
- **Good**:
  ```csharp
  public async Task<IActionResult> Get(CancellationToken ct)
  {
      var data = await _service.GetDataAsync(ct);
      return Ok(data);
  }
  ```

### 1.2 Avoid `async void`
**Problem**: `async void` methods cannot be `await`ed, and exceptions thrown within them cannot be caught by the caller, leading to direct process crashes.

- **Bad**:
  ```csharp
  public async void ProcessDataAsync() { ... }
  ```
- **Good**:
  ```csharp
  public async Task ProcessDataAsync() { ... } // Unless it's an Event Handler
  ```

---

## 2. Memory & Performance

### 2.1 Avoid string concatenation in loops
**Problem**: Strings are immutable, so every `+` creates a new string object, causing massive memory allocations.

- **Bad**:
  ```csharp
  string result = "";
  foreach (var s in items) { result += s; }
  ```
- **Good**:
  ```csharp
  var sb = new StringBuilder();
  foreach (var s in items) { sb.Append(s); }
  string result = sb.ToString();
  ```

### 2.2 Leverage `Span<T>` and `ReadOnlySpan<T>`
**Problem**: Frequent use of `Substring` creates substring copies.

- **Bad**:
  ```csharp
  string sub = largeString.Substring(0, 10);
  ```
- **Good**:
  ```csharp
  ReadOnlySpan<char> span = largeString.AsSpan(0, 10); // No copy allocation needed
  ```

---

## 3. Exception Handling

### 3.1 Avoid swallowing exceptions
**Problem**: Catching exceptions without handling or logging them hides potential bugs, making debugging extremely difficult.

- **Bad**:
  ```csharp
  try { ... } catch (Exception) { } // Do nothing
  ```
- **Good**:
  ```csharp
  try { ... } 
  catch (Exception ex) 
  { 
      _logger.LogError(ex, "An error occurred"); 
      throw; // Or handle according to logic
  }
  ```

### 3.2 Rethrow exceptions correctly
**Problem**: Using `throw ex;` clears the original stack trace.

- **Bad**:
  ```csharp
  catch (Exception ex) { throw ex; }
  ```
- **Good**:
  ```csharp
  catch (Exception ex) { throw; } // Preserve original stack trace
  ```

---

## 4. Modern C# Patterns

### 4.1 Null checks (C# 9.0+)
- **Legacy**: `if (obj != null)`
- **Modern**: `if (obj is not null)` (Clearer semantics, unaffected by `!=` operator overloading)

### 4.2 Collection initialization (C# 12+)
- **Legacy**: `var list = new List<int> { 1, 2, 3 };`
- **Modern**: `List<int> list = [1, 2, 3];` (Using Collection Expressions)

### 4.3 Property backing fields (C# 14+)
- **Legacy**:
  ```csharp
  private string _name;
  public string Name { get => _name; set => _name = value.Trim(); }
  ```
- **Modern**:
  ```csharp
  public string Name { get; set => field = value.Trim(); } // Using the field keyword
  ```

---

## 5. Resource Management

### 5.1 Always use `using` declarations
**Problem**: Failing to properly release objects implementing `IDisposable` (like database connections, file streams) leads to resource leaks.

- **Bad**:
  ```csharp
  var stream = new FileStream(path, FileMode.Open);
  // ... If an exception occurs in between, stream is never closed
  stream.Dispose();
  ```
- **Good**:
  ```csharp
  using var stream = new FileStream(path, FileMode.Open); // Automatically Disposed at end of scope
  ```
