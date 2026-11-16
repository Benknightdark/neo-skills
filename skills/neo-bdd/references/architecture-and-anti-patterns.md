# Testable Architecture, JS Automation & Anti-Patterns

Official Reference: [Cucumber Docs — Guides](https://cucumber.io/docs/guides/) | [Cucumber Official Documentation](https://cucumber.io/docs)

Executable specifications only stay fast and reliable when the system under test has a testable architecture and scenarios avoid common structural anti-patterns.

---

## 1. Testable Architecture

### Ports and Adapters (Hexagonal Architecture)
Slow, brittle tests usually result from coupling business rules directly to UI frameworks, databases, or external network I/O.

* **Core Domain Isolation**: Keep business logic inside loosely coupled, well-encapsulated modules that interact with external systems (DB, HTTP APIs, queues, UI) only through **ports** and **adapters**.
* **In-Memory Stubs + Contract Tests**: Run most BDD scenarios directly against the domain ports backed by fast in-memory stubs. Pair stubs with **contract tests** that verify both the stub and real adapter obey identical contracts.
* **Test Pyramid**:
  * **Base (Many)**: Fast unit tests / microtests.
  * **Middle (Moderate)**: Domain/port-level or API-level Cucumber scenarios bypassing heavy UI/DB I/O.
  * **Top (Few)**: Full-stack end-to-end scenarios exercising browser + database + services together.

### Mocking and Stubbing
* Prefer exercising as much of your real application stack as practical rather than mocking internal collaborators.
* When your system depends on an external third-party service, prefer **stubs** over mocks inside step definitions.

---

## 2. JavaScript API & Browser Automation

Cucumber is an acceptance specification runner—not an HTTP client or browser driver—so pair `@cucumber/cucumber` with focused JS automation libraries.

### API Automation (Faster & More Stable Than UI)
When testing business logic across service boundaries, API-level step definitions run significantly faster and suffer far less flakiness than browser UI driving because APIs change less frequently than UI layouts.
* Recommended JS tool in Cucumber docs: **PactumJS** (`https://pactumjs.github.io/`, see [pactum-cucumber-boilerplate](https://github.com/pactumjs/pactum-cucumber-boilerplate)), or standard Node `fetch` / HTTP clients inside step definitions.

### Browser Automation (`selenium-webdriver` / Playwright)
Use browser automation selectively for critical user journeys:

```javascript
import { expect } from 'chai';
import { Given, When, Then, Before, After, Status } from '@cucumber/cucumber';
import { Builder, By, Key } from 'selenium-webdriver';

Before({ tags: '@browser' }, async function () {
  this.driver = await new Builder().forBrowser('chrome').build();
});

Given('I am on the search page', async function () {
  await this.driver.get('https://example.com');
});

When('I search for {string}', async function (searchTerm) {
  const element = await this.driver.findElement(By.name('q'));
  await element.sendKeys(searchTerm, Key.RETURN);
});

Then(
  'the page title should start with {string}',
  { timeout: 60 * 1000 },
  async function (prefix) {
    const title = await this.driver.getTitle();
    expect(title.toLowerCase().startsWith(prefix.toLowerCase())).to.equal(true);
  },
);

After({ tags: '@browser' }, async function (scenario) {
  if (this.driver) {
    if (scenario.result?.status === Status.FAILED) {
      const screenShot = await this.driver.takeScreenshot();
      this.attach(screenShot, 'image/png');
    }
    await this.driver.quit();
  }
});
```

*(Other JS browser automation integrations noted in Cucumber tooling include `playwright-cucumber-steps` for Playwright-based E2E steps and `gherkin-lint` for linting `.feature` files.)*

---

## 3. Common Anti-Patterns & Fixes

### 1. Feature-Coupled Step Definitions
* **Symptom**: Mirroring every `.feature` filename with a dedicated step file (`features/edit_work_experience.feature` → `features/steps/edit_work_experience_steps.js`).
* **Why it hurts**: Step definitions cannot be reused across features, causing step explosion, duplication, and high maintenance cost.
* **Fix**: Group step definition files by **domain concept** (`employee_steps.js`, `authentication_steps.js`) and name files after domain objects rather than feature titles.

### 2. Conjunction Steps
* **Symptom**: Combining multiple distinct actions or assertions into one step (`Given I have shades and a brand new Mustang`), or calling other Gherkin steps programmatically from inside a step definition.
* **Why it hurts**: Creates overly specialized steps that cannot be reused cleanly.
* **Fix**: Split into atomic Gherkin steps with `And`/`But`, or compose reusable actions by extracting and calling plain JavaScript helper functions inside your step definitions:
  ```gherkin
  Given I have shades
  And I have a brand new Mustang
  ```

### 3. Imperative UI Scripts in Gherkin
* **Symptom**: Scenarios listing URLs, input field names, CSS selectors, or button clicks (`When I type "..." in the email field / And I press the "Submit" button`).
* **Fix**: Keep `.feature` files declarative (intent & outcome) and hide UI mechanics inside step definitions or Page/Screenplay helpers.

### 4. Specifying Test Cases in Excel or CSV Files
* **Symptom**: Keeping test cases in external spreadsheets instead of `.feature` files.
* **Why it hurts**: Destroys executable specifications and living documentation; stakeholders can no longer read system behaviour directly.
* **Fix**: Use `Scenario Outline` + `Examples` tables in `.feature` files for data variations, and use Builder helpers in JavaScript step definitions to populate complex objects/forms with sensible defaults.

### 5. Conditional Step Skipping or Continuing After Failure
* **Symptom**: Wanting Cucumber to skip steps conditionally or continue executing steps after a step fails.
* **Why it hurts**: Scenarios are meant to test **one thing** and fail for **one clear reason**. Needing conditional skips indicates either overloaded scenarios or uncontrolled test state.
* **Fix**: Split oversized scenarios into focused, independent scenarios and initialize deterministic preconditions in `Given` / `Before`.

---

## 4. Troubleshooting & Upgrading Quick Reference

| Symptom / Question | Root Cause & Resolution |
| :--- | :--- |
| **Steps reported as `Undefined` despite being written** | Ensure `features/step_definitions/*.js` falls under Cucumber-JS's loaded paths (or pass `--import` / `--require` explicitly) and check for typos or trailing punctuation mismatches. |
| **Arity mismatch error** | The step function's parameter count does not match the number of captured parameters in the Cucumber Expression / RegExp (plus optional trailing `DataTable`/`DocString`). |
| **Ambiguous / duplicate step definition** | Remember `Given`, `When`, `Then`, `And`, `But` are ignored during matching. Two definitions with identical pattern text collide even under different keywords—reword distinctly or merge them. |
| **Garbled ANSI codes (e.g., `[32m`) in CI logs** | Configure formatter options to disable ANSI colors or use machine-readable formatters (`json`, `junit`, `message`). |
| **Upgrading `@cucumber/cucumber`** | Cucumber follows **SemVer** (`major.minor.patch`). Review `CHANGELOG.md` and `UPGRADING.md` in `cucumber/cucumber-js` whenever upgrading major versions. |
