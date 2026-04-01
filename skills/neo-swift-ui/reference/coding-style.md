# SwiftUI Coding Style and Naming Conventions

## View Declaration
- **View Name**: Should use `PascalCase` and be named after its functionality (e.g., `UserProfileView.swift`).
- **Structs over Classes**: Views should always be defined as `struct` and conform to the `View` protocol.

## View Body Structure
- **Keep `body` Clean**: The `body` should not contain complex calculation logic, network requests, or data processing.
- **Sub-view Deconstruction**:
  - When the `body` exceeds 30-50 lines, it should be considered for splitting into independent sub-views.
  - Prioritize using `struct` sub-views over computed properties (`var subview: some View`).

## View Modifier Ordering
The order of modifiers affects the rendering result. Follow this logical sequence:
1. **Layout**: `frame`, `padding`, `layoutPriority`.
2. **Effects**: `background`, `border`, `shadow`, `clipShape`, `opacity`.
3. **Interaction**: `onTapGesture`, `onHover`.
4. **Positioning**: `offset`, `position`.

```swift
// Good
Text("Hello")
    .frame(maxWidth: .infinity) // 1. Layout
    .background(Color.blue)    // 2. Effects
    .onTapGesture { ... }      // 3. Interaction

// Bad
Text("Hello")
    .background(Color.blue)    // The background will follow the text only, not the frame
    .frame(maxWidth: .infinity)
```

## State Management Naming
- **Private State (@State)**: Should be marked as `private`.
- **Two-way Binding (@Binding)**: Should be clearly named, reflecting the data it represents rather than the UI behavior.

## Preview Patterns (iOS 17+)
- Always use the `#Preview` macro for view development.
- Provide mock data and ensure testing for Dark Mode and Dynamic Type.

```swift
#Preview {
    UserProfileView(user: User.mock)
        .preferredColorScheme(.dark)
}
```
