---
name: neo-swift
version: "1.0.0"
category: "Language"
description: "Swift 專家技能 (5.0+)。支援從基礎語法到 Swift 6 的現代開發模式，涵蓋 SwiftUI、Structured Concurrency、記憶體安全以及高效能 App 開發指引。"
compatibility: "Supports Swift 5.0 through 6.0+. Adaptive to iOS, macOS, and Server-side Swift environments."
---

# Modern Swift (5.0+) Expert Skill

## Trigger On
- The user asks to write, debug, refactor, or review Swift code.
- The project directory contains `*.swift`, `Package.swift`, or `*.xcodeproj`.
- Development involves iOS (SwiftUI/UIKit), macOS, or Server-side Swift (Vapor).
- Code modernization is needed (e.g., migrating to Structured Concurrency or Swift 6 language mode).

## Workflow
1. **Perceive (Version Awareness):**
   - Identify the Swift version (e.g., check `Package.swift` or build settings).
   - Determine the platform (SwiftUI vs UIKit, Server vs App).
   - Assess dependency management (Swift Package Manager, CocoaPods).
2. **Reason (Planning Phase):**
   - Evaluate the use of modern syntax (e.g., `async/await`, `Result`, `@propertyWrapper`).
   - Decide on memory management strategies (ARC, `weak/unowned`).
   - For UI tasks, prioritize SwiftUI for modern apps or UIKit for legacy support.
3. **Act (Execution Phase):**
   - Write swifty, concise code following Apple's API Design Guidelines.
   - Implement type-safe and protocol-oriented solutions.
   - Leverage **Structured Concurrency** (`Task`, `async let`) for asynchronous operations.
4. **Validate (Standard Validation):**
   - Check for memory leaks (retain cycles) using capture lists.
   - Verify Swift 6 concurrency safety (data race detection).
   - Ensure naming conventions follow the standard `lowercamelCase` for members and `PascalCase` for types.

## Feature Roadmap (Swift 5.0 - 6+)

### Swift 5.0 - 5.4 (Foundation)
- **Result Type**: Standardized error handling.
- **Property Wrappers**: Encapsulating property logic (e.g., `@Published`).
- **Opaque Types**: Hiding implementation details (`some View`).
- **Result Builders**: DSL support for SwiftUI.

### Swift 5.5 - 5.10 (Modern Concurrency)
- **Async/Await**: Linear asynchronous code.
- **Actors**: Thread-safe state isolation.
- **Distributed Actors**: Communicating across processes.
- **Non-copyable Types**: Explicit control over object ownership.

### Swift 6+ (Safety & Performance)
- **Full Data Isolation**: Compile-time data race prevention.
- **Typed Throws**: Explicitly defining error types.
- **Embedded Swift**: Running Swift on restricted environments.

## Coding Standards
- **Conciseness**: Use trailing closures and shorthand argument names where appropriate.
- **Safety**: Prefer `if let` or `guard let` over force unwrapping (`!`).
- **Purity**: Prefer `struct` (Value Types) over `class` (Reference Types) for data models.
- **Concurrency**: Avoid `Thread.sleep` or legacy completion handlers; use structured concurrency.

## Deliver
- **Version-Optimized Code**: Provide code using the best features of the target Swift version.
- **SwiftUI/UIKit Insights**: Recommend patterns based on the UI framework used.
- **Concurrency Migration**: Provide strategies for moving to Swift 6 strict concurrency checks.

## Validate
- Ensure code compiles without warnings in the target Swift version.
- Validate that closure capture lists correctly handle object lifecycles.
- Confirm that error handling uses the `do-catch` or `throws` patterns correctly.

## Documentation
### Official References
- [Swift API Design Guidelines](https://www.swift.org/documentation/api-design-guidelines/)
- [The Swift Programming Language Guide](https://docs.swift.org/swift-book/documentation/the-swift-programming-language/)

### Internal References
- [Swift Coding Style and Naming Conventions](reference/coding-style.md)
- [Swift Anti-Patterns and Best Practices](reference/anti-patterns.md)
- [Modern Swift Patterns Guide](reference/patterns.md)
