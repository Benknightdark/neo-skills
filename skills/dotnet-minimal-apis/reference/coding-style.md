# .NET Minimal APIs 程式碼風格與命名規範 (Coding Conventions)

本指南旨在提升 Minimal APIs 的開發效率，並確保端點與路由邏輯的組織具有高度一致性。

## 1. 路由命名與語法 (Routing)

### 1.1 路由範本
- **Kebab-case**：路由路徑優先使用小寫字母並以破折號分隔（如 `/api/v1/user-profiles`）。
- **參數命名**：路徑參數應與處理常式 (Handler) 的參數名稱一致，使用大寫或小寫皆可，但建議保持專案一致性（如 `/{id}` 對應 `int id`）。

### 1.2 路由群組 (Route Groups)
- **語意化前綴**：對於具備相同前綴或中介軟體的端點，必須使用 `MapGroup` 進行邏輯分組。
- **隔離宣告**：避免在 `Program.cs` 中直接寫入大量路由。推薦使用擴充方法將群組路由抽離至單獨檔案。
  ```csharp
  // 推薦做法：抽離至 UserEndpoints.cs
  public static class UserEndpoints
  {
      public static IEndpointRouteBuilder MapUserEndpoints(this IEndpointRouteBuilder routes)
      {
          var group = routes.MapGroup("/users");
          group.MapGet("/", GetAllUsers);
          return routes;
      }
  }
  ```

---

## 2. 處理常式 (Handlers)

- **匿名函式 vs 具名方法**：對於單行或簡單邏輯，可使用 Lambda。若邏輯超過 3 行，應改用靜態具名方法或抽離至服務。
- **依賴注入**：直接在 Handler 參數中注入服務。
- **CancellationToken**：所有回傳 `Task` 的非同步 Handler 應優先接受 `CancellationToken` 並傳遞給下游。

---

## 3. 回應型別 (Results)

- **TypedResults**：為了提升 OpenAPI (Swagger) 的靜態分析能力，優先使用 `TypedResults` 而非 `Results`。
- **Results<T1, T2>**：當一個端點可能回傳多種狀態碼時，使用 `Results<T1, T2>` 提供強型別支援。
  ```csharp
  public static async Task<Results<Ok<User>, NotFound>> GetUser(int id, IUserRepository repo)
  {
      var user = await repo.GetByIdAsync(id);
      return user is not null ? TypedResults.Ok(user) : TypedResults.NotFound();
  }
  ```

---

## 4. 檔案組織 (Organization)

- **Vertical Slice**：推薦按功能模組組織檔案，而非按類別（如 `Features/Users/UserEndpoints.cs`, `Features/Users/UserDto.cs`）。
- **File-scoped Namespace**：一律使用 File-scoped Namespace (C# 10+) 以減少嵌套。
