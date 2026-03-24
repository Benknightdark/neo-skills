---
name: swift-ui
version: "1.0.0"
category: "UI Framework"
description: "SwiftUI 專家技能 (iOS 16.0+)。支援從宣告式 UI 基礎到 iOS 18+ 的現代開發模式，涵蓋 NavigationStack、Observation 框架、資料流架構及高效能視圖設計。"
compatibility: "Requires iOS 16.0+, Swift 5.0+. Adaptive to modern iOS, iPadOS, and macOS SwiftUI development."
---

# Modern SwiftUI (iOS 16+) Expert Skill

## Trigger On
- The user asks to write, debug, refactor, or review SwiftUI code.
- The target project version is iOS 16 or higher (utilizing features like `NavigationStack`, `Grid`, etc.).
- Development involves state management (`@State`, `@Observable`), custom layouts, or animations.

## Workflow
1. **Perceive (Version and Environment Awareness):**
   - Confirm if the deployment target is iOS 16+.
   - Identify the current state management paradigm (traditional `ObservableObject` vs. modern `@Observable`).
   - Assess the usage of navigation components (check if deprecated `NavigationView` is still in use).
2. **Reason (Planning Phase):**
   - Plan the view hierarchy to maximize reusability and minimize redundant `body` computations.
   - Enforce the use of `NavigationStack` or `NavigationSplitView` for navigation needs.
   - Select the correct data flow tools based on data lifecycle (`State`, `Binding`, `Environment`).
3. **Act (Execution Phase):**
   - Follow SwiftUI core principles to write concise, declarative Swift code.
   - Use `Grid`, `ViewThatFits`, or custom `Layout` protocols to implement complex layouts.
   - Leverage modern modifiers (e.g., `.sheet` with `detents`).
4. **Validate (Standard Validation):**
   - Check for "God Views" (views with excessive logic or `body` content) and suggest splitting them.
   - Ensure `@State` and `@Binding` are used correctly to avoid unnecessary view refreshes.
   - Verify that the UI remains fluid and adheres to Apple's Human Interface Guidelines (HIG).

## Feature Roadmap (SwiftUI Evolution)

### iOS 13.0 - 15.0 (Foundation Era)
- **Declarative Syntax**: Core `View` protocol and `body` property.
- **State Management**: `@State`, `@Binding`, `@ObservedObject`, `@EnvironmentObject`.
- **Basic Containers**: `VStack`, `HStack`, `ZStack`, `List`.
- **Legacy Navigation**: `NavigationView` and `NavigationLink`.

### iOS 16.0 - 17.0 (Modern Era)
- **NavigationStack**: Decoupled and data-driven navigation pattern.
- **Observation Framework**: `@Observable` macro (Swift 5.9+) replacing `ObservableObject`.
- **Advanced Layouts**: `Grid`, `ViewThatFits`, and `Layout` protocol.
- **Swift Charts**: Native data visualization framework.

### iOS 18.0+ (Latest Features)
- **SwiftUI Animations**: New phase-based and keyframe-based animation APIs.
- **Interaction Enhancements**: Improved Scroll View controls and gesture handling.

## Coding Standards
- **Declarative Style**: Keep the view tree structure clear and avoid writing complex logic within `body`.
- **Modularity**: Split subviews into independent `structs` instead of computed properties.
- **Preview Guidelines**: Use the `#Preview` macro for rapid development, testing across multiple environment settings (Dark Mode, different locales).
- **Type Safety**: Prefer strongly typed navigation paths and environment keys.

## Deliver
- **Version-Optimized Code**: Provide code utilizing iOS 16+ features (e.g., `NavigationStack`, `presentationDetents`).
- **Modular View Components**: Deconstruct large views into single-responsibility, reusable components.
- **Modern State Management**: Prioritize the `@Observable` pattern for projects supporting Swift 5.9+.

## Validate
- Ensure code compiles without warnings and uses the best available APIs for the target version.
- Validate view `body` execution efficiency, ensuring no side effects are included.
- Confirm that data flow follows the unidirectional flow principle whenever possible.

## Documentation
### Official References
- [SwiftUI Documentation](https://developer.apple.com/documentation/swiftui/)
- [Human Interface Guidelines (Layout)](https://developer.apple.com/design/human-interface-guidelines/layout)

### Internal References
- [SwiftUI Coding Style and Naming Conventions](reference/coding-style.md)
- [SwiftUI Anti-Patterns and Best Practices](reference/anti-patterns.md)
- [Modern SwiftUI Patterns Guide](reference/patterns.md)
