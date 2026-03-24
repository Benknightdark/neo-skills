# Modern SwiftUI Patterns (iOS 16+)

## 1. View Composition (Small Views)
**Concept**: Splitting large UIs into multiple small views.
**Advantages**: Clearer code, easier testing, and reduced Swift compilation time.

```swift
struct UserCard: View {
    let user: User
    var body: some View {
        HStack {
            UserAvatar(imageName: user.avatar)
            UserInfoDetails(name: user.name, email: user.email)
        }
    }
}
```

## 2. Modern Observation (iOS 17+)
**Pattern**: Using the `@Observable` macro for state management.
**Features**: Eliminates the need for `@Published` annotations, automatically tracks properties, and provides better rendering performance.

```swift
@Observable
class AppState {
    var count = 0
}

struct CounterView: View {
    @State private var state = AppState()
    var body: some View {
        Button("Count: \(state.count)") { state.count += 1 }
    }
}
```

## 3. Custom View Modifiers
**Purpose**: Encapsulating common styles or behaviors (e.g., standard button styles).
**Advantages**: Provides a unified design language and reduces confusion within the view hierarchy.

```swift
struct BrandButtonModifier: ViewModifier {
    func body(content: Content) -> some View {
        content
            .padding()
            .background(Color.blue)
            .foregroundColor(.white)
            .clipShape(Capsule())
    }
}

extension View {
    func brandButtonStyle() -> some View {
        modifier(BrandButtonModifier())
    }
}
```

## 4. Modern Navigation (iOS 16+)
**Recommendation**: Use `NavigationStack` combined with path binding (`Path Binding`).
**Advantages**: Complete control over the navigation stack, supporting deep linking.

```swift
struct MainApp: View {
    @State private var path = NavigationPath()
    var body: some View {
        NavigationStack(path: $path) {
            List(Items) { item in
                NavigationLink(value: item) { Text(item.name) }
            }
            .navigationDestination(for: Item.self) { item in
                DetailView(item: item)
            }
        }
    }
}
```

## 5. ViewThatFits
**Purpose**: Automatically select the appropriate layout across different device sizes (e.g., iPhone mini vs. iPhone Pro Max).

```swift
ViewThatFits {
    HStack { ... } // Try first
    VStack { ... } // Fallback here if width is insufficient
}
```
