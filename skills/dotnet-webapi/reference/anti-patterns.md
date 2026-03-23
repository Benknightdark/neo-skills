# ASP.NET Core Web API Anti-Patterns

## 1. Async & Resource Anti-Patterns

### Sync over Async
Using `.Result` or `.Wait()` in asynchronous methods.

**Problem**: This causes thread pool starvation, potentially leading to deadlocks and poor scalability.

```csharp
// BAD: Sync blocks thread
public IActionResult Get()
{
    var data = _service.GetDataAsync().Result;
    return Ok(data);
}
```

**Solution**: Always use `await` and propagate `CancellationToken`.

```csharp
// GOOD: Fully async
public async Task<IActionResult> Get(CancellationToken ct)
{
    var data = await _service.GetDataAsync(ct);
    return Ok(data);
}
```

## 2. Structural & Architectural Anti-Patterns

### Fat Controllers
Putting business logic, validation, and data access inside controller actions.

**Problem**: Controllers become bloated, hard to test, and difficult to maintain.

```csharp
// BAD: Controller does everything
[HttpPost]
public async Task<IActionResult> PlaceOrder(int itemId)
{
    var item = await _context.Items.FindAsync(itemId);
    if (item.Stock < 1) return BadRequest("No stock");
    
    // Complex business logic...
    _context.Orders.Add(new Order { ItemId = itemId });
    await _context.SaveChangesAsync();
    
    return Ok();
}
```

**Solution**: Keep controllers thin and delegate logic to a Service or Handler.

```csharp
// GOOD: Delegate to handler (CQRS)
[HttpPost]
public async Task<IActionResult> PlaceOrder(int itemId)
{
    var result = await _mediator.Send(new PlaceOrderCommand(itemId));
    return result.ToActionResult();
}
```

### Exposing Domain Entities
Returning EF Core entities directly to the client.

**Problem**: This leaks database structure, may cause circular reference errors, and risks exposing sensitive fields.

```csharp
// BAD: Exposing domain entity
[HttpGet("{id}")]
public async Task<ActionResult<User>> GetUser(int id)
{
    var user = await _context.Users.FindAsync(id);
    return Ok(user); // PasswordHash and SecretFields are leaked
}
```

**Solution**: Use DTOs or Records for output.

```csharp
// GOOD: Return DTO
public record UserResponse(int Id, string Username, string Email);

[HttpGet("{id}")]
public async Task<ActionResult<UserResponse>> GetUser(int id)
{
    var user = await _service.GetByIdAsync(id);
    return Ok(new UserResponse(user.Id, user.Username, user.Email));
}
```

## 3. Data & Security Anti-Patterns

### Mass Assignment (Direct Entity Binding)
Binding incoming requests directly to database entities.

**Problem**: Over-posting vulnerability allows attackers to update fields they shouldn't (e.g., `IsAdmin`).

```csharp
// BAD: Direct entity binding
[HttpPost]
public async Task<IActionResult> UpdateProfile(User user)
{
    _context.Users.Update(user); // Can update sensitive fields like "IsAdmin"
    await _context.SaveChangesAsync();
    return Ok();
}
```

**Solution**: Use dedicated Input DTOs.

```csharp
// GOOD: Input DTO
public record ProfileUpdateDto(string Nickname, string AvatarUrl);

[HttpPost]
public async Task<IActionResult> UpdateProfile(ProfileUpdateDto dto)
{
    var user = await _context.Users.FindAsync(GetCurrentUserId());
    user.Nickname = dto.Nickname; // Only update allowed fields
    await _context.SaveChangesAsync();
    return Ok();
}
```

### N+1 Query Issue
Querying related data in a loop.

**Problem**: Causes many small database roundtrips, significantly degrading performance.

```csharp
// BAD: Querying in a loop
var users = await _context.Users.ToListAsync();
foreach (var user in users) {
    user.Roles = await _context.Roles.Where(r => r.UserId == user.Id).ToListAsync();
}
```

**Solution**: Use Eager Loading (`Include`) or Projecting with DTOs.

```csharp
// GOOD: Eager loading
var usersWithRoles = await _context.Users
    .AsNoTracking()
    .Include(u => u.Roles)
    .ToListAsync();
```

## 4. Error Handling Anti-Patterns

### Raw Exception Leaks
Returning raw `ex.ToString()` or `ex.Message` to the client in production.

**Problem**: Leaks internal server details, stack traces, and environment information, which is a security risk.

```csharp
// BAD: Leak internal details
try { ... }
catch (Exception ex)
{
    return StatusCode(500, ex.ToString());
}
```

**Solution**: Use global exception handling and Problem Details.

```csharp
// GOOD: Standard Problem Details
return Problem(
    detail: "An unexpected error occurred. Please try again later.",
    statusCode: StatusCodes.Status500InternalServerError
);
```
