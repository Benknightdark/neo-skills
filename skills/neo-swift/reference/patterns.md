# Modern Swift Patterns Guide

This document covers recommended architectural and language patterns for Swift 5.0 through 6.0+.

## 1. Structured Concurrency (Swift 5.5+)

### 1.1 Async/Await
Replace completion handlers with `async` functions for linear, readable code.
```swift
func fetchUser() async throws -> User {
    let data = try await network.request(url)
    return try JSONDecoder().decode(User.self, from: data)
}
```

### 1.2 Task Groups and `async let`
Run multiple tasks in parallel safely.
```swift
async let avatar = downloadImage(id: 1)
async let profile = fetchProfile(id: 1)
let result = try await User(profile: profile, image: avatar)
```

---

## 2. State Management

### 2.1 Property Wrappers
Encapsulate logic for reuse across properties.
```swift
@propertyWrapper
struct Trimmed {
    private var value: String = ""
    var wrappedValue: String {
        get { value }
        set { value = value.trimmingCharacters(in: .whitespacesAndNewlines) }
    }
}
```

### 2.2 Observability (Swift 5.9+)
Using the `@Observable` macro instead of `ObservableObject` for more efficient UI updates in SwiftUI.

---

## 3. Protocol-Oriented Programming (POP)

### 3.1 Protocol Extensions
Provide default implementations to protocols.
```swift
protocol Validatable {
    var isValid: Bool { get }
}

extension Validatable {
    var isValid: Bool { return true } // Default implementation
}
```

### 3.2 Opaque Return Types
Return a type that conforms to a protocol without exposing the concrete type.
```swift
func makeView() -> some View { ... }
```

---

## 4. Swift 6 Concurrency Safety

### 4.1 Actors
Protect mutable state from data races.
```swift
actor Counter {
    private var value = 0
    func increment() { value += 1 }
}
```

### 4.2 Sendable
Ensure types can be safely passed between concurrent contexts.
```swift
struct Message: Sendable {
    let text: String
}
```

---

## 5. UI Architecture: MVVM

Decouple business logic from View layers (SwiftUI or UIKit).
- **Model**: Data structures (`struct`).
- **ViewModel**: Logic handler (`class` with `@Published` or `@Observable`).
- **View**: UI declaration.
