# TypeScript Compatibility & Module Interoperability Reference

This document serves as the guide for type compatibility rules and module loading interoperability for the `neo-typescript` skill, covering structural compatibility, function parameter variance, decorator standards, and ESM/CJS interop rules.

---

## 1. Structural Compatibility & Parameter Variance (Type Compatibility)

TypeScript's type checking is based on a **structural type system**—compatibility is determined solely by the shape of the members.

### Function Parameter Bivariance:
*   *Type Theory*: Function parameter comparison should be **contravariant**. However, to support common JavaScript patterns (like event handlers and array covariance), TypeScript historically allows parameters to be bivariant by default.
*   **`strictFunctionTypes` Safety Valve**:
    Enabling `strictFunctionTypes: true` forces function parameters to undergo strict **contravariant** checks, eliminating runtime crashes where a parameter is too specialized.
*   **The Single Exemption: Method Shorthand**:
    > [!IMPORTANT]
    > To maintain compatibility with common OOP patterns, **under `strictFunctionTypes: true`, shorthand method declarations (e.g., `method(arg: T): void`) remain bivariant**.
    > Only property-based function signatures (e.g., `method: (arg: T) => void`) are subjected to strict contravariant checks!
    > For maximum type safety in libraries, prefer property-based function signatures.

---

## 2. New Stage 3 Decorators vs. Experimental

TypeScript 5.0 introduced native support for ECMAScript Stage 3 decorators, which differ fundamentally in architecture from the old legacy decorators:

### Core Comparison:

| Feature | Legacy Experimental Decorators (`experimentalDecorators: true`) | New Stage 3 Standard Decorators (TS 5.0+ Native) |
| :--- | :--- | :--- |
| **Parameters** | Receives `(target, propertyKey, descriptor)` | Receives `(value, context)` |
| **Mutation Behavior** | Directly **mutates** the passed descriptor object | **No mutation**. Returns a **brand new replacement function or value** |
| **Private Members** | **No support** for JavaScript private fields (`#field`) | **Full support** for private fields and private methods |
| **Metadata Dependency** | Relies heavily on `reflect-metadata` reflection | Relies on the TC39 standard context without metadata coupling |

*Standard Method Decorator Example*:
```ts
function loggedMethod<This, Args extends any[], Return>(
  target: (this: This, ...args: Args) => Return,
  context: ClassMethodDecoratorContext<This, (this: This, ...args: Args) => Return>
) {
  return function (this: This, ...args: Args): Return {
    console.log(`Calling method: ${String(context.name)}`);
    return target.call(this, ...args);
  };
}
```

---

## 3. ESM/CJS Interoperability & Dual Module Issues (Interop)

The most notorious and difficult-to-debug pain point in modern Node.js and bundler toolchains.

### 1. The Real Impact of `moduleResolution`:
*   `node16` / `nodenext`:
    Enforces strict Node.js native ESM rules: **relative ESM imports must include file extensions (e.g., `import "./add.js"` even if the source is `.ts`)**, and package.json exports conditional queries are strictly verified.
*   `bundler`:
    Designed for bundlers like Vite, Webpack, or esbuild. Allows omitting file extensions and resolving modules using bundler rules, bypassing strict Node.js runtime resolution limits.

### 2. `esModuleInterop` & `allowSyntheticDefaultImports` Emit Helpers:
Conflicts arise when an ES module attempts to `import` a pure CommonJS module (which lacks a `default` export and exposes a flat `module.exports` object).
*   **The Magic of `esModuleInterop: true`**:
    Enabling this flag causes `tsc` to inject `__importDefault` and `__importStar` emit helper wrappers in transpiled JS output.
    `__importDefault` checks if the imported module has `__esModule: true`. If not, it **automatically generates a `{ default: exports }` wrapper object**, enabling `import x from "x"` to successfully grab the CJS module.
*   **The Danger of Standalone `allowSyntheticDefaultImports`**:
    This flag only tells the **type checker** to assume the target has a synthetic default export.
    > [!CAUTION]
    > Enabling `allowSyntheticDefaultImports` without `esModuleInterop` is **extremely dangerous**!
    > The project will compile successfully, but it will **crash at runtime** with `TypeError: default is not a function` because the actual transpile output lacks the essential emit helpers. Always enable `esModuleInterop`.

---

## 4. Legacy Compatibility Features

*   **Enum Tree-Shaking Issues**:
    *   Standard Enums compile into immediate IIFE double-mapped objects. Bundlers cannot statically verify if the IIFE has side-effects, so **standard enums are never tree-shaken**.
    *   **Golden Solution**: Unless you need reverse mapping (value to key), **always prefer `const enum`**, which erases the IIFE and inlines constant values directly.
*   **Namespaces**:
    Legacy internal modules predating ES Modules. They compile into global scope mutations and should be avoided in modern codebases in favor of standard `import`/`export`.
*   **Mixins**:
    Emulated using generic class factory patterns `function Scale<TBase extends Constructor>(Base: TBase)` to simulate multiple inheritance behavior.
