---
name: neo-vue
version: "1.0.0"
category: "Core"
description: "Modern Vue 3 expert skill. Supports comprehensive applications from Composition API to Pinia and Vue Router, and strictly follows the official Vue Style Guide to ensure code quality and style consistency."
compatibility: "Supports Vue 3.x (Composition API), Pinia, and Vue Router 4. Adaptive to modern frontend build tools like Vite."
---

# Modern Vue 3 Expert Skill

## Trigger On
- The user asks to write, debug, refactor, or review Vue.js code.
- The project directory contains `*.vue`, `*.ts`/`*.js` files specifically importing Vue APIs, or Vue-related configuration files (e.g., `vite.config.ts`, `vue.config.js`).
- The user wants to implement state management using Pinia.
- The user wants to configure routing using Vue Router.
- The user asks for a code review on existing Vue code or architecture.

## Workflow
1. **Perceive (Environment Awareness):**
   - Inspect project configuration (`package.json`, `vite.config.ts`) to identify Vue version (Vue 3 vs Vue 2) and tooling (Vite, TypeScript, ESLint, Prettier).
   - Identify if the file is a Single-File Component (`.vue`), a composable (`useX.ts`), a store (`store.ts`), or router configuration.
   - Detect the presence of Pinia or Vue Router in the project dependencies.
2. **Reason (Planning Phase):**
   - Evaluate the modernization level of the current code. If Vue 2 Options API is used, plan for refactoring to Vue 3 Composition API with `<script setup>`.
   - Mentally load the rules from `references/coding-style.md` and `references/anti-patterns.md` to ensure component naming (PascalCase), structure, and reactivity are correct.
   - Mentally load the best practices from `references/patterns.md` to plan architecture, utilizing `ref` over `reactive`, and extracting logic into composables.
3. **Act (Execution Phase):**
   - Write high-quality, idiomatic Vue 3 code using `<script setup>` syntax.
   - Strictly follow component naming conventions (multi-word, `Base`/`The` prefixes) and structure (props validation, self-closing tags).
   - Implement state using Pinia Setup Stores and handle routing with Named Routes.
4. **Validate (Standard Validation):**
   - Validate that directive shorthands (`:`, `@`, `#`) are used consistently.
   - Check that `computed` properties are pure and free of side effects.
   - Ensure that props are not mutated directly.
   - Verify that arrays iterated with `v-for` have stable and unique `key`s, and `v-if` is not used on the same element as `v-for`.

## Feature Roadmap (Vue 3 Core Features)
- **Composition API:** `<script setup>` for clean, boilerplate-free component authoring.
- **Reactivity:** `ref`, `reactive`, `computed`, `watch`, and `watchEffect` for explicit state management.
- **Macros:** `defineProps`, `defineEmits`, `defineExpose`, `defineOptions`, `defineModel` (Vue 3.4+) for compiler-aware declarations.
- **Composables:** Extracting and reusing stateful logic across components (e.g., `useFetch`, `useAuth`).
- **Teleport:** Render components outside the main DOM hierarchy (e.g., for modals or tooltips).
- **Suspense:** Handle asynchronous dependencies in the component tree gracefully.
- **Pinia:** State management using Setup Stores instead of Vuex.
- **Vue Router 4:** Modern routing utilizing Composition API hooks (`useRouter`, `useRoute`).

## Coding Standards
- **Component Naming:** Always use multi-word PascalCase for `.vue` files and component references in templates (e.g., `TodoItem.vue`, `<TodoItem />`).
- **Setup Script:** ALWAYS use `<script setup>` for new Vue components. Use TypeScript (`lang="ts"`) where possible.
- **Reactivity:** Prioritize `ref` over `reactive` for local state to maintain consistency in accessing values via `.value`.
- **Props and Emits:** Define Props and Emits strictly with type annotations using `defineProps<{ ... }>()` and `defineEmits<{ ... }>()`.
- **CSS Scoping:** Use `<style scoped>` or CSS Modules to prevent global style leakage.

## Deliver
- **Modern Architecture:** Provide Vue 3 Composition API-based solutions utilizing modern features and TypeScript.
- **Refactoring Insights:** Provide actionable suggestions to upgrade legacy Options API code to Composition API or Vuex to Pinia.
- **Style Compliance:** Ensure all delivered code adheres to the official Vue Style Guide (Priority A & B).

## Validate
- Ensure the provided code complies with Vue 3 syntax and best practices.
- Validate the avoidance of common anti-patterns (e.g., mutating props, side-effects in `computed`, missing `key` in `v-for`).
- Confirm the code is robust, readable, and properly utilizes Vue's reactivity system.

## Documentation
### Official References
- [Vue 3 Documentation](https://vuejs.org/guide/introduction.html)
- [Vue Style Guide](https://vuejs.org/style-guide/)
- [Pinia Documentation](https://pinia.vuejs.org/)
- [Vue Router Documentation](https://router.vuejs.org/)

### Internal References
- [Vue Coding Style and Naming Conventions Guide](reference/coding-style.md)
- [Vue Anti-Patterns and Best Practices](reference/anti-patterns.md)
- [Modern Vue Architecture Patterns Guide](reference/patterns.md)