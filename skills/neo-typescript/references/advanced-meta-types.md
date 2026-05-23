# TypeScript Advanced Meta-Programming Reference

This document serves as the advanced meta-programming and type manipulation guide for the `neo-typescript` skill, covering generic variance, keyof/typeof, indexed access, conditional types, mapped types, and template literal type operations.

---

## 1. Generic Variance (Variance Annotations)

Type variance describes the relationship between `Box<Cat>` and `Box<Animal>` when `Cat` is a subtype of `Animal`.

*   **Covariance (out modifier)**:
    If `Box<T>` only acts as a **Producer** (e.g., only has `make(): T`), the relationship is co-directional (`Box<Cat>` is assignable to `Box<Animal>`). Declare with `out T`.
*   **Contravariance (in modifier)**:
    If `Box<T>` only acts as a **Consumer** (e.g., only has `consume(x: T): void`), the relationship is reversed (a consumer that handles all Animals can safely handle Cats). Declare with `in T`.
*   **Invariance (in out modifier)**:
    If a type acts as both producer and consumer, the relationship is bi-directionally locked.
*   > [!IMPORTANT]
     > TypeScript is a structural type system and automatically infers structural variance. **Manual `in`/`out` annotations are purely for compiler optimization and circular type debugging; they never alter basic structural comparison behavior**.

---

## 2. keyof & typeof Operators

*   **`keyof` Index Signature Behavior**:
    Returns a union of literal keys. Note that if an object contains an index signature, such as `Mapish = { [k: string]: boolean }`, `keyof Mapish` returns **`string | number`** (because JavaScript keys are coerced to strings).
*   **`typeof` Physical Limitations**:
    Captures the precise type of a value or property identifier. **Can only be used on identifiers (variable names, property paths)**. Never use `typeof` on function execution calls or dynamic expressions (e.g., `typeof func()` is invalid; use `typeof func` with `ReturnType` instead).

---

## 3. Indexed Access Types

*   `T[K]` lookup allows precise type querying in the type space.
*   **Element Capture**: Use `MyArray[number]` to extract the exact element object type from array or tuple literals.
*   **Lookup Limitations**: The index `K` **must be a type**. Never pass a runtime variable value. If you need to refer to a variable name, extract its type using `typeof` first: `Person[typeof key]`.

---

## 4. Conditional Types & infer Inference

Enables delayed type resolution and conditional branches via `T extends U ? X : Y`.

### Declarative Inference via `infer`:
Declare a new variable in the true branch of an `extends` comparison, allowing the compiler to automatically capture the type:
```ts
// Extract the resolved type of a Promise
type Await<T> = T extends Promise<infer U> ? U : T;

// Extract return type of a function
type GetReturnType<T> = T extends (...args: any[]) => infer R ? R : any;
```
> [!WARNING]
> When using `infer` to extract return types from overloaded functions, **TypeScript will infer from the very last overload signature (which is typically the most permissive, catch-all implementation)**.

### Distributive Conditional Types:
*   **Trigger Condition**: When a conditional type acts on a **bare type parameter** and a **union type** is passed as the argument, the conditional type automatically distributes across the union:
    `ToArray<string | number>` ➡️ `string[] | number[]`.
*   **Blocking Distribution (Non-distributive wrapping)**:
    To preserve the union as a whole, **wrap both sides of the comparison in square brackets `[]`**, which disrupts the bare type parameter status:
    ```ts
    type ToArrayNonDist<T> = [T] extends [any] ? T[] : never;
    // ToArrayNonDist<string | number> infers as (string | number)[]
    ```

---

## 5. Mapped Types & Modifier Operations

Mapped types construct new object types by iterating over a set of keys: `[P in keyof T]: T[P]`.

### Mapping Modifiers:
Add or remove `readonly` and `?` modifiers using `+` (optional) or `-` prefixes:
```ts
// Remove readonly, turning a readonly object into writable
type Mutable<T> = {
  -readonly [P in keyof T]: T[P];
};

// Remove optionality, forcing all properties to be implemented
type Concrete<T> = {
  [P in keyof T]-?: T[P];
};
```

### Key Remapping via `as`:
Use `as` to rename keys, exclude properties with `Exclude` and `never`, or iterate over arbitrary configuration unions:
```ts
// Rename keys: prefix with 'get' and capitalize the property name
type Getters<T> = {
  [P in keyof T as `get${Capitalize<string & P>}`]: () => T[P];
};

// Filter properties: exclude the 'kind' property
type OmitKind<T> = {
  [P in keyof T as Exclude<P, "kind">]: T[P];
};
```

---

## 6. Template Literal Types

Template literal types allow string interpolation. If a union type is placed inside the interpolation slot, TypeScript automatically performs a **Cartesian product expansion**:
```ts
type Lang = "en" | "ja";
type Event = "welcome" | "footer";
type LocaleID = `${Lang}_${Event}_id`;
```

### Strong-Typed Event Listener (Watched Object Pattern):
Combining template literals, generics, and indexed access enables a 100% type-safe event subscription source:
```ts
type PropEventSource<T> = {
  on<K extends string & keyof T>
    (eventName: `${K}Changed`, callback: (newValue: T[K]) => void): void;
};

// Used with makeWatchedObject to automatically infer newValue in callbacks
declare function makeWatchedObject<T>(obj: T): T & PropEventSource<T>;
```

### Intrinsic String Manipulation Types:
Built-in compiler helper types:
*   `Uppercase<T>`, `Lowercase<T>`, `Capitalize<T>`, `Uncapitalize<T>`.
