# Gherkin Syntax & Step Organization Reference

Official Reference: [Cucumber Docs — Gherkin](https://cucumber.io/docs/gherkin/) | [Cucumber Official Documentation](https://cucumber.io/docs)

Gherkin is a line-oriented grammar that turns plain-text executable specifications into structured test cases while serving as living documentation.

---

## 1. Formatting & Syntax Rules

* **One `Feature` per file**: Every `.feature` file must start with a single primary `Feature:` keyword (aside from optional `# language:` comments, tags, or comments).
* **Indentation**: Spaces or tabs are allowed; **2 spaces** is the standard convention.
* **Comments (`#`)**: Permitted only at the start of a new line (after optional leading whitespace). Block comments are **not** supported.
* **Colons (`:`)**: Structure keywords (`Feature:`, `Rule:`, `Background:`, `Scenario:`, `Example:`, `Scenario Outline:`, `Scenario Template:`, `Examples:`, `Scenarios:`) require a colon. Step keywords (`Given`, `When`, `Then`, `And`, `But`, `*`) must **never** be followed by a colon—adding a colon after a step keyword causes the test to be ignored or fail to parse.
* **Free-form Descriptions**: Markdown-friendly description lines may appear directly underneath `Feature:`, `Rule:`, `Background:`, `Example:`/`Scenario:`, and `Scenario Outline:` as long as no description line starts with a Gherkin keyword.

---

## 2. Primary Keywords

### `Feature`
Provides a high-level summary and groups related rules/scenarios. Description lines beneath `Feature:` are ignored at runtime and rendered by HTML/reporting formatters.

```gherkin
Feature: Guess the word

  The word guess game is a turn-based game for two players.
  The Maker makes a word for the Breaker to guess.

  Scenario: Maker starts a game
    When the Maker starts a game
    Then the Maker waits for a Breaker to join
```

### `Rule` (Gherkin 6+)
Represents a single **business rule** within a `Feature` and groups one or more `Example` / `Scenario` blocks (plus an optional `Rule`-level `Background:`).

```gherkin
Feature: Highlander

  Rule: There can be only One

    Example: Only One -- More than one alive
      Given there are 3 ninjas
      And there are more than one ninja alive
      When 2 ninjas meet, they will fight
      Then one ninja dies (but not me)
      And there is one ninja less alive

    Example: Only One -- One alive
      Given there is only 1 ninja alive
      Then they will live forever ;-)
```

### `Example` / `Scenario`
A concrete example illustrating a business rule (`Scenario` and `Example` are synonyms). Aim for **3–5 steps** per scenario; longer scenarios lose clarity and test too many behaviours at once.

### Steps (`Given`, `When`, `Then`, `And`, `But`, `*`)
Steps execute sequentially in order. **Keywords are ignored when matching step definitions**—so `Given there is money in my account` and `Then there is money in my account` are considered duplicates. Distinguish preconditions from assertions clearly:
```gherkin
Given my account has a balance of £430
Then my account should have a balance of £430
```

| Keyword | Role | Guidelines |
| :--- | :--- | :--- |
| `Given` | Initial context / precondition | Past tense; puts the system into a known state (objects, seeded fixtures). Avoid describing user interactions. |
| `When` | Action / event | Present tense; describes a user action or external system event. Apply the "Imagine it's 1922" rule—hide UI/protocol mechanics in step definitions. |
| `Then` | Expected outcome | Verifies an **observable** output (UI display, API response, report, emitted message) via assertions. **Never assert directly against internal database records.** |
| `And` / `But` | Step continuation | Replaces repeated `Given`, `When`, or `Then` keywords for readability. |
| `*` | Bullet-style step | Can replace any step keyword, useful when listing multiple items cleanly (`* I have eggs`). |

### `Background`
Extracts shared `Given` preconditions common to every scenario in a `Feature` or `Rule`.
* Placed before the first `Scenario`/`Example` at the same indentation level.
* Runs **after** `Before` hooks and **before** the first step of each scenario.
* **Only one `Background:`** is allowed per `Feature` or `Rule`.
* **Best practices**:
  * Keep it short (**≤ 4 lines**) so readers do not lose context.
  * Avoid technical or overly complex setup; abstract incidental setup into a higher-level step (`Given I am logged in as a site owner`) or use conditional hooks for purely technical setup (e.g., launching a browser).
  * Use vivid domain names (`"Dr. Bill"`, `"Greg"`) rather than `"User A"` or `"Site 1"`.

### `Scenario Outline` (`Scenario Template`) & `Examples` (`Scenarios`)
Runs a parameterized scenario template once per data row in one or more `Examples:` tables. `<header>` placeholders are substituted before Cucumber matches steps to step definitions. Placeholders also work inside Doc Strings, Data Tables, and descriptions.

```gherkin
Scenario Outline: eating
  Given there are <start> cucumbers
  When I eat <eat> cucumbers
  Then I should have <left> cucumbers

  Examples:
    | start | eat | left |
    |    12 |   5 |    7 |
    |    20 |   5 |   15 |
```

---

## 3. Secondary Keywords & Multiline Step Arguments

### Doc Strings (`"""` or ```` ``` ````)
Pass large blocks of text as the **final argument** to a JavaScript step definition without matching them in the step expression.
* Delimited by `"""` (or ```` ``` ````; `"""` has broader editor support).
* Optional content-type annotation right after the opening delimiter (e.g., `"""markdown`, `"""json`).
* Lines inside are **dedented** relative to the column of the opening delimiter; extra indentation beyond that column is preserved.

```gherkin
Given a blog post named "Random" with Markdown body
  """markdown
  Some Title, Eh?
  ===============
  Here is the first paragraph of my blog post.
  """
```

### Data Tables (`|`)
Pass tabular lists or records as a `DataTable` object in the **final argument** of a JavaScript step definition.

```gherkin
Given the following users exist:
  | name   | email              | twitter         |
  | Aslak  | aslak@cucumber.io  | @aslak_hellesoy |
  | Julien | julien@cucumber.io | @jbpros         |
```

* **Cell escaping**: `\n` (newline), `\|` (literal pipe `|`), `\\` (literal backslash `\`).

### Tags (`@`)
Organize features/scenarios for selective execution, conditional hooks, and external traceability (`@issue-123`).
* Separate multiple tags with spaces: `@billing @important`.
* Valid targets: `Feature`, `Rule`, `Scenario`/`Example`, `Scenario Outline`, and individual `Examples:` blocks.
* **Inheritance**: Tags on `Feature` are inherited by child `Rule`, `Scenario`, `Scenario Outline`, and `Examples`. Tags on `Scenario Outline` are inherited by its `Examples:` tables.
* **Invalid targets**: Tags **cannot** be placed above `Background:` or individual steps (`Given`/`When`/`Then`/`And`/`But`).

---

## 4. Spoken Languages (Localisation)

Write Gherkin in the same language domain experts and users speak—avoid translating between two languages. Gherkin keywords are localized into **over 70 languages** (see `https://cucumber.io/docs/gherkin/languages/`).

Add `# language: <code>` on the **first line** of the `.feature` file (for example, `# language: no` for Norwegian or `# language: fr` for French; defaults to English `en` if omitted):

```gherkin
# language: no
Funksjonalitet: Gjett et ord

  Eksempel: Ordmaker starter et spill
    Når Ordmaker starter et spill
    Så må Ordmaker vente på at Gjetter blir med

  Eksempel: Gjetter blir med
    Gitt at Ordmaker har startet et spill med ordet "bløtt"
    Når Gjetter blir med på Ordmakers spill
    Så må Gjetter gjette et ord på 5 bokstaver
```

---

## 5. Step Organization in JavaScript

Cucumber flattens the `features/` directory tree at runtime: all `.js` support and step definition files found under the configured paths are loaded globally across all `.feature` files.

### Group by Domain Concept, Not by Feature
Create `features/step_definitions/<domain>_steps.js` files aligned with domain objects—for example:
* `features/step_definitions/employee_steps.js`
* `features/step_definitions/education_steps.js`
* `features/step_definitions/experience_steps.js`
* `features/step_definitions/authentication_steps.js`

This prevents **feature-coupled step definitions** and encourages step reuse across features.

### Reuse via Parameterization & JS Helper Functions
* **Do not write unused step definitions** for steps absent from `.feature` files (cruft).
* **Parameterize similar steps** with Cucumber Expressions instead of duplicating near-identical step definitions:
  ```javascript
  // Consolidates home, about, and contact navigation steps
  Given('I go to the {string} page', function (webpage) {
    return this.navigateTo(webpage);
  });
  ```
* **Extract JS helper functions**: Cucumber step files are full JavaScript modules. Extract reusable logic into helper functions (in the same `*_steps.js` file or in `features/support/`) rather than duplicating code or calling steps from inside other steps.
