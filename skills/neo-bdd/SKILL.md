---
name: neo-bdd
description: >
  Use this skill when the user explicitly requests Behaviour-Driven Development (BDD)
  workflows, BDD Discovery/Example Mapping, BDD Gherkin .feature specifications, or
  BDD acceptance testing with Cucumber in JavaScript (@cucumber/cucumber). Activate
  only when the user wants to use BDD; do not use for general non-BDD testing.
license: MIT
compatibility: "Supports Gherkin 6+ and Cucumber-JS (@cucumber/cucumber) on Node.js."
metadata:
  version: "1.0.0"
  pattern: "tool-wrapper, generator, reviewer"
  domain: "bdd-cucumber-gherkin-javascript"
---

# Neo BDD (Cucumber, Gherkin & JavaScript)

Guide teams and agents through Behaviour-Driven Development (BDD) using Gherkin executable specifications and JavaScript test automation with `@cucumber/cucumber`.

## Trigger Boundary

Activate **only** when the user wants to apply Behaviour-Driven Development (BDD). Do not activate for general unit tests, integration tests, or requirement documents unless BDD is requested.

## Workflow

1. **Route & Load Reference Files** (load only what the task requires from `references/`):
   * BDD Discovery, Three Amigos, Example Mapping, User Stories (`INVEST`), Declarative Gherkin & BDD Myths: [bdd-practices-and-formulation.md](references/bdd-practices-and-formulation.md)
   * Gherkin Keywords (`Feature`, `Rule`, `Scenario`, `Background`, `Scenario Outline`, `Data Tables`, `Doc Strings`, `Tags`, `# language:`) & Step Organization: [gherkin-reference.md](references/gherkin-reference.md)
   * Cucumber-JS (`@cucumber/cucumber`) Setup, Step Definitions, Cucumber Expressions, `defineParameterType`, `World`, Assertions, Hooks, Reporting & CI: [cucumber-js-guide.md](references/cucumber-js-guide.md)
   * Testable Architecture (Ports & Adapters, Test Pyramid), JS Browser/API Automation, Anti-Patterns & Troubleshooting FAQ: [architecture-and-anti-patterns.md](references/architecture-and-anti-patterns.md)
   * Critical Gotchas, Execution Checklist & Output Templates (Templates A/B/C): [gotchas-and-templates.md](references/gotchas-and-templates.md)
2. **Follow the BDD Order**: Execute *Discovery* (Example Mapping) → *Formulation* (Declarative Gherkin) → *Automation* (JavaScript `@cucumber/cucumber` Red-Green-Refactor) without skipping prerequisite stages.
3. **Enforce Gotchas & Output Format**: Load [gotchas-and-templates.md](references/gotchas-and-templates.md) before generating or reviewing Gherkin/JS code to avoid `@cucumber/cucumber` pitfalls (such as arrow functions breaking `this` World context) and format the output with the matching template.

## Documentation

### Official References

* [Cucumber Official Documentation](https://cucumber.io/docs)

### Internal References

* [BDD Practices, Example Mapping & Better Gherkin](references/bdd-practices-and-formulation.md)
* [Gherkin Syntax & Step Organization Reference](references/gherkin-reference.md)
* [Cucumber-JS (`@cucumber/cucumber`) Implementation Guide](references/cucumber-js-guide.md)
* [Testable Architecture, JS Automation & Anti-Patterns](references/architecture-and-anti-patterns.md)
* [Gotchas, Execution Checklist & Output Templates](references/gotchas-and-templates.md)
