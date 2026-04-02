---
name: neo-javascript
version: "1.0.0"
category: "Core"
description: "跨版本 JavaScript 專家技能 (ES6 - ES2025+)。支援從瀏覽器到 Node.js 的現代開發模式，涵蓋 Arrow Functions 到 Iterator Helpers 的全方位演進。"
compatibility: "Supports ES6 (ES2015) through ES2025 and Stage 3+ proposals. Adaptive to browser and Node.js environments."
---

# Modern JavaScript (ES6+) Expert Skill

## Trigger On
- The user asks to write, debug, refactor, or review JavaScript code.
- The project directory contains `*.js`, `*.mjs`, `*.cjs`, `package.json`, or JavaScript configuration files (e.g., `eslint.config.js`).
- HTML files (`*.html`) or Razor views (`*.cshtml`) contain inline `<script>` blocks or reference external `.js` files via `<script src="...">`.
- The target runtime is a modern browser (Chrome 80+, Firefox 78+, Safari 14+) or Node.js 14+.
- Code modernization is needed (e.g., converting `var` to `const`/`let`, callbacks to `async`/`await`, CommonJS to ESM).

## Workflow
1. **Perceive (Environment Awareness):**
   - Check `package.json` for `"type": "module"` (ESM vs CJS) and `engines` field for Node.js version constraints.
   - Inspect ESLint / Biome configuration to identify the project's `ecmaVersion` and coding conventions.
   - Determine runtime target: browser (check for DOM APIs, bundler config like `vite.config.js`, `webpack.config.js`) vs Node.js (check for `node:` imports, `process`, `fs`).
   - Detect JavaScript embedded in HTML (`*.html`) or Razor views (`*.cshtml`): identify inline `<script>` blocks and external `<script src="...">` references. For `.cshtml` files, note the interplay with Razor syntax (`@` directives, `@section Scripts`).
   - Identify the effective ES version upper limit based on the runtime/transpiler configuration (e.g., Babel targets, TypeScript `target`, browserslist). For inline scripts without a build pipeline, default to the browser's native ES support.
2. **Reason (Planning Phase):**
   - Evaluate the modernization level of the current code to determine the refactoring strategy.
   - In environments targeting older runtimes (e.g., IE11 via Babel), avoid using features without polyfill support, but prioritize using `const`/`let`, arrow functions, and template literals.
   - In modern environments (Node.js 20+, modern browsers), actively adopt new features to reduce boilerplate code.
   - Distinguish between browser-specific concerns (DOM, Web APIs) and Node.js-specific concerns (file system, streams, worker threads).
3. **Act (Execution Phase):**
   - Write high-quality code using modern syntax to improve readability and maintainability.
   - Implement immutable data patterns (spread operators, `Object.freeze`, `structuredClone`, immutable array methods).
   - Utilize `async`/`await` and `Promise` composition for asynchronous operations.
   - Prefer ESM (`import`/`export`) over CommonJS (`require`/`module.exports`).
4. **Validate (Standard Validation):**
   - Validate strict equality (`===`) usage and absence of `var` declarations.
   - Check if asynchronous operations correctly handle errors (`try`/`catch` around `await`, `.catch()` on Promises).
   - Ensure code avoids common security pitfalls (no `eval()`, no prototype pollution, no `innerHTML` with unsanitized input).
   - Verify naming conventions follow community standards (camelCase for variables/functions, PascalCase for classes).

## Feature Roadmap (ES6 - ES2025+)

### ES6 & ES2016-ES2019 (Origin)
- **Arrow Functions:** `(a, b) => a + b` concise function syntax with lexical `this` binding.
- **`let` / `const`:** Block-scoped variable declarations replacing `var`.
- **Template Literals:** `` `Hello, ${name}!` `` for string interpolation and multi-line strings.
- **Destructuring:** `const { id, name } = user;` extract values from objects and arrays.
- **Default / Rest / Spread:** Default parameters, `...rest` parameters, and `...spread` for arrays/objects.
- **Classes:** `class` syntax for prototype-based inheritance with `constructor`, `extends`, and `super`.
- **Promises:** `new Promise((resolve, reject) => ...)` for asynchronous flow control.
- **Modules:** `import` / `export` for modular code organization (ES Modules).
- **Symbol / Map / Set:** New primitive type and collection data structures.
- **Generators & Iterators:** `function*` and `for...of` for lazy iteration.
- **`async` / `await` (ES2017):** Syntactic sugar for Promise-based asynchronous code.
- **Object.values / Object.entries (ES2017):** Iterate over object values and key-value pairs.
- **Rest / Spread Properties (ES2018):** `{ ...obj }` for object shallow cloning and rest extraction.
- **`Promise.finally` (ES2018):** Execute cleanup logic regardless of fulfillment or rejection.
- **Async Iteration (ES2018):** `for await...of` for consuming async iterables.
- **`Array.flat` / `flatMap` (ES2019):** Flatten nested arrays and map-then-flatten in one step.
- **`Object.fromEntries` (ES2019):** Convert key-value pairs back into an object.
- **Optional Catch Binding (ES2019):** `catch { }` without requiring the error parameter.

