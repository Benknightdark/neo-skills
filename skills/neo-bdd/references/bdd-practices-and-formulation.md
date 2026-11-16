# BDD Practices, Discovery & Gherkin Formulation

Official Reference: [Cucumber Docs — BDD](https://cucumber.io/docs/bdd/) | [Cucumber Official Documentation](https://cucumber.io/docs)

Behaviour-Driven Development (BDD) is a collaborative software development process designed to close the gap between business stakeholders and technical teams. Cucumber was built to support BDD, though **there is much more to BDD than using Cucumber**.

---

## 1. What BDD Accomplishes

BDD enhances existing Agile processes (such as User Stories) rather than replacing them:

* **Shared Understanding**: Cross-functional collaboration around concrete, real-world examples exposes misunderstandings before code is written.
* **Rapid, Small Iterations**: Breaking stories into small slices increases feedback speed and reduces wasted work.
* **Living Documentation**: Documented examples become executable specifications verified automatically against the system's real behaviour, staying accurate over time.

---

## 2. The Three Practices (Strict Order)

Day-to-day BDD is a three-step iterative loop. You cannot skip or reorder these practices—as Liz Keogh summarizes:

> *"Having conversations is more important than capturing conversations is more important than automating conversations."*

1. **Discovery (What it *could* do)**
   * Take a small upcoming User Story and run a structured conversation around concrete examples from the user's perspective.
   * Identify business rules, edge cases, knowledge gaps (deferring low-priority scope to smaller stories), and agree on expectations.
   * Master Discovery first; Formulation and Automation fail without it.
2. **Formulation (What it *should* do)**
   * Document agreed examples in structured Gherkin—readable by both humans and computers—to verify shared understanding across the whole team.
   * Establish a **Ubiquitous Language** (domain terminology shared from conversation down into production code).
3. **Automation (What it *actually does*)**
   * Automate one example at a time as a failing acceptance test to guide implementation (paired with lower-level TDD/microtests).
   * Automated scenarios act as guide-rails during development and reduce manual regression burden later.

---

## 3. Roles & Collaboration: The Three Amigos

A **Three Amigos** session turns User Stories into clear scenarios by combining at least three perspectives:

| Role | Primary Focus | Questions Asked |
| :--- | :--- | :--- |
| **Product Owner / Business** | Scope and business value | Which edge cases are in scope now vs. deferred? What value does this deliver? |
| **Tester** | Edge cases and failure modes | How could this break? What scenarios or boundaries have we missed? |
| **Developer** | Technical details and steps | How will this execute? What hidden constraints, states, or dependencies exist? |

### Who Writes Gherkin & Step Definitions?
* **Early stage**: While domain language and scenario style are still emerging, the whole team should collaborate on writing Gherkin.
* **Mature stage**: A pair—typically a developer (automation) and a tester (quality)—drafts Gherkin and step definitions, with active review from the Product Owner / business representative.

---

## 4. Discovery Workshops & Example Mapping

### Workshop Guidelines
* **When**: Hold discovery workshops **as late as possible** before development begins on a User Story, so details remain fresh and plans stay flexible.
* **Who**: Ideally **3–6 people** (minimum the Three Amigos).
* **Timebox**: **25–30 minutes per User Story**. If a story takes longer, either the story is too big (slice it) or specifics are missing (pause and do research before coding).

### Example Mapping (Four-Color Index Cards)
Example Mapping structures a 25–30 minute discovery conversation into a visual map:

| Card Color | Artifact | Placement & Purpose |
| :--- | :--- | :--- |
| **Yellow** | **User Story** | Placed at the top to anchor scope. |
| **Blue** | **Rules** (Acceptance Criteria) | Placed in a row beneath the yellow story card; summarizes constraints/rules. |
| **Green** | **Examples** | Placed in columns underneath each relevant blue rule; concrete illustrations of that rule. |
| **Red** | **Questions / Assumptions** | Captures unanswered questions or assumptions so the conversation keeps moving without stalling. |

* Any newly discovered, out-of-scope functionality can be written on a new yellow card and deferred to the backlog so the current increment stays small.

### Alternative Discovery Models
* **OOPSI Mapping** (Outcomes, Outputs, Processes, Scenarios, Inputs): Uses colored sticky notes to trace processes and relationships between outputs and scenarios.
* **Feature Mapping**: Identifies actors involved in a story, breaks the story down into tasks, and maps tasks to specific examples.

---

## 5. User Stories & Feature Framing

Good User Stories deliver demonstrable functionality, include testable acceptance criteria, and follow **INVEST**:

* **I**ndependent
* **N**egotiable
* **V**aluable
* **E**stimatible
* **S**mall
* **T**estable

### Standard Formats

User Story template:
```text
As an <actor>
I want a <feature>
So that <benefit>
```

Gherkin `Feature` header framing (**Why**, **Who**, **What**):
```gherkin
Feature: Explaining Cucumber
  In order to gain an understanding of the Cucumber testing system
  As a non-programmer
  I want to have an overview of Cucumber that is understandable by non-geeks
```

Align `In order to` with core business value where applicable:
* Protect revenue
* Increase revenue
* Manage cost
* Increase brand value
* Make the product remarkable
* Provide more value to customers

---

## 6. Writing Better Gherkin

### Concrete Examples: "Imagine It's 1922"
Good BDD examples are **concrete**, not abstract—mention real names of people and places, exact dates, and specific amounts relevant to the domain. Avoid assuming computers, browsers, clicks, or technology ("imagine it's 1922, when there were no computers").

### Declarative vs. Imperative Style
Scenarios should describe **intended behaviour (*what*)**, not procedural mechanics (*how*). Ask:
> **"Will this wording need to change if the implementation does?"**
If yes, remove the implementation detail.

**Anti-pattern (Imperative / Procedural UI details):**
```gherkin
Feature: Subscribers see different articles based on their subscription level

  Scenario: Free subscribers see only the free articles
    Given users with a free subscription can access "FreeArticle1" but not "PaidArticle1"
    When I type "freeFrieda@example.com" in the email field
    And I type "validPassword123" in the password field
    And I press the "Submit" button
    Then I see "FreeArticle1" on the home page
    And I do not see "PaidArticle1" on the home page
```

**Recommended (Declarative / Living Documentation):**
```gherkin
Feature: Subscribers see different articles based on their subscription level

  Scenario: Free subscribers see only the free articles
    Given Free Frieda has a free subscription
    When Free Frieda logs in with her valid credentials
    Then she sees a Free article

  Scenario: Subscriber with a paid subscription can access both free and paid articles
    Given Paid Patty has a basic-level paid subscription
    When Paid Patty logs in with her valid credentials
    Then she sees a Free article and a Paid article
```
*(In the declarative version, UI mechanics, login method—password vs. voice/thumbprint—and specific fixture article IDs live inside the JavaScript step definitions, keeping `.feature` files resilient and concise.)*

### Atomic Steps & Consistent Phrasing
* **One action/condition per step**: Split `"and"` inside a step into multiple lines (`And`/`But`):
  ```gherkin
  # Bad
  When I fill in the "Name" field and the "Address" field

  # Good
  When I fill in the "Name" field
  And I fill in the "Address" field
  ```
* **Consistency**: Use the exact same wording for the same concept everywhere (e.g., choose `Given I am logged in` rather than mixing `Given I have logged in to the site`).
* **Focus**: Describe each scenario in a single non-run-on sentence; if a `Feature` grows too many scenarios, split into multiple `Feature` files.

---

## 7. Common BDD Myths

* **Myth: You can pick and choose practices in any order.**
  Formulating Gherkin without Discovery wastes time; automating examples without stakeholder agreement produces brittle tests for the wrong behaviour.
* **Myth: Automating scenarios after code is implemented is BDD.**
  Writing Cucumber tests post-implementation is valid test automation, but it is **not BDD**.
* **Myth: One person can do Discovery alone.**
  Discovery requires cross-role conversation (Three Amigos) to uncover differing assumptions.
* **Myth: Using Cucumber means you are doing BDD.**
  Cucumber is an automation tool; BDD is the collaborative process around Discovery, Formulation, and Automation.

---

## 8. Brief Background & Origins
BDD was pioneered in the early 2000s by Dan North (JBehave, *Introducing BDD* 2006) and Liz Keogh, alongside Chris Matts, drawing on Domain-Driven Design's Ubiquitous Language and Connextra's User Story template (`Given/When/Then`). Aslak Hellesøy later created **Cucumber** as a readable evolution of RSpec Story Runner for the whole team, including non-coding stakeholders.
