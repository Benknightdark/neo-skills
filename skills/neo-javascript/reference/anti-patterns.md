# JavaScript Anti-Patterns & Best Practices

This document lists common mistakes (Anti-Patterns) in JavaScript development and their corresponding correct practices (Best Practices).

## 1. Variable Declarations and Scoping

### 1.1 Avoid `var` — Use `const` and `let`

**Problem**: `var` is function-scoped and hoisted, leading to unexpected behavior and bugs in loops and closures.

- **Bad**:

  ```javascript
  for (var i = 0; i < 5; i++) {
    setTimeout(() => console.log(i), 100); // Prints 5, 5, 5, 5, 5
  }
  ```

- **Good**:

  ```javascript
  for (let i = 0; i < 5; i++) {
    setTimeout(() => console.log(i), 100); // Prints 0, 1, 2, 3, 4
  }
  ```

### 1.2 Avoid Loose Equality (`==`)

**Problem**: `==` performs type coercion, leading to surprising comparisons (e.g., `0 == ''` is `true`, `null == undefined` is `true`).

- **Bad**:

  ```javascript
  if (value == null) { ... }  // Catches both null and undefined — unclear intent
  if (count == '0') { ... }   // true due to type coercion
  ```

- **Good**:

  ```javascript
  if (value === null || value === undefined) { ... }  // Explicit intent
  if (count === 0) { ... }  // No coercion surprises
  ```

---

## 2. Asynchronous Programming

### 2.1 Avoid Callback Hell

**Problem**: Deeply nested callbacks make code unreadable and error handling fragile.

- **Bad**:

  ```javascript
  getUser(id, (err, user) => {
    if (err) return handleError(err);
    getOrders(user.id, (err, orders) => {
      if (err) return handleError(err);
      getDetails(orders[0].id, (err, details) => {
        // Deeply nested...
      });
    });
  });
  ```

- **Good**:

  ```javascript
  try {
    const user = await getUser(id);
    const orders = await getOrders(user.id);
    const details = await getDetails(orders[0].id);
  } catch (err) {
    handleError(err);
  }
  ```

### 2.2 Avoid Unhandled Promise Rejections

**Problem**: A Promise without `.catch()` or `try`/`catch` around `await` causes unhandled rejection warnings and unpredictable application states.

- **Bad**:

  ```javascript
  async function fetchData() {
    const data = await api.get('/data'); // No error handling
    return data;
  }
  ```

- **Good**:

  ```javascript
  async function fetchData() {
    try {
      const data = await api.get('/data');
      return data;
    } catch (err) {
      throw new Error('Failed to fetch data', { cause: err });
    }
  }
  ```

---

## 3. Memory & Performance

### 3.1 Avoid Event Listener and Timer Leaks

**Problem**: Adding event listeners or `setInterval` without cleanup leads to memory leaks, especially in single-page applications.

- **Bad**:

  ```javascript
  function setup() {
    window.addEventListener('resize', handleResize);
    // Never removed — leaks when component is destroyed
  }
  ```

- **Good**:

  ```javascript
  const controller = new AbortController();
  window.addEventListener('resize', handleResize, { signal: controller.signal });
  // Cleanup: controller.abort();
  ```

### 3.2 Avoid Blocking the Main Thread

**Problem**: CPU-intensive synchronous operations (huge loops, massive DOM updates, or heavy JSON parsing) block the main thread, freezing the UI and making the browser unresponsive.

- **Bad**:

  ```javascript
  function processLargeData(items) {
    // Blocks the UI thread completely for a long time
    return items.map(item => expensiveComputation(item)); 
  }
  ```

- **Good**:

  ```javascript
  // Use Web Workers for heavy computation, or chunking via setTimeout/requestAnimationFrame
  function processDataInChunks(items) {
    let index = 0;
    function chunk() {
      const end = Math.min(index + 100, items.length);
      for (; index < end; index++) {
        expensiveComputation(items[index]);
      }
      if (index < items.length) {
        requestAnimationFrame(chunk); // Yield back to the browser
      }
    }
    chunk();
  }
  ```

---

