# TypeScript Type System Basics Reference

This document serves as the foundational guide for the `neo-typescript` skill, covering type system basics, everyday types, control flow analysis for narrowing, and fundamental function and class design specifications.

---

## 1. Static Compilation & Core Mechanics (The Basics)

*   **Non-exception Failures**: TypeScript elevates runtime-silent JavaScript failures (such as typos, uncalled functions like `Math.random < 0.5`, or dead logic) to compile-time errors.
*   **Type Erasure**: All type annotations, interfaces, and type aliases are **100% erased** during transpilation to JavaScript. The type system has absolutely zero footprint or effect on runtime behavior.
*   **Downleveling**: `tsc` automatically transpiles modern ECMAScript features to older versions (e.g., ES5, ES6) based on the `"target"` configuration in `tsconfig.json`.
*   **Strictness Flags**: Enabling `"strict": true` turns on core defensive flags, including `noImplicitAny` (disallows implicit any) and `strictNullChecks` (treats Null and Undefined as independent types).

---

## 2. Everyday Type Guidelines (Everyday Types)

*   **Primitive Types**: Always use lowercase `string`, `number`, and `boolean`. **Never** use uppercase wrapper objects like `String`, `Number`, or `Boolean` as they represent wrapper objects and invite type compatibility bugs.
*   **Contextual Typing**: Anonymous functions placed in positions where TypeScript can infer their usage automatically type their arguments without manual annotations (e.g., `names.forEach(s => ...)` infers `s` as string).
*   **Type Alias vs. Interface Decision**:
    *   `interface`: Supports **declaration merging**. It features better compiler caching and is the preferred choice for defining object shapes.
    *   `type`: Cannot be merged once declared, but is ideal for union types, tuples, and mapped types.
*   **Literal Inference & `as const`**: Object literal properties are widened to their base types by default. To lock them as readonly and exact literal types, suffix the object with `as const`:
    ```ts
    const req = { url: "https://example.com", method: "GET" } as const;
    // req.method is strictly typed as "GET"
    ```

---

## 3. Control Flow Analysis & Narrowing

Type narrowing is the control flow analysis where the compiler traces program paths to deduce the most precise types at specific locations.

### Core Type Guards:
*   `typeof` guard: Beware of the historical JS quirk where `typeof null === "object"`.
*   Truthiness narrowing: Use `&&` or `!!` to filter out `null` or `undefined`.
*   Equality narrowing: Perform `===` or `!==` comparisons. *Tip*: `x != null` (loose inequality) filters out both `null` and `undefined` in one step.
*   `in` guard: Checks if a property exists on an object. Note that optional properties will still appear in both branches after narrowing.
*   `instanceof` guard: Checks instance constructors.

### User-Defined Type Predicates:
To encapsulate narrowing logic in helper functions, declare the return type as `parameterName is Type`:
```ts
function isFish(pet: Fish | Bird): pet is Fish {
  return (pet as Fish).swim !== undefined;
}
```

### Discriminated Unions & Exhaustiveness Checking:
Use a shared literal tag property (e.g., `kind`) across union members and perform exhaustiveness checking in `switch` blocks using `never` to ensure compiler warnings are raised when new members are added to the union:
```ts
const _exhaustiveCheck: never = shape;
```

---

## 4. High-Quality Function Design Rules (Functions)

*   **Call & Construct Signatures**: Parameter names are **mandatory** in function type expressions. Writing `(string) => void` creates a parameter named `string` with type `any`.
*   **Three Rules for Excellent Generics**:
    1.  **Push Type Parameters Down**: Use the type parameter directly in the signature to preserve the exactness of the return type.
    2.  **Ensure Type Parameters Appear at Least Twice**: If a parameter appears only once, it does not establish a correlation between values and should be replaced with a regular type annotation.
    3.  **Minimize Type Parameters**: Avoid introducing redundant type parameters that add no distinct constraints.
*   **Optional Parameter Callback Ban**:
    **Never** declare callback parameters as optional (e.g., `callback: (arg: T, index?: number) => void`). This forces callback implementors to write redundant `undefined` checks. Keep them required; JavaScript automatically discards extra arguments anyway.
*   **Relaxed void Assignability**: A callback function whose contextual type expects a `void` return is **allowed to return any other value** (which is safely ignored). This enables callbacks like `src.forEach(el => dst.push(el))` to compile successfully.

---

## 5. Classes & Nominal Simulation Basics (Classes)

*   **Parameter Properties**: Suffixing constructor arguments with access modifiers (like `public readonly x`) automatically declares them as instance fields and performs initialization, eliminating boilerplate code.
*   **this Parameter Annotation**: Declaring the first parameter as `this: ClassName` statically binds the call context, preventing runtime bugs when methods are assigned to variables and lose their `this` context.
*   **Nominal Simulation**: Structural typing only compares instance member shapes. However, if a class contains `private` or `protected` members, assignment compatibility strictly requires those members to originate from **"the exact same class declaration inheritance tree"**. Classes with identical shapes but different roots are rejected, simulating nominal safety.
