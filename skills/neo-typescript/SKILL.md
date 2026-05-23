---
name: neo-typescript
description: >
  Use this skill when asked to write, review, debug, or architect TypeScript code, configure tsconfig.json compiler options, resolve ESM/CJS interop issues, optimize generics, or apply advanced conditional, mapped, and template literal type operators. Trigger even if the user just asks generic TS compiler or type compatibility questions.
license: MIT
metadata:
  author: ant-gravity-devs
  version: "1.0.0"
---

# Neo TypeScript Expert Skill

This skill guides the AI Agent to write code that adheres to the strictest type safety, high maintainability, and advanced meta-programming flexibility, while thoroughly preventing runtime issues such as ESM/CJS interoperability pitfalls.

## 💡 Gotchas
*   **Aliasing Writable Reference Bypasses Readonly**: In TypeScript, `readonly` only restricts the assignment to the property itself. The internal members of the referenced object/array remain mutable. Furthermore, a readonly object can be assigned to a writable alias, which completely bypasses compiler readonly checks.
*   **Fatal Crash via Partial esModuleInterop**: Enabling `allowSyntheticDefaultImports` without `esModuleInterop` allows code to pass compile-time type checks but causes an immediate runtime crash (TypeError: default is not a function) due to the lack of `__importDefault` emit helpers in transpile output.
*   **Double Default Trap for Library Creators**: Using `export default` in libraries forces Node.js ESM consumers to call `.default()` to access the module. The golden standard is to completely abandon `export default` and adopt `export =` or named exports instead.

## 📋 Static Code & Type Safety Review SOP

When asked to write, modify, refactor, or review TypeScript code, strictly execute the following workflow:

### Step 1 — Project Environment Perception (Perceive)
1. Inspect the project's `tsconfig.json` settings, focusing specifically on the configuration of `"strict": true`, `"strictNullChecks"`, and `"strictFunctionTypes"`.
2. Identify the target module format and resolution mechanism (`"moduleResolution"`).

### Step 2 — Core Type Routing (Reason)
Based on the specific technical domain of the task, **progressively disclose** and load the corresponding reference files in the skill. Do not load all files at once to save context token space:
*   **Basics, Narrowing, Classes, & Function Design** ➡️ Load [type-system-basics.md](references/type-system-basics.md)
*   **Generic Constraints, Variance, & Advanced Types from Types** ➡️ Load [advanced-meta-types.md](references/advanced-meta-types.md)
*   **Structural Compatibility, Decorators, & ESM/CJS Interop** ➡️ Load [compatibility-and-interop.md](references/compatibility-and-interop.md)

### Step 3 — Precise Code Generation & Review (Act)
1. Ensure all generated or modified code strictly adheres to the loaded reference guidelines (e.g., never declare optional callback parameters, ensure generic type parameters appear at least twice to establish correlation).
2. For advanced type generation, recommend clear unit test assertions based on the evals configuration.

---

## 🛠️ Available Resources (Relative Paths)
*   [Type System Basics Guide](references/type-system-basics.md)
*   [Advanced Meta Types Guide](references/advanced-meta-types.md)
*   [Compatibility and Interop Guide](references/compatibility-and-interop.md)
