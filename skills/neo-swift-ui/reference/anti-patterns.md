# SwiftUI Anti-Patterns and Best Practices

## 1. The "God View"
**Problem**: A single view contains excessive functionality, leading to a `body` that exceeds 100 lines.
**Impact**: Code becomes difficult to maintain, and performance decreases during re-rendering.
**Recommendation**: Split the view into smaller, single-responsibility `struct` views.

## 2. In-View Logic
**Problem**: Writing complex conditional logic, mathematical calculations, or network calls within `body` or View Modifiers.
**Impact**: View rendering becomes unstable and difficult to unit test.
**Recommendation**: Move logic to a ViewModel (traditional projects) or Model (projects using `@Observable`).

## 3. Excessive use of `AnyView`
**Problem**: Frequently using `AnyView` to erase types.
**Impact**: SwiftUI cannot optimize the view tree, leading to significant rendering performance issues.
**Recommendation**: Prioritize the use of `@ViewBuilder`, `Group`, or `if-else`.

```swift
// Bad
func content() -> AnyView {
    if isTrue {
        return AnyView(Text("True"))
    } else {
        return AnyView(Circle())
    }
}

// Good
@ViewBuilder
func content() -> some View {
    if isTrue {
        Text("True")
    } else {
        Circle()
    }
}
```

## 4. Forced Unwrapping in `body`
**Problem**: Using `!` to force unwrap optional types within `body`.
**Impact**: The application will crash directly when rendering an incomplete state.
**Recommendation**: Always use `if let` or `guard let` (within helper functions) to provide safe fallback content.

## 5. Unnecessary `@State` Updates
**Problem**: Modifying `@State` during the view rendering process (Side Effect).
**Impact**: Leads to update cycles or infinite loop crashes.
**Recommendation**: Only modify state when triggered by actions (e.g., `.onAppear`, `onTapGesture`).

## 6. Deprecated Navigation Patterns
**Problem**: Still using `NavigationView` in iOS 16+ projects.
**Impact**: Lacks support for modern data-driven navigation.
**Recommendation**: Fully migrate to `NavigationStack` and `NavigationPath`.
