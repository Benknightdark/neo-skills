# Swift Anti-Patterns & Best Practices

This document highlights common pitfalls in Swift development and the recommended ways to avoid them.

## 1. Memory Management

### 1.1 Avoid Retain Cycles (Strong Reference Cycles)
**Problem**: Two objects holding strong references to each other will never be deallocated, causing a memory leak.

- **Bad**:
  ```swift
  class Client {
      var onComplete: (() -> Void)?
      func start() {
          onComplete = { self.doSomething() } // Retain cycle
      }
  }
  ```
- **Good**:
  ```swift
  onComplete = { [weak self] in 
      self?.doSomething() 
  }
  ```

### 1.2 Avoid `unowned` for Async Work
**Problem**: `unowned` assumes the object will always exist. If the object is deallocated before the async work finishes, the app will crash.
- **Best Practice**: Use `weak` for closures that might outlive their context.

---

## 2. Optionals

### 2.1 Avoid Force Unwrapping (`!`)
**Problem**: Force unwrapping a `nil` value causes an immediate runtime crash.

- **Bad**: `let url = URL(string: str)!`
- **Good**: `guard let url = URL(string: str) else { return }`

### 2.2 Avoid Implicitly Unwrapped Optionals
- **Problem**: Variables like `var name: String!` are dangerous because they hide the possibility of `nil`.
- **Exception**: IBOutlets in iOS development are a standard exception.

---

## 3. UI Patterns (App Context)

### 3.1 Avoid Massive View Controller
**Problem**: Putting all networking, business logic, and UI code in a single `UIViewController`.
- **Best Practice**: Use **MVVM** or **Clean Architecture** to separate concerns.

### 3.2 Avoid Hardcoded Strings
- **Best Practice**: Use `NSLocalizedString` for text and Enums for identifiers (like Segue IDs or Cell IDs).

---

## 4. Concurrency

### 4.1 Avoid `Thread.sleep` or Busy Waiting
- **Best Practice**: Use `Task.sleep(nanoseconds:)` in Swift Concurrency or dispatch queues.

### 4.2 Avoid Main Thread Blocking
- **Problem**: Performing heavy I/O or network requests on `DispatchQueue.main`.
- **Best Practice**: Use `Task` or `background` queues, then switch back to `main` only for UI updates.

---

## 5. General Design

### 5.1 Avoid Overusing Singletons
**Problem**: Global state makes unit testing difficult and creates hidden dependencies.
- **Best Practice**: Use **Dependency Injection** to pass services to objects.

### 5.2 Avoid String-based APIs
- **Best Practice**: Prefer Type-safe APIs. For example, use `Codable` for JSON instead of manually parsing `[String: Any]`.
