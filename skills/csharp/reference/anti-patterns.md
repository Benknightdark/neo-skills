# C# 反模式與最佳實踐 (Anti-Patterns & Best Practices)

本文件列出 C# 開發中常見的錯誤做法（Anti-Patterns）及其對應的正確實踐（Best Practices）。

## 1. 非同步程式設計 (Asynchronous Programming)

### 1.1 避免 `Sync over Async` (同步阻塞非同步)
**問題**：使用 `.Result` 或 `.Wait()` 會阻塞執行緒，在 ASP.NET 或 UI 應用程式中極易導致死結 (Deadlock)。

- **錯誤**：
  ```csharp
  public IActionResult Get()
  {
      var data = _service.GetDataAsync().Result; // 可能導致死結
      return Ok(data);
  }
  ```
- **正確**：
  ```csharp
  public async Task<IActionResult> Get(CancellationToken ct)
  {
      var data = await _service.GetDataAsync(ct);
      return Ok(data);
  }
  ```

### 1.2 避免 `async void`
**問題**：`async void` 方法無法被 `await`，且其中的異常無法被呼叫端擷取，會直接導致處理程序崩潰。

- **錯誤**：
  ```csharp
  public async void ProcessDataAsync() { ... }
  ```
- **正確**：
  ```csharp
  public async Task ProcessDataAsync() { ... } // 除非是事件處理常式 (Event Handler)
  ```

---

## 2. 記憶體與效能 (Memory & Performance)

### 2.1 避免在迴圈中進行字串連接
**問題**：字串是不可變的 (Immutable)，每次 `+` 都會建立新的字串物件，造成大量的記憶體分配。

- **錯誤**：
  ```csharp
  string result = "";
  foreach (var s in items) { result += s; }
  ```
- **正確**：
  ```csharp
  var sb = new StringBuilder();
  foreach (var s in items) { sb.Append(s); }
  string result = sb.ToString();
  ```

### 2.2 善用 `Span<T>` 與 `ReadOnlySpan<T>`
**問題**：頻繁使用 `Substring` 會建立子字串副本。

- **錯誤**：
  ```csharp
  string sub = largeString.Substring(0, 10);
  ```
- **正確**：
  ```csharp
  ReadOnlySpan<char> span = largeString.AsSpan(0, 10); // 無需副本分配
  ```

---

## 3. 異常處理 (Exception Handling)

### 3.1 避免吃掉異常 (Swallowing Exceptions)
**問題**：擷取異常後不進行處理或記錄，會隱藏潛在的 Bug，使除錯變得極度困難。

- **錯誤**：
  ```csharp
  try { ... } catch (Exception) { } // 什麼都不做
  ```
- **正確**：
  ```csharp
  try { ... } 
  catch (Exception ex) 
  { 
      _logger.LogError(ex, "發生錯誤"); 
      throw; // 或者根據邏輯處理
  }
  ```

### 3.2 正確重新拋出異常
**問題**：使用 `throw ex;` 會清除原始的堆疊追蹤 (Stack Trace)。

- **錯誤**：
  ```csharp
  catch (Exception ex) { throw ex; }
  ```
- **正確**：
  ```csharp
  catch (Exception ex) { throw; } // 保留原始堆疊追蹤
  ```

---

## 4. 現代 C# 特性 (Modern C# Patterns)

### 4.1 空值檢查 (C# 9.0+)
- **舊式**：`if (obj != null)`
- **現代**：`if (obj is not null)` (語意更清晰，且不受 `!=` 運算子多載影響)

### 4.2 集合初始化 (C# 12+)
- **舊式**：`var list = new List<int> { 1, 2, 3 };`
- **現代**：`List<int> list = [1, 2, 3];` (使用 Collection Expressions)

### 4.3 屬性後備欄位 (C# 14+)
- **舊式**：
  ```csharp
  private string _name;
  public string Name { get => _name; set => _name = value.Trim(); }
  ```
- **現代**：
  ```csharp
  public string Name { get; set => field = value.Trim(); } // 使用 field 關鍵字
  ```

---

## 5. 資源管理 (Resource Management)

### 5.1 務必使用 `using` 宣告
**問題**：未正確釋放實作 `IDisposable` 的物件（如資料庫連線、檔案流）會導致資源洩漏。

- **錯誤**：
  ```csharp
  var stream = new FileStream(path, FileMode.Open);
  // ... 若中間發生異常，stream 永遠不會關閉
  stream.Dispose();
  ```
- **正確**：
  ```csharp
  using var stream = new FileStream(path, FileMode.Open); // 結束作用域後自動 Dispose
  ```
