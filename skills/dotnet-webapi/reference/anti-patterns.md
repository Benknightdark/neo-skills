# ASP.NET Core Web API Anti-patterns & Best Practices

This guide lists common development errors (Anti-patterns) and their corresponding correct practices (Patterns) based on the latest standards.

---

## 1. Asynchrony

### ❌ Anti-pattern: Sync over Async
Using `.Result` or `.Wait()` in asynchronous methods, causing thread pool starvation or deadlocks.
```csharp
public IActionResult Get()
{
    var data = _service.GetDataAsync().Result; // ❌ Incorrect: Sync blocks thread
    return Ok(data);
}
```

### ✅ Best Practice: Async all the way
Always use `await` and propagate `CancellationToken` for cancellation support.
```csharp
public async Task<IActionResult> Get(CancellationToken ct)
{
    var data = await _service.GetDataAsync(ct); // ✅ Correct: Fully async
    return Ok(data);
}
```

---

## 2. Data Security & DTOs

### ❌ Anti-pattern: Direct Entity Binding (Mass Assignment)
Exposing database entities as API parameters.
```csharp
[HttpPost]
public async Task<IActionResult> UpdateProfile(User user) // ❌ Incorrect: Exposes internals
{
    _context.Users.Update(user); // Can update sensitive fields like "IsAdmin"
    await _context.SaveChangesAsync();
    return Ok();
}
```

### ✅ Best Practice: Input/Output DTOs
Use dedicated Data Transfer Objects (DTOs) and a mapper.
```csharp
public record ProfileUpdateDto(string Nickname, string AvatarUrl); // ✅ Correct

[HttpPost]
public async Task<IActionResult> UpdateProfile(ProfileUpdateDto dto)
{
    var user = await _context.Users.FindAsync(GetUserId());
    user.Nickname = dto.Nickname; // Only update allowed fields
    await _context.SaveChangesAsync();
    return Ok();
}
```

---

## 3. Controller Design

### ❌ Anti-pattern: Fat Controllers & Business in UI
Putting database or business logic inside controllers.
```csharp
[HttpPost]
public async Task<IActionResult> Order(int itemId)
{
    var item = await _context.Items.FindAsync(itemId); // ❌ Incorrect
    if (item.Stock < 1) return BadRequest("No stock"); 
    // ... complex logic ...
    return Ok();
}
```

### ✅ Best Practice: Thin Controllers (CQRS)
Delegate to handlers using MediatR or a dedicated Service Layer.
```csharp
[HttpPost]
public async Task<IActionResult> Order(int itemId)
{
    var result = await _mediator.Send(new PlaceOrderCommand(itemId)); // ✅ Correct
    return result.ToActionResult(); // Use Result Pattern extension
}
```

---

## 4. Error Handling

### ❌ Anti-pattern: Returning Raw Exceptions
Returning full exception details to the client in production.
```csharp
try { /* Logic */ }
catch (Exception ex)
{
    return StatusCode(500, ex.ToString()); // ❌ Incorrect: Leaks server internals
}
```

### ✅ Best Practice: Global Problem Details
Use standardized error reporting.
```csharp
// Use app.UseExceptionHandler() globally
return TypedResults.Problem(
    detail: "Insufficient stock for item #123",
    statusCode: StatusCodes.Status400BadRequest
);
```

---

## 5. Performance & Data

### ❌ Anti-pattern: N+1 Query Issue
Querying related data in a loop.
```csharp
var users = await _context.Users.ToListAsync();
foreach (var user in users) {
    user.Roles = await _context.Roles.Where(r => r.UserId == user.Id).ToListAsync(); // ❌ Incorrect
}
```

### ✅ Best Practice: Eager Loading & No-Tracking
Use `.Include()` or `.AsSplitQuery()` and `.AsNoTracking()` for read operations.
```csharp
var usersWithRoles = await _context.Users
    .AsNoTracking() // Performance boost for reads
    .Include(u => u.Roles) // Load all in one query (or split query)
    .ToListAsync();
```
