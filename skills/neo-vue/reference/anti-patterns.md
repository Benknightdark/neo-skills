# Vue 3 Anti-Patterns and Common Mistakes

This document lists common incorrect practices (Anti-Patterns) in Vue 3 (Composition API) development and provides the corresponding correct best practices to ensure code maintainability and performance.

## 1. Templates & Directives

### 1.1 Mixing `v-if` and `v-for` on the same element
**❌ Bad**:
When both exist on the same node, `v-if` has a higher priority than `v-for`. That means the `v-if` condition will not have access to variables from the scope of the `v-for`.
```vue-html
<!--
This will throw an error because property "todo"
is not defined on instance.
-->
<li v-for="todo in todos" v-if="!todo.isComplete">
  {{ todo.name }}
</li>
```

**✅ Good**:
Move `v-for` to a wrapping `<template>` tag or replace the list with a computed property that returns the filtered list.
```vue-html
<template v-for="todo in todos">
  <li v-if="!todo.isComplete">
    {{ todo.name }}
  </li>
</template>
```

### 1.2 Using Array Index as `key` in `v-for`
**❌ Bad**:
Using the index can lead to severe rendering errors or mixed-up component states when the order of the array elements changes (e.g., additions, deletions, sorting).
```vue-html
<li v-for="(item, index) in items" :key="index">
```

**✅ Good**:
Always use a unique and stable ID from your data.
```vue-html
<li v-for="item in items" :key="item.id">
```

## 2. Component Design & Data Flow

### 2.1 Mutating Props Directly
**❌ Bad**:
Props enforce a one-way data flow. Mutating them directly will cause Vue to emit warnings and break data synchronization between parent and child components.
```typescript
const props = defineProps<{ count: number }>();

function increment() {
  // Error: Cannot mutate a prop directly
  props.count++; 
}
```

**✅ Good**:
Notify the parent component to update via `emit`, or use `v-model` (paired with `defineModel` in Vue 3.4+).
```typescript
const count = defineModel<number>('count');

function increment() {
  // Correct: Two-way binding update via defineModel
  count.value++; 
}
```

### 2.2 Implicit Parent-Child Communication
**❌ Bad**:
Using `this.$parent` or modifying props directly to communicate state changes to the parent.
```javascript
function removeTodo() {
  const parent = instance.parent
  if (!parent) return

  parent.props.todos = parent.props.todos.filter((todo) => {
    return todo.id !== props.todo.id
  })
}
```

**✅ Good**:
Props down, events up. Emit an event to let the parent mutate the state.
```typescript
const emit = defineEmits(['delete']);

function removeTodo() {
  emit('delete');
}
```

## 3. State Management & Reactivity

### 3.1 Side Effects in `computed`
**❌ Bad**:
Computed properties should be pure functions. You must never mutate other states, call APIs, or manipulate the DOM inside them.
```typescript
const sortedList = computed(() => {
  // Error: Mutating external state
  isSorting.value = true;
  return list.value.slice().sort();
});
```

**✅ Good**:
If you need to produce side effects, use `watch` or handle them inside event handler functions. `computed` is strictly for returning a new value based on dependencies.
```typescript
const sortedList = computed(() => {
  return list.value.slice().sort();
});

watch(sortedList, () => {
  console.log('List was sorted!');
});
```

### 3.2 Abusing Provide / Inject for Global State
**❌ Bad**:
Stuffing large and frequently changing global states (like user info or configurations) into the root component's `provide`. This makes dependency tracking difficult and degrades performance.

**✅ Good**:
For global states that need to be shared across many different levels of components, use **Pinia**. Reserve `provide`/`inject` for developing specific UI component libraries or tightly scoped dependency injection.

## 4. DOM Manipulation & Styling

### 4.1 Direct DOM Manipulation (Bypassing Vue)
**❌ Bad**:
Using `document.querySelector` or manually manipulating DOM attributes breaks Vue's virtual DOM rendering mechanism.
```typescript
function focusInput() {
  document.getElementById('my-input')?.focus();
}
```

**✅ Good**:
Use Template Refs (`ref`) or `useTemplateRef` (Vue 3.5+) to obtain references to DOM elements.
```vue
<template>
  <input ref="my-input" />
</template>

<script setup lang="ts">
import { useTemplateRef } from 'vue';

const inputRef = useTemplateRef('my-input');

function focusInput() {
  inputRef.value?.focus();
}
</script>
```

### 4.2 Element Selectors with `scoped`
**❌ Bad**:
Using element selectors (e.g., `button`, `p`) in `<style scoped>` can cause performance issues because Vue injects attributes (like `data-v-xxx`) to elements to scope them. Element-attribute selectors are much slower than class-attribute selectors.
```vue-html
<template>
  <button>×</button>
</template>

<style scoped>
button {
  background-color: red;
}
</style>
```

**✅ Good**:
Prefer class selectors in scoped styles.
```vue-html
<template>
  <button class="btn-close">×</button>
</template>

<style scoped>
.btn-close {
  background-color: red;
}
</style>
```