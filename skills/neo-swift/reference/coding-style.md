# Swift Coding Conventions

This guide follows Apple's official [API Design Guidelines](https://swift.org/documentation/api-design-guidelines/) to ensure code is readable, maintainable, and "Swifty."

## 1. Naming Conventions

### 1.1 Capitalization
- **Types and Protocols**: Use `PascalCase` (e.g., `UserData`, `NetworkManager`).
- **Variables, Properties, and Methods**: Use `lowercamelCase` (e.g., `userName`, `fetchData()`).
- **Enums**: Use `lowercamelCase` for cases (e.g., `case success(String)`).

### 1.2 Clarity Over Brevity
- **Grammatical Usage**: Method names should read like English phrases.
  - `list.insert(x, at: i)` instead of `list.put(x, i)`.
- **Protocols**: 
  - Protocols that describe *what* something is should be nouns (e.g., `Collection`).
  - Protocols that describe a *capability* should end in `-able` or `-ible` (e.g., `Equatable`, `Codable`).

---

## 2. Code Organization

- **Extensions**: Use `extension` to group protocol conformance or logical chunks of code.
- **Access Control**: Be explicit with `private`, `fileprivate`, `internal` (default), and `public`. Use `private(set)` for properties that should be read-only from the outside.
- **File Structure**: Prefer one primary type per file.

---

## 3. Idiomatic Swift

### 3.1 Type Inference
- Let the compiler infer types when the meaning is obvious.
  - `let names = [String]()` is preferred over `let names: [String] = []`.

### 3.2 Closures
- Use **Trailing Closure Syntax** whenever a closure is the last argument.
  - `UIView.animate(withDuration: 0.3) { ... }`

### 3.3 Structs vs. Classes
- **Default to Structs**: Use `struct` for data models and state.
- **Use Classes**: Only when you need identity, inheritance, or `deinit` logic.

---

## 4. Error Handling

- **Guard**: Use `guard` to exit early from functions, reducing indentation.
- **Optional Binding**: Use `if let` or `guard let` instead of `!` (force unwrap).
- **Throws**: Use `throws` for recoverable errors and `Result` for asynchronous error passing in legacy Swift (5.5+ prefers `async throws`).

---

## 5. Documentation

- **Triple Slash**: Use `///` for documentation comments. This enables Quick Help in Xcode.
- **Parameters**: Document parameters and return values using `- Parameters:` and `- Returns:`.