### ES2020 & ES2021 (Foundation)
- **Optional Chaining (`?.`):** Safely access deeply nested properties without manual null checks.
- **Nullish Coalescing (`??`):** Provide defaults only for `null`/`undefined`, unlike `||` which also catches `0`, `""`, `false`.
- **`BigInt`:** Arbitrary-precision integer arithmetic via `123n` literal syntax.
- **`Promise.allSettled()`:** Wait for all promises to complete regardless of rejection.
- **`globalThis`:** Universal reference to the global object across all environments.
- **Dynamic `import()`:** Load modules conditionally or lazily at runtime.
- **Logical Assignment (`&&=`, `||=`, `??=`):** Combine logical operators with assignment for concise state updates.
- **`String.prototype.replaceAll()`:** Replace all occurrences without regex.
- **`Promise.any()`:** Resolve with the first fulfilled promise, reject only if all reject.
- **Numeric Separators:** `1_000_000` for readable large numbers.

### ES2022 & ES2023 (Productivity)
- **Top-level `await`:** Use `await` directly in ESM modules without wrapping in an async function.
- **Error Cause (`{ cause }`):** Chain errors to preserve root cause context.
- **`Array.at()`:** Negative indexing for arrays, e.g., `arr.at(-1)` for the last element.
- **`Object.hasOwn()`:** Safer, prototype-independent property check replacing `hasOwnProperty`.
- **Class Fields:** Public and private (`#field`) instance fields and methods.
- **RegExp Match Indices (`/d` flag):** Get start/end positions of captured groups.
- **Immutable Array Methods:** `toSorted()`, `toReversed()`, `toSpliced()`, `with()` — return new arrays without mutation.
- **`Array.findLast()` / `findLastIndex()`:** Search arrays from the end.
- **Hashbang Grammar:** `#!/usr/bin/env node` support in JavaScript files.

### ES2024 & ES2025+ (Cutting Edge)
- **`Promise.withResolvers()`:** Destructure `{ promise, resolve, reject }` for cleaner deferred patterns.
- **`Object.groupBy()` / `Map.groupBy()`:** Group array elements by a classifier function.
- **`Atomics.waitAsync()`:** Non-blocking wait for shared memory operations.
- **Set Methods:** `union()`, `intersection()`, `difference()`, `symmetricDifference()`, `isSubsetOf()`, `isSupersetOf()`, `isDisjointFrom()`.
- **Iterator Helpers:** `.map()`, `.filter()`, `.take()`, `.drop()`, `.flatMap()`, `.toArray()` on iterators.
- **`RegExp.escape()`:** Safely escape special characters for use in RegExp construction.
- **Import Attributes:** `import data from './data.json' with { type: 'json' }`.
- **Decorators (Stage 3):** Class and method decorators for cross-cutting concerns.
- **Explicit Resource Management (Stage 3):** `using` keyword with `Symbol.dispose` for deterministic cleanup.

## Coding Standards
- **Variable Declarations:** Always use `const` by default; use `let` only when reassignment is necessary. Never use `var`.
- **Modules:** Use ESM (`import`/`export`) as the default module system. Use `import()` for dynamic/lazy loading.
- **Immutability:** Prefer non-mutating array methods (`toSorted`, `toReversed`, `with`), spread operators, and `structuredClone` for deep copies.
- **Async Safety:** Always wrap `await` in `try`/`catch` or chain `.catch()`. Never leave Promises unhandled. Use `AbortController` for cancellable operations.

## Deliver
- **Runtime-Optimized Code:** Provide the most appropriate modern syntax code based on the target runtime and ES version.
- **Modernization Insights:** Provide specific refactoring suggestions for upgrading from older JavaScript syntax to new features (e.g., from callbacks to `async`/`await`, from `var` to `const`/`let`).
- **Syntax Explanations:** Clearly explain the design intent and advantages behind the modern JavaScript features used.

## Validate
- Ensure the provided code complies with the syntax specifications of the target ES version and runtime.
- Validate whether the code follows JavaScript best practices for error handling, null safety, and immutability.
- Confirm the code has good readability and modern conventions (e.g., proper use of destructuring, template literals, ESM).

## Documentation
### Official References
- [ECMAScript 2025 Language Specification](https://tc39.es/ecma262/)
- [TC39 Proposals (Stage 3+)](https://github.com/tc39/proposals/blob/main/README.md)
- [MDN Web Docs - JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
- [Node.js ES Modules Documentation](https://nodejs.org/api/esm.html)

### Internal References
- [JavaScript Coding Style and Naming Conventions Guide](reference/coding-style.md)
- [JavaScript Anti-Patterns and Best Practices](reference/anti-patterns.md)
- [Modern JavaScript Patterns Guide](reference/patterns.md)
