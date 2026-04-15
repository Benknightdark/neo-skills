# JavaScript Coding Conventions

This guide follows community-established conventions from [MDN JavaScript Guide](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide), [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript), and [Google JavaScript Style Guide](https://google.github.io/styleguide/jsguide.html), aimed at improving development efficiency and maintaining project consistency.

## 1. Naming Conventions

Good naming is the core of self-documenting code and reduces communication overhead.

### 1.1 camelCase
Used for **variables**, **functions**, and **object properties**.
- **Variable**: `const userName = 'Alice';`
- **Function**: `function getUserById(id) { ... }`
- **Object Property**: `{ firstName: 'Bob', lastName: 'Smith' }`

### 1.2 PascalCase
Used for **classes**, **constructors**, and **components**.
- **Class**: `class UserManager { ... }`
- **React/UI Component**: `function NavBar() { ... }`

### 1.3 UPPER_SNAKE_CASE
Used for **module-level constants** and **configuration values**.
- **Constant**: `const MAX_RETRIES = 3;`
- **Config**: `const API_BASE_URL = 'https://api.example.com';`

### 1.4 Private Fields
Use the `#` prefix for **private class fields** (ES2022+).
- **Private field**: `#count = 0;`
- **Private method**: `#validate() { ... }`

---

## 2. File Organization

- **File naming**: Use `kebab-case` for file names (e.g., `user-service.js`, `auth-utils.mjs`).
- **Module type**: Use `.mjs` extension or `"type": "module"` in `package.json` for ESM.
- **Single responsibility**: One primary export per module file to facilitate tree-shaking and code navigation.
- **Import order**: External packages first, then internal modules. Separate groups with blank lines.
```javascript
// 1. External packages
import React, { useState } from 'react';
import { debounce } from 'lodash-es';

// 2. Internal modules
import { validateInput } from './utils/validation.js';
import { UserCard } from './components/user-card.js';
```

---

## 3. Formatting

### 3.1 K&R Style (Opening brace on same line)
The opening brace `{` stays on the same line as the statement. This is the standard JavaScript style.
```javascript
// Correct approach
function process() {
  if (isReady) {
    doWork();
  }
}
```

### 3.2 Indentation and Spacing
- **Indentation**: Fixed at **2 spaces**. The use of Tab characters is prohibited to ensure consistent display across platforms.
- **Semicolons**: Be consistent within a project. If using semicolons, use them everywhere. If omitting (relying on ASI), do so consistently and understand the pitfalls.
- **Blank lines**: Leave one blank line between function declarations; use a single blank line to separate logical blocks within a function.

---

## 4. Asynchronous Programming

- **Async/Await**: Prefer `async`/`await` over `.then()` chains for readability.
- **Error Handling**: Always wrap `await` calls in `try`/`catch` or use a utility wrapper.
- **AbortController**: Use `AbortController` for cancellable fetch requests, timers, and event listeners.
```javascript
async function getUserById(id, signal) {
  const response = await fetch(`/api/users/${id}`, { signal });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`, { cause: response });
  }
  return response.json();
}
```

---

## 5. Modern JavaScript Best Practices

- **Variable Declarations (`const`/`let`)**: Use `const` by default. Use `let` only when the binding will be reassigned. Never use `var`.
  - Recommended: `const users = [];`
- **Null/Undefined Checks**: Use nullish coalescing (`??`) and optional chaining (`?.`) instead of `||` and manual checks.
  - Recommended: `const name = user?.profile?.name ?? 'Anonymous';`
- **Object/Array Initialization**: Use destructuring, spread operators, and shorthand property names.
  - Recommended: `const { id, name } = user;`
- **Equality**: Always use `===` and `!==`. Never use `==` or `!=`.

---

## 6. Commenting Conventions

- **JSDoc**: Public APIs and exported functions should use `/** ... */` JSDoc comments for IDE IntelliSense and documentation generation.
```javascript
/**
 * Fetches a user by their unique identifier.
 * @param {number} id - The user's ID.
 * @param {AbortSignal} [signal] - Optional signal to cancel the request.
 * @returns {Promise<User>} The user object.
 */
export async function getUserById(id, signal) { ... }
```
- **Logical Comments**: Comments should explain "Why" the processing is done this way, not repeat "What" the code does.
- **TODO/FIXME**: Use `// TODO:` for planned improvements and `// FIXME:` for known issues.

---

## 7. Architecture Patterns for Vanilla JS (HTML/CSHTML)

This pattern should be applied when refactoring JavaScript files that are referenced by HTML or CSHTML files in non-SPA environments.

### 7.1 Separation of Concerns
To maintain clean and testable code, split the logic into three distinct classes:

- **API Class**: Handles all network requests (e.g., `fetch`, AJAX) communicating with the backend.
- **UI Class**: Strictly responsible for DOM element selection, rendering, and UI updates. It should not contain business logic.
- **Controller Class**: Manages core business logic, registers event listeners, and orchestrates the flow by calling both the API and UI classes.

### 7.2 Example Implementation

```javascript
((window, document) => {
  // API Class - Handles data fetching
  class UserAPI {
    #baseUrl = '/api/users';

    async getUser(id) {
      const response = await fetch(`${this.#baseUrl}/${id}`);
      if (!response.ok) throw new Error('Failed to fetch user');
      return response.json();
    }
  }

  // UI Class - Handles DOM manipulation
  class UserUI {
    #elements = {
      nameDisplay: document.getElementById('userName'),
      loadingSpinner: document.getElementById('spinner')
    };

    updateUserName(name) {
      this.#elements.nameDisplay.textContent = name;
    }

    toggleLoading(show) {
      this.#elements.loadingSpinner.style.display = show ? 'block' : 'none';
    }
  }

  // Controller Class - Orchestrates business logic and events
  class UserController {
    #api;
    #ui;

    constructor(api, ui) {
      this.#api = api;
      this.#ui = ui;
    }

    init() {
      this.#registerEvents();
    }

    #registerEvents() {
      document.getElementById('fetchBtn')?.addEventListener('click', () => this.handleFetchUser());
    }

    async handleFetchUser() {
      try {
        const userId = document.getElementById('userIdInput').value;
        this.#ui.toggleLoading(true);
        const user = await this.#api.getUser(userId);
        this.#ui.updateUserName(user.name);
      } catch (error) {
        console.error(error);
        alert('Error fetching user data');
      } finally {
        this.#ui.toggleLoading(false);
      }
    }
  }

  // Initialization on Page Load
  document.addEventListener('DOMContentLoaded', () => {
    const api = new UserAPI();
    const ui = new UserUI();
    const controller = new UserController(api, ui);
    controller.init();
  });
})(window, document);
```

