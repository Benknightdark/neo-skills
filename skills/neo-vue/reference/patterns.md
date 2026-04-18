# Vue 3 Architecture and Modern Patterns

This document defines the architectural guidelines for modern Vue 3 development, covering Composition API practices, Pinia state management principles, Vue Router configuration recommendations, and general best practices for building robust Vue applications.

## 1. Composition API and Script Setup

- **Prefer `<script setup>`**: All new Single-File Components (SFCs) must use the `<script setup>` syntax to achieve concise code, better runtime performance, and superior TypeScript support.
- **Reactivity**:
  - Prefer using `ref()` for defining both primitive types and objects to maintain consistency in how values are accessed (always via `.value`).
  - Only use `reactive()` when there is an explicit need to flatten an object's properties for reactivity without `.value`, or when integrating with external state systems that require it.
  - When returning state from composables, prefer returning an object of refs over a single reactive object to allow consumers to destructure without losing reactivity (or use `toRefs()`).
- **Props and Emits**:
  - Use `defineProps()` and `defineEmits()` to define component interfaces.
  - In TypeScript, it is strongly recommended to define them using pure type declarations:
    ```typescript
    const props = defineProps<{
      id: number;
      title?: string;
    }>();
    const emit = defineEmits<{
      (e: 'update', id: number): void;
    }>();
    ```
  - For default prop values with type-based declarations, utilize Reactive Props Destructure (Vue 3.5+) or `withDefaults()`.
- **Computed Properties (`computed`)**:
  - `computed` must be a pure function. Never generate side effects or mutate the original state inside a `computed` getter.
  - Avoid mutating the value returned by a computed property; treat it as read-only derived state.
  - Break down complex computed properties into multiple simpler computed properties for better readability and testability.
- **Logic Reuse (Composables)**:
  - Encapsulate complex business logic, state, and side effects into Composables (e.g., `useAuth()`, `useUser()`).
  - Composables should follow the naming convention of starting with `use`.
  - The return values of Composables should be destructured into `ref`s for external use.
  - Properly clean up side effects (like event listeners or timers) inside `onUnmounted()` within the composable.
  - Use `toValue()` (Vue 3.3+) to normalize arguments that can be either a value, a ref, or a getter.

## 2. State Management (Pinia)

- **Use Setup Stores**: When defining Pinia stores, use the Setup syntax (similar to Composition API) rather than the Options syntax. This provides better alignment with the Composition API mental model and allows the use of composables within stores.
  ```typescript
  export const useUserStore = defineStore('user', () => {
    const name = ref('Alice');
    const isAuthenticated = computed(() => !!name.value);
    function login(newName: string) {
      name.value = newName;
    }
    return { name, isAuthenticated, login };
  });
  ```
- **Separation of Concerns**: Stores should focus solely on maintaining global/shared state. Trivial logic related to UI interactions or component-local state should remain within the Components.

## 3. Routing Configuration (Vue Router)

- **Use Named Routes**:
  - During development, always prefer navigating using the route `name` rather than the `path`. This prevents broken links if URL paths are refactored in the future.
    ```typescript
    // ✅ Good
    router.push({ name: 'UserProfile', params: { id: 123 } });
    
    // ❌ Bad
    router.push(`/user/${id}`);
    ```
- **Route Guards**:
  - Place permission validation, authentication checks, and global interception logic in global `beforeEach` guards or route-specific guards, rather than handling them inside a component's `onMounted` lifecycle hook.

## 4. Component Communication

- **Props Down, Events Up**: Adhere to the one-way data flow principle. Parents pass data down via props, and children communicate changes back up by emitting events.
- **Avoid Implicit Communication**: Do not use `this.$parent` or attempt to directly mutate props. If a child needs to update a prop value, it must emit an event to request the parent to perform the mutation.
- **Two-Way Binding (`v-model`)**: Use `defineModel()` (Vue 3.4+) to easily create two-way bindings for components.

## 5. Performance Optimizations

- **Virtualize Large Lists**: For rendering massive lists, use list virtualization libraries (like `vue-virtual-scroller`) instead of rendering all DOM nodes upfront.
- **Stable Props**: Try to keep props passed to child components as stable as possible to prevent unnecessary re-renders.
- **`v-once` and `v-memo`**: Utilize `v-once` for static content that never updates, and `v-memo` (Vue 3.2+) for conditionally skipping updates in large sub-trees or `v-for` lists based on dependency arrays.
- **Shallow Reactivity**: Use `shallowRef()` and `shallowReactive()` when dealing with large immutable data structures where deep reactivity tracking overhead is undesirable.

## 6. Provide / Inject

- Use `provide` and `inject` to avoid "prop drilling" when passing data through deeply nested component trees.
- Keep mutations to reactive state inside the provider whenever possible. If an injector needs to update the data, the provider should also provide a function responsible for the mutation.
- Use `Symbol` keys for injection to avoid naming collisions in large applications.