## 4. Security

### 4.1 Avoid `eval()` and `innerHTML` with Untrusted Input

**Problem**: `eval()` executes arbitrary code; `innerHTML` with user input enables XSS attacks.

- **Bad**:

  ```javascript
  element.innerHTML = userComment; // XSS vulnerability
  eval(userInput); // Remote code execution
  ```

- **Good**:

  ```javascript
  element.textContent = userComment; // Safe
  // For HTML rendering, use a sanitization library (e.g., DOMPurify)
  ```

### 4.2 Avoid Mutating Function Parameters (Immutability)

**Problem**: Directly mutating input arguments causes hard-to-trace side effects. The caller's data is changed unexpectedly.

- **Bad**:

  ```javascript
  const addNewTag = (tags, newTag) => {
    tags.push(newTag); // Mutates the original array
    return tags;
  };
  ```

- **Good**:

  ```javascript
  const addNewTag = (tags, newTag) => {
    return [...tags, newTag]; // Returns a new array, keeps original data intact
  };
  ```

### 4.3 Avoid Prototype Pollution

**Problem**: Merging untrusted objects into existing objects can overwrite `Object.prototype` properties, leading to security vulnerabilities.

- **Bad**:

  ```javascript
  function merge(target, source) {
    for (const key in source) {
      target[key] = source[key]; // '__proto__' can be injected
    }
  }
  ```

- **Good**:

  ```javascript
  function merge(target, source) {
    for (const key of Object.keys(source)) {
      if (key === '__proto__' || key === 'constructor') continue;
      target[key] = source[key];
    }
  }
  // Or use structuredClone / Object.assign with null-prototype objects
  ```

---

## 5. Modern JavaScript Patterns

### 5.1 Variable Declarations (ES6+)

- **Legacy**: `var name = 'Alice';`
- **Modern**: `const name = 'Alice';` (Block-scoped, no hoisting surprises)

### 5.2 Async Flow (ES2017+)

- **Legacy**:

  ```javascript
  fetch('/api/data')
    .then(res => res.json())
    .then(data => console.log(data))
    .catch(err => console.error(err));
  ```

- **Modern**:

  ```javascript
  try {
    const res = await fetch('/api/data');
    const data = await res.json();
    console.log(data);
  } catch (err) {
    console.error(err);
  }
  ```

### 5.3 Default Values (ES2020+)

- **Legacy**: `const name = obj && obj.user && obj.user.name || 'default';`
- **Modern**: `const name = obj?.user?.name ?? 'default';` (Optional chaining + nullish coalescing)

### 5.4 Array Mutation (ES2023+)

- **Legacy**: `const sorted = [...arr].sort(compareFn);` (Manual copy to avoid mutation)
- **Modern**: `const sorted = arr.toSorted(compareFn);` (Returns a new sorted array)

### 5.5 Object Property Checking (ES2022+)

- **Legacy**: `if (obj.hasOwnProperty('key'))` (Can be overridden on the object)
- **Modern**: `if (Object.hasOwn(obj, 'key'))` (Static method, safe from prototype overriding)

### 5.6 Module System (ES6+)

- **Legacy**: `var cloneDeep = require('lodash/cloneDeep');` (CommonJS / Script tags)
- **Modern**: `import { cloneDeep } from 'lodash-es';` (ESM)

### 5.7 Logical Assignment (ES2021+)

- **Legacy**: `if (!obj.prop) { obj.prop = value; }` (Verbose and repetitive)
- **Modern**: `obj.prop ??= value;` (Concise nullish assignment)

### 5.8 String & Array Searching (ES6+)

- **Legacy**: `if (str.indexOf('text') !== -1)` (Returns index, requires `!== -1` check)
- **Modern**: `if (str.includes('text'))` (Returns boolean directly, clearer intent)

### 5.9 Object Grouping (ES2024+)

- **Legacy**: `users.reduce((acc, user) => { (acc[user.role] ||= []).push(user); return acc; }, {});` (Verbose reduce logic)
- **Modern**: `Object.groupBy(users, user => user.role);` (Clear intent, native support)
