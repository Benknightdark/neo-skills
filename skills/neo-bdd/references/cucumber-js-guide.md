# Cucumber-JS (`@cucumber/cucumber`) Implementation Guide

Official Reference: [Cucumber Docs — Cucumber](https://cucumber.io/docs/cucumber/) | [Cucumber Official Documentation](https://cucumber.io/docs) | [Cucumber-JS Configuration Docs](https://github.com/cucumber/cucumber-js/blob/main/docs/configuration.md)

This guide focuses on implementing, configuring, and running Cucumber in Node.js / JavaScript projects using `@cucumber/cucumber` (documented against `^13.3.0`).

---

## 1. Installation & Project Setup

Install `@cucumber/cucumber` as a **local** development dependency:

```bash
npm install --save-dev @cucumber/cucumber
# or
yarn add --dev @cucumber/cucumber
```

> [!WARNING]
> **Do not install Cucumber-JS globally.** Support files and step definitions must `import` or `require('@cucumber/cucumber')` from the project's local `node_modules`.

### Recommended Project Structure

```text
project-root/
├── cucumber.json
├── package.json
└── features/
    ├── is_it_friday_yet.feature
    ├── step_definitions/
    │   └── calendar_steps.js
    └── support/
        ├── env.js
        └── hooks.js
```

Configure `package.json`:
```json
{
  "scripts": {
    "test": "cucumber-js"
  },
  "devDependencies": {
    "@cucumber/cucumber": "^13.3.0"
  }
}
```

Create `cucumber.json` at the project root for profiles and snippet options:
```json
{
  "default": {
    "formatOptions": {
      "snippetInterface": "synchronous"
    }
  }
}
```

* Run with `npm test`, `npx cucumber-js`, or `./node_modules/.bin/cucumber.js`.
* Inspect all CLI options with `npx cucumber-js --help` (see [profiles](https://github.com/cucumber/cucumber-js/blob/main/docs/profiles.md) and [configuration](https://github.com/cucumber/cucumber-js/blob/main/docs/configuration.md)).
* Note: Cucumber-JS does **not** support configuration via an `env` file (unlike Ruby/Rails workflows).

---

## 2. Red → Green → Refactor Workflow in JavaScript

1. **Write a Scenario (`features/is_it_friday_yet.feature`)**:
   ```gherkin
   Feature: Is it Friday yet?
     Everybody wants to know when it's Friday

     Scenario Outline: Today is or is not Friday
       Given today is "<day>"
       When I ask whether it's Friday yet
       Then I should be told "<answer>"

     Examples:
       | day            | answer |
       | Friday         | TGIF   |
       | Sunday         | Nope   |
       | anything else! | Nope   |
   ```
2. **See Undefined Steps**: Run `npm test`; Cucumber-JS prints `Undefined` warnings and ready-to-paste JS step snippets.
3. **See Pending / Failing (Red)**: Implement step definitions (`features/step_definitions/calendar_steps.js`) calling the target domain logic and asserting with `node:assert`. Verify the scenario fails for the expected assertion mismatch.
4. **Make It Pass (Green)**: Implement the minimal domain logic:
   ```javascript
   import assert from 'node:assert/strict';
   import { Given, When, Then } from '@cucumber/cucumber';

   function isItFriday(today) {
     return today === 'Friday' ? 'TGIF' : 'Nope';
   }

   Given('today is {string}', function (givenDay) {
     this.today = givenDay;
   });

   When("I ask whether it's Friday yet", function () {
     this.actualAnswer = isItFriday(this.today);
   });

   Then('I should be told {string}', function (expectedAnswer) {
     assert.strictEqual(this.actualAnswer, expectedAnswer);
   });
   ```
   *(CommonJS projects use `const assert = require('assert')` and `const { Given, When, Then } = require('@cucumber/cucumber')`.)*
5. **Refactor**: Move domain functions like `isItFriday` out of step files into production modules, and extract repeated step glue into reusable JS helper functions.

---

## 3. Step Definitions, Results & Matching

### Matching Rules
* All step definitions are loaded before scenarios run.
* Step keywords (`Given`, `When`, `Then`, `And`, `But`) are **not** used when matching step text—every pattern must be globally unique across keywords.
* The number of parameters in the step function must match the number of captured expression parameters (plus any trailing `DataTable` or `DocString`).

### Step Result Statuses

| Status | Trigger in JavaScript | Effect on Remaining Steps |
| :--- | :--- | :--- |
| **Success** | Function returns normally / Promise resolves (without `'pending'`). Return values are ignored. | Continues to next step. |
| **Undefined** | No registered expression matches the step text. | Subsequent steps are **Skipped**. |
| **Pending** | Function returns `'pending'`. | Subsequent steps are **Skipped**. |
| **Failed** | Function throws an `Error` or returns a rejected `Promise`. Returning `false` or `null` does **not** fail. | Subsequent steps are **Skipped**. |
| **Skipped** | Preceding step was Undefined, Pending, or Failed. | Not executed. |
| **Ambiguous** | More than one step definition matches the same step text (`ambiguous` result status). | Fails ambiguity check. |

---

## 4. Cucumber Expressions & Custom Parameter Types

Step definitions accept either a **Cucumber Expression** (string) or a **Regular Expression** (`/pattern/`), but **cannot mix both** in the same expression.

### Built-in Parameter Types

| Parameter Type | Matches & Behaviour |
| :--- | :--- |
| `{int}` | Integers (`71`, `-19`). |
| `{float}` | Floating-point numbers (`3.6`, `.8`, `-9.2`) and uppercase-`E` scientific notation (`1.5E3`, `1.5E-3`, `1.5E+3`). Lowercase `e` (`1.5e3`) is **not** matched. |
| `{word}` | Single word without whitespace (`banana`, not `banana split`). |
| `{string}` | Single- or double-quoted text (`"banana split"` or `'banana split'`); quotes are stripped, empty quotes `""` pass `""`. |
| `{}` (anonymous) | Matches anything (`/.*/`). |
| `{bigdecimal}`, `{double}` | Matches same patterns as `{float}`. |
| `{biginteger}`, `{byte}`, `{short}`, `{long}` | Matches same patterns as `{int}`. |

### Expression Syntax Helpers
* **Optional text**: `'I have {int} cucumber(s) in my belly'` matches `1 cucumber` and `42 cucumbers`. *(Note: `()` means optional text in Cucumber Expressions, not a capture group as in Regex.)*
* **Alternative text**: `'I have {int} cucumber(s) in my belly/stomach'` matches either `belly` or `stomach` (no whitespace allowed around `/`).
* **Escaping**: Escape literal `{`, `(`, or `/` with a backslash: `\{`, `\(`, `\/`.

### Custom Parameter Types (`defineParameterType`)
Register domain conversions in support files (the `transformer` in JavaScript may return a `Promise`):

```javascript
import { defineParameterType } from '@cucumber/cucumber';

defineParameterType({
  name: 'color',
  regexp: /red|blue|yellow/,
  transformer: (s) => new Color(s),
});
```

Available options:
* `name`: Name referenced inside `{name}` placeholders.
* `regexp`: RegExp matching the argument (may contain capture groups).
* `transformer`: Function converting matched text (arity 1 if no capture groups, or matching capture group count).
* `useForSnippets` (default `true`): Disable (`false`) if `regexp` matches too broadly during undefined-step snippet generation.
* `preferForRegexpMatch` (default `false`): Set `true` to prioritize over other types when matching regex step definitions.

---

## 5. `DataTable`, `DocString`, `World` State & Assertions

### Multiline Arguments (`DataTable` / `DocString`)
Both `DocString` and `DataTable` are passed automatically as the **final argument** of the step definition without adding placeholders to the expression. See the [Cucumber-JS DataTable interface docs](https://github.com/cucumber/cucumber-js/blob/main/docs/support_files/data_table_interface.md) for table access helpers.

### State Isolation (`World`)
* **Between scenarios**: Never share state across scenarios. Do not use module-level or global mutable variables; reset databases or browser cookies in a `Before` hook.
* **Between steps in one scenario**: Cucumber-JS creates an isolated `World` instance per scenario and binds it to `this` inside step definitions and hooks (see [Cucumber-JS World docs](https://github.com/cucumber/cucumber-js/blob/main/docs/support_files/world.md)).
* **Critical rule**: Always use `function () {}` or `async function () {}` (never `() => {}`) whenever accessing `this` inside `Given`/`When`/`Then`/`Before`/`After`.

### Assertions
Cucumber has no built-in assertion library. Use Node.js's built-in `assert` module or `chai`:

```javascript
// Node.js built-in assert
import assert from 'node:assert/strict';

Then('the result should be {word}', function (expected) {
  assert.strictEqual(this.actual, expected);
});
```

```javascript
// Chai
import { expect } from 'chai';

Then('the result should be {word}', function (expected) {
  expect(this.actual).to.eql(expected);
});
```

---

## 6. Hooks & Tags

Declare hooks in `features/support/hooks.js` or `features/support/env.js`.

### Hook Types & Execution Order
1. `BeforeAll(async function () {})`: Runs once before any scenario.
2. `Before(async function () {})`: Runs before the first step of each scenario (and **before** `Background`), in declaration order. Keep business-visible preconditions in `Background` instead; reserve `Before` for low-level setup (browsers, DB cleanup).
3. `BeforeStep(async function ({ pickle, pickleStep, gherkinDocument, testCaseStartedId, testStepId }) {})`: Runs before each step.
4. `AfterStep(async function ({ pickle, pickleStep, gherkinDocument, result, testCaseStartedId, testStepId }) {})`: Runs after each executed step (paired with `BeforeStep`).
5. `After(async function (scenario) {})`: Runs after the last step of each scenario—**even if steps failed, were undefined, pending, or skipped**. Inspect `scenario.result.status` (e.g., to attach screenshots on failure).
6. `AfterAll(async function () {})`: Runs once after all scenarios finish.

*(Note: `Around` and `InstallPlugin` hooks are Ruby-only and do not apply to Cucumber-JS.)*

### Conditional Hooks & Tag Filtering
Use infix boolean tag expressions (`and`, `or`, `not`, parentheses):

```javascript
import { Before, BeforeStep } from '@cucumber/cucumber';

Before({ tags: '@browser and not @headless' }, async function () {
  // setup non-headless browser
});

BeforeStep({ tags: '@foo' }, async function () {
  // run only for scenarios tagged @foo
});
```

Run subsets of scenarios from the CLI using tag expressions or `file.feature:line`:

```bash
npx cucumber-js --tags "@smoke and @fast"
npx cucumber-js --tags "not @smoke"
npx cucumber-js --tags "(@smoke or @ui) and (not @slow)"
```

---

## 7. Reporting, Environment Variables & CI

* **Built-in Formatters**: `message` (Cucumber Messages NDJSON), `progress`, `pretty`, `html`, `json`, `rerun`, `junit`.
* **Cucumber Reports Service**: Supported in Cucumber-JS `7.0.0+` via `CUCUMBER_PUBLISH_TOKEN`.
* **JS Third-Party Reporters**: `Multiple Cucumber HTML Reporter`, `Serenity/JS`, `ReportPortal.io adapter` (`agent-js-cucumber`), `cucumber-json-2-pdf`, `features2`.
* **Environment Variable Security**: Define secrets such as `CUCUMBER_PUBLISH_TOKEN` only in the active terminal session (`export CUCUMBER_PUBLISH_TOKEN=...`) or CI secret configuration—never globally in `~/.bashrc`, `~/.bash_profile`, `~/.zshrc`, or system-wide environment files.
* **CI Integration**: `cucumber-js` exits with a non-zero exit status whenever scenarios fail. Generate `junit` XML reports for CI test dashboards when required.
