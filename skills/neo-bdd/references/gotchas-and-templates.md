# BDD & Cucumber-JS Gotchas, Execution Checklist & Output Templates

Official Reference: [Cucumber Official Documentation](https://cucumber.io/docs)

---

## 1. Critical Gotchas

* **No Arrow Functions When Accessing `World` (`this`)**: In `@cucumber/cucumber`, `Given`, `When`, `Then`, `Before`, and `After` bind `this` to the isolated per-scenario `World` instance. Arrow functions (`() => {}`) lexically bind `this` and break state sharing across steps and hooks. Always use `function () {}` or `async function () {}` whenever reading or writing `this`.
* **Step Keywords Are Ignored During Matching**: Cucumber ignores `Given`, `When`, `Then`, `And`, `But`, and `*` when matching a step to a step definition. Writing `Given my account has £100` and `Then my account has £100` creates a duplicate/ambiguous match. Phrase preconditions and postconditions distinctly (e.g., `Given my account has a balance of £100` vs. `Then my account should have a balance of £100`).
* **Returning `false` or `null` Does Not Fail a Step**: A step definition passes unless it throws an `Error` or returns a rejected `Promise`. Returning `'pending'` marks the step as Pending; any other return value (`false`, `null`, `undefined`) is ignored.
* **Never Share State Between Scenarios**: Do not store scenario state in module-level globals or static singletons. Store per-scenario step state on `this` (`World`), and reset external state (database, cookies, test fixtures) inside a `Before` hook so scenarios run independently and in any order.
* **Assert Observable Outcomes Only in `Then` Steps**: Verify outputs observable by a user or external system (UI text, HTTP response, emitted event, generated report), not internal database rows directly.
* **Do Not Mix Cucumber Expressions and Regular Expressions**: Use either a Cucumber Expression (`'I have {int} cucumber(s)'`) or a RegExp literal (`/^I have (\d+) cucumbers?$/`) in a step definition, never both in the same expression.
* **Tag Placement Rules**: Tags (`@smoke`) may decorate `Feature`, `Rule`, `Scenario`/`Example`, `Scenario Outline`, and `Examples` blocks and are inherited by child elements, but **cannot** be placed above `Background` or individual steps (`Given`/`When`/`Then`).
* **Install `@cucumber/cucumber` Locally Only**: Always add `@cucumber/cucumber` as a local project `devDependency` (`npm install --save-dev @cucumber/cucumber`), never globally, because support and step definition files must resolve `import`/`require('@cucumber/cucumber')` from the project.

---

## 2. BDD 3-Practice Execution Checklist

### Practice 1 — Discovery (What it *could* do)
Do not jump straight to Gherkin or step code when requirements are ambiguous.
1. Frame the increment as a User Story (`In order to <business value> / As a <role> / I want <feature>`, checked against **INVEST**).
2. Run an **Example Mapping** breakdown (timeboxed to ~25–30 minutes per story):
   * **Yellow Card**: The User Story.
   * **Blue Cards**: Business Rules / Acceptance Criteria.
   * **Green Cards**: Concrete Examples illustrating each rule (and edge cases from the Three Amigos: Product Owner, Tester, Developer).
   * **Red Cards**: Unresolved questions or assumptions.
3. If Red cards dominate or scope grows too large, slice deferred stories out of scope or ask clarifying questions before writing `.feature` files.

### Practice 2 — Formulation (What it *should* do)
Translate agreed concrete examples into human- and machine-readable Gherkin specifications:
1. Apply the **"Imagine it's 1922" rule** and **Declarative style**: describe *what* behaviour the system exhibits in ubiquitous domain language, not *how* UI fields, buttons, or API endpoints are manipulated. Ask: *"Will this wording need to change if the implementation does?"*
2. Keep each `.feature` focused on one `Feature`, group related scenarios under `Rule:` when appropriate, and keep each `Scenario`/`Example` concise (3–5 steps, single-sentence title).
3. Extract shared preconditions into `Background:` (max 1 per `Feature` or `Rule`, ≤ 4 lines) using vivid domain names rather than `"User A"`.
4. Collapse repetitive value permutations into `Scenario Outline:` + `Examples:`.
5. Split conjunction steps (`and` inside a single step) into atomic `And`/`But` steps and reuse identical phrasing for identical concepts.

### Practice 3 — Automation (What it *actually does* in JavaScript)
Follow the outside-in Red → Green → Refactor loop with `@cucumber/cucumber`:
1. Ensure `@cucumber/cucumber` is configured in `package.json` (`"test": "cucumber-js"`) and `cucumber.json`.
2. Run `npx cucumber-js` (or `npm test`) to confirm new steps are reported as `undefined` and inspect generated JS snippets.
3. Group step definitions by **domain concept** under `features/step_definitions/<domain>_steps.js` (never 1-to-1 with `.feature` filenames).
4. Implement step definitions using Cucumber Expressions (or `defineParameterType` for domain objects), storing scenario-local state on `this` (`World`) and asserting outcomes with `node:assert` or `chai`.
5. Run Cucumber to see the scenario fail for the right reason (Red), implement minimal production code (guided by unit/microtests along Ports & Adapters boundaries) until it passes (Green), then refactor shared step logic into JS helper functions (never call steps from inside other step definitions).

### Validate & Review
* Verify Gherkin scenarios stay declarative, atomic, and independent.
* Verify JS step definitions avoid arrow functions with `this`, avoid global mutable state, keep `Before`/`After` hooks focused on low-level setup/cleanup, and execute cleanly via `npx cucumber-js`.

---

## 3. Output Templates

### Template A: Discovery & Gherkin Formulation

````markdown
# Example Mapping & Feature Specification: [Story Title]

## 1. User Story & Scope (Yellow)
* **In order to** [business value]
* **As a** [role]
* **I want** [capability]

## 2. Example Map
* **Rule (Blue)**: [Business rule 1]
  * **Example (Green)**: [Concrete example 1]
  * **Example (Green)**: [Edge-case example 2]
* **Open Questions (Red)**:
  * [Unresolved question or deferred scope, if any]

## 3. Gherkin Specification (`features/[feature_name].feature`)
```gherkin
Feature: [Feature Name]
  ...
```
````

### Template B: Cucumber-JS Implementation

````markdown
# Cucumber-JS Implementation: [Feature Name]

## 1. Feature File (`features/[feature_name].feature`)
```gherkin
...
```

## 2. Step Definitions (`features/step_definitions/[domain]_steps.js`)
```javascript
import assert from 'node:assert/strict';
import { Given, When, Then } from '@cucumber/cucumber';
...
```

## 3. Support / World / Hooks (`features/support/...`, if needed)
```javascript
...
```

## 4. Verification Command
```bash
npx cucumber-js
```
````

### Template C: BDD & Cucumber-JS Audit Report

````markdown
# BDD & Cucumber-JS Review Report

## 1. Summary
[Overall assessment of discovery alignment, Gherkin declarativeness, and JS step architecture]

## 2. Findings
* **[Severity: Error | Warning | Info] `path/to/file:line` — [Issue Title]**
  * **Problem**: [Violated BDD/Gherkin/Cucumber-JS rule and impact]
  * **Fix**:
    ```gherkin
    # or ```javascript
    ```

## 3. Next Steps
1. [Highest-impact refactoring]
2. [Verification command, e.g., `npx cucumber-js --tags "not @wip"`]
````
