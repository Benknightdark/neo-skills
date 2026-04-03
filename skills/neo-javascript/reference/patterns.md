# Modern JavaScript Patterns Guide

This document introduces recommended development patterns in ES6 through ES2025+, aiming to simplify code and improve reliability using modern syntax.

## 1. Module and Declaration Patterns

### 1.1 ESM Modules (ES6+)
**Recommendation**: Use `import`/`export` with named exports for tree-shaking compatibility.
```javascript
// Named exports (preferred for libraries)
export function formatDate(date) { ... }
export function parseDate(str) { ... }

// Default export (preferred for single-purpose modules)
export default class UserService { ... }
```

### 1.2 Dynamic Import (ES2020+)
**Recommendation**: Lazy-load modules for code splitting and conditional loading.
```javascript
const { Chart } = await import('./chart.js');
```

### 1.3 Arrow Functions vs Function Declarations
**Recommendation**: Use arrow functions for callbacks and short expressions. Use function declarations for top-level named functions that benefit from hoisting.
```javascript
// Arrow functions for callbacks
const doubled = numbers.map(n => n * 2);

// Function declarations for top-level definitions
function processOrder(order) {
  // ...
}
```

---

## 2. Data Structures and Immutability

### 2.1 Destructuring and Spread (ES6+)
**Recommendation**: Use destructuring to extract values and spread to create shallow copies.
```javascript
// Object destructuring with renaming and defaults
const { name: userName, role = 'viewer' } = user;

// Shallow clone with override
const updated = { ...config, timeout: 5000 };

// Array spread
const combined = [...listA, ...listB];
```

### 2.2 Immutable Array Operations (ES2023+)
**Recommendation**: Use non-mutating array methods to avoid side effects.
```javascript
const sorted = items.toSorted((a, b) => a.name.localeCompare(b.name));
const reversed = items.toReversed();
const updated = items.with(2, 'newValue');
```

### 2.3 Object Grouping (ES2024+)
**Recommendation**: Use `Object.groupBy()` instead of manual reduce-based grouping.
```javascript
const grouped = Object.groupBy(users, user => user.role);
// { admin: [...], editor: [...], viewer: [...] }
```

### 2.4 Structured Cloning
**Recommendation**: Use `structuredClone()` for deep copies instead of `JSON.parse(JSON.stringify())`.
```javascript
const deepCopy = structuredClone(originalObject);
```

---

## 3. Async Patterns and Promise Composition

### 3.1 async/await (ES2017+)
**Recommendation**: Prefer `async`/`await` over `.then()` chains for readability and maintainability.
```javascript
async function loadUserProfile(id) {
  try {
    const user = await fetchUser(id);
    const posts = await fetchPosts(user.id);
    return { user, posts };
  } catch (err) {
    throw new Error('Failed to load profile', { cause: err });
  }
}
```

### 3.2 Promise Composition
**Recommendation**: Choose the right Promise combinator for the use case.
```javascript
// All must succeed
const [users, posts] = await Promise.all([fetchUsers(), fetchPosts()]);

// All settle, handle individually
const results = await Promise.allSettled([taskA(), taskB()]);

// First to succeed
const fastest = await Promise.any([mirrorA(), mirrorB()]);
```

### 3.3 Deferred Promise (ES2024+)
**Recommendation**: Use `Promise.withResolvers()` for externally controlled promises.
```javascript
const { promise, resolve, reject } = Promise.withResolvers();
setTimeout(() => resolve('done'), 1000);
const result = await promise;
```

### 3.4 Async Generators and Iteration (ES2018+)
**Recommendation**: Use async generators for streaming data processing.
```javascript
async function* fetchPages(url) {
  let nextUrl = url;
  while (nextUrl) {
    const response = await fetch(nextUrl);
    const data = await response.json();
    yield data.items;
    nextUrl = data.nextPage;
  }
}

for await (const page of fetchPages('/api/users')) {
  processItems(page);
}
```

---

## 4. Class Patterns and Encapsulation

### 4.1 ES6 Classes
**Recommendation**: Use `class` syntax with clear inheritance and `super` calls.
```javascript
class Animal {
  constructor(name) {
    this.name = name;
  }

  speak() {
    return `${this.name} makes a sound.`;
  }
}

class Dog extends Animal {
  speak() {
    return `${this.name} barks.`;
  }
}
```

### 4.2 Private Fields and Methods (ES2022+)
**Recommendation**: Use `#` prefix for true encapsulation, replacing the underscore convention.
```javascript
class Counter {
  #count = 0;

  increment() { this.#count++; }
  get value() { return this.#count; }
}
```

### 4.3 Error Cause Chaining (ES2022+)
**Recommendation**: Preserve error context with the `cause` option.
```javascript
try {
  await initializeService();
} catch (err) {
  throw new Error('Service initialization failed', { cause: err });
}
```

---

## 5. Set and Iterator Patterns (ES2025+)

### 5.1 Set Operations
**Recommendation**: Use native Set methods instead of manual implementations.
```javascript
const setA = new Set([1, 2, 3]);
const setB = new Set([2, 3, 4]);

const union = setA.union(setB);               // Set {1, 2, 3, 4}
const intersection = setA.intersection(setB); // Set {2, 3}
const difference = setA.difference(setB);     // Set {1}
```

### 5.2 Iterator Helpers
**Recommendation**: Use lazy iterator methods for memory-efficient data processing.
```javascript
const firstFiveEven = Iterator.from(hugeArray)
  .filter(n => n % 2 === 0)
  .take(5)
  .toArray();
```

---

## 6. Security and Performance

### 6.1 Input Sanitization
**Recommendation**: Never use `eval()`, `innerHTML` with unsanitized input, or `new Function()` with user input.
```javascript
// Safe DOM manipulation
element.textContent = userInput; // not element.innerHTML
```

### 6.2 AbortController for Resource Management
**Recommendation**: Use `AbortController` to cancel fetch requests, timers, and event listeners.
```javascript
const controller = new AbortController();
const response = await fetch(url, { signal: controller.signal });
// Cancel if needed: controller.abort();
```

### 6.3 Avoiding Memory Leaks
**Recommendation**: Use `WeakRef` and `WeakMap` for caches, and always clean up event listeners and intervals.
```javascript
// Use AbortController signal for automatic listener cleanup
const controller = new AbortController();
window.addEventListener('resize', handleResize, { signal: controller.signal });

// Cleanup all listeners at once
controller.abort();
```