# Core Code Style Conventions for Vue 3

This document is extracted from the official Vue Style Guide, incorporating essential rules from Priority A (Essential) and Priority B (Strongly Recommended). When authoring Vue components and applications, it is imperative to adhere strictly to these conventions.

## 1. Naming Conventions

### 1.1 Component Naming
- **Multi-word component names**: Component names must consist of multiple words to prevent conflicts with future HTML tags (exceptions include the root `App` component and built-in components like `<transition>`).
  - ✅ `TodoItem`, `UserProfile`
  - ❌ `Todo`, `User`
- **Single-File Component (SFC) filename casing**: Filenames should consistently use **PascalCase** (preferred) or kebab-case.
  - ✅ `MyComponent.vue`
- **Base component names**: Base, stateless, or purely presentational components should begin with a specific prefix such as `Base`, `App`, or `V`.
  - ✅ `BaseButton.vue`, `BaseIcon.vue`, `AppTable.vue`
- **Single-instance component names**: Components that appear only once per page (e.g., navigation bars, sidebars) should use `The` as a prefix.
  - ✅ `TheHeader.vue`, `TheSidebar.vue`
- **Tightly coupled component names**: If a child component is tightly coupled with its parent, the child's name should use the parent's name as a prefix.
  - ✅ `TodoList.vue` -> `TodoListItem.vue` -> `TodoListItemButton.vue`

### 1.2 Component and Tag Syntax in Templates
- **Components in SFCs and string templates**: Always use **PascalCase** and ensure they are self-closing.
  - ✅ `<MyComponent />`
- **Components in DOM templates**: Must use kebab-case.
  - ✅ `<my-component></my-component>`

## 2. Properties and Data Flow (Props & Data Flow)

### 2.1 Prop Definitions
- **Detailed prop definitions**: The `type` must be explicitly specified. It is strongly recommended to provide `required` or `default` values, and include a `validator` when necessary.
  ```typescript
  // ✅ Good
  props: {
    status: {
      type: String,
      required: true,
      validator: (value: string) => ['syncing', 'synced', 'error'].includes(value)
    }
  }
  ```

## 3. Template Syntax and Structure

### 3.1 Directive Shorthands
- Consistently use directive shorthands; do not mix full syntax with shorthands.
  - `v-bind:` should be `:`
  - `v-on:` should be `@`
  - `v-slot:` should be `#`

### 3.2 Component Style Scoping
- Unless global styles are explicitly required, the `<style>` tag within an SFC should generally include the `scoped` attribute, or utilize CSS Modules (`<style module>`) to prevent global style pollution.
- Avoid using element selectors with `scoped` styling as it can impact performance. Prefer class selectors.
  ```vue
  <!-- ✅ Good -->
  <style scoped>
  .btn-close {
    background-color: red;
  }
  </style>
  
  <!-- ❌ Bad -->
  <style scoped>
  button {
    background-color: red;
  }
  </style>
  ```

## 4. Quoted Attribute Values
- **Non-empty HTML attribute values** should always be enclosed in quotes (single or double, choosing the one not used in the surrounding JavaScript).
  ```vue-html
  <!-- ✅ Good -->
  <input type="text">
  <AppSidebar :style="{ width: sidebarWidth + 'px' }">
  
  <!-- ❌ Bad -->
  <input type=text>
  <AppSidebar :style={width:sidebarWidth+'px'}>
  ```

## 5. Simple Expressions in Templates
- **Component templates should only contain simple expressions.** More complex logic should be refactored into computed properties or methods.
  ```vue-html
  <!-- ✅ Good -->
  {{ normalizedFullName }}
  
  <!-- ❌ Bad -->
  {{
    fullName.split(' ').map((word) => {
      return word[0].toUpperCase() + word.slice(1)
    }).join(' ')
  }}
  ```

## 6. Order of Options and Attributes
- **Component/instance options should be ordered consistently.** (e.g., `name` -> `components` -> `props` -> `emits` -> `setup` -> `computed` -> `watch` -> lifecycle hooks -> `methods` -> `template`).
- **Attributes of elements should be ordered consistently.** (e.g., `is` -> `v-for` -> `v-if`/`v-show` -> `id` -> `ref`/`key` -> `v-model` -> other attributes -> `v-on` -> `v-html`/`v-text`).