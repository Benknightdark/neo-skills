# Agent Harness Engineering and the Role of Humans in the Software Engineering Loop

> This document is a summary and integration of two articles from Martin Fowler's website, focusing on practical explanations rather than word-for-word translation.

## Original Sources

- [Harness engineering for coding agent users](https://martinfowler.com/articles/harness-engineering.html)  
  Author: Birgitta Boeckeler, Published: 2026-04-02
- [Humans and Agents in Software Engineering Loops](https://martinfowler.com/articles/exploring-gen-ai/humans-and-agents.html)  
  Author: Kief Morris, Published: 2026-03-04

## One-sentence Summary

The focus of AI coding agents is not just "letting the model write code," but establishing a working system (harness) for the agent to guide, check, correct, and continuously improve. Humans should not just review line-by-line at the lowest level, nor should they exit completely; instead, they should stand above the loop, designing and maintaining the agent's harness to ensure reliable software output in a controlled environment.

## Core Background

LLM coding agents can generate code quickly, but they have several inherent limitations:

- Output is not entirely predictable.
- They may not understand the full business context.
- They have limited grasp of existing code, team conventions, architectural constraints, and product trade-offs.
- They are prone to iterating in the wrong direction, wasting tokens, time, and review costs.

Therefore, the key to improving agent performance is not just switching to a stronger model, but designing the environment in which it works. This environment includes specifications, documentation, templates, tests, linting, architectural checks, review agents, CI pipelines, observability data, and human decision-making processes. This entire external control system is the "harness" discussed in the articles.

## What is a Harness?

In a broad sense, an agent can be understood as:

```text
Agent = Model + Harness
```

In the context of coding agents, the model is the LLM responsible for reasoning and generation; the harness is the working system wrapped around the model. It may include:

- System prompts, project rules, AGENTS.md, skills, and how-to guides.
- Code retrieval, language servers, CLI tools, and MCP servers.
- Tests, type checks, linting, static analysis, and architectural rules.
- AI code reviews, LLM judges, and semantic checks.
- CI/CD pipelines, production telemetry, and user journey data.

A good harness has two goals:

- Increase the probability of the agent getting it right the first time.
- Enable the agent to self-correct more issues based on feedback before reaching humans.

In other words, the value of a harness is to reduce the human review burden while improving system quality.

## Feedforward and Feedback

Harness controls can be divided into two categories.

### Feedforward: Guidance Before Action

Feedforward controls provide direction before the agent starts working, aiming to prevent errors. Examples include:

- Coding convention documents.
- Architectural principles.
- Task breakdown methods.
- Project bootstrap guides.
- API usage specifications.
- Technical decision records (ADRs).
- Templates and scaffolds.
- Codemods or fixed refactoring tools.

The effect of feedforward is to increase the probability that the agent produces correct results from the start.

### Feedback: Sensing and Correction After Action

Feedback controls provide signals after the agent performs an action, allowing it to check and self-correct. Examples include:

- Unit and integration tests.
- Type checkers.
- Linters.
- Architecture fitness tests.
- Coverage or mutation testing.
- Semgrep or security scans.
- AI review agents.
- Browser smoke tests.
- Production logs, SLOs, error rates, and latency.

The effect of feedback is to ensure the agent is not just "constrained by rules" but knows whether its output is actually effective.

Without feedback, the agent might repeat the same mistakes; without feedforward, the team won't know if the rules are actually having an effect. A good harness requires both.

## Computational and Inferential

The articles also divide guides and sensors into two execution types.

### Computational Controls

Computational controls are deterministic, fast, and cheap machine checks, usually executed by the CPU. Examples include:

- Type checks.
- Unit tests.
- Linting.
- Static analysis.
- Structural tests.
- Codemods.
- Dependency checks.

The advantages of these controls are stability, low cost, and repeatability, making them suitable for execution before every change, commit, or in the CI pipeline.

### Inferential Controls

Inferential controls are AI or LLM-based checks that require semantic judgment. Examples include:

- AI code reviews.
- LLM-as-a-judge.
- Commentary on architectural soundness.
- Commentary on test quality.
- Detection of duplicate logic or over-engineering.
- Inferring potential issues from logs.

These controls can handle problems that traditional tools find difficult, but they are more expensive, slower, and less stable. They are suitable for high-value, high-risk, or late-stage checks, rather than replacing all deterministic checks.

## Three Types of Harnesses

### 1. Maintainability Harness

The maintainability harness is used to maintain internal code quality. This is currently the easiest type to implement because existing tools are very mature.

Issues covered include:

- Duplicate code.
- Excessive complexity.
- Missing tests.
- Inconsistent naming or formatting.
- Violated architectural boundaries.
- Style guide violations.

Computational sensors are very effective for these issues. Inferential sensors can complement them at the semantic level, such as detecting "logic that looks different but is actually duplicate," "tests that exist but don't verify the core point," or "fixes that are too brute-force or over-engineered."

However, a maintainability harness cannot fully solve requirement misunderstandings, incorrect diagnoses, or scope creep. These still require clearer specifications and human judgment.

### 2. Architecture Fitness Harness

The architecture fitness harness is used to maintain architectural characteristics and system quality attributes. Examples include:

- Module boundaries.
- Consistency in API design.
- Performance requirements.
- Observability standards.
- Security and compliance requirements.
- Deployment and operational constraints.

Its feedforward might be architectural documents, ADRs, logging standards, or performance budgets; feedback might be architecture tests, performance tests, contract tests, observability reviews, or deployment checks.

The focus of this harness is to translate "what our system looks like" into rules that an agent can read, follow, and be checked against by tools.

### 3. Behaviour Harness

The behavior harness is used to confirm that software functional behavior meets requirements. This is currently the most difficult type.

Common practices include:

- Feedforward: Providing the agent with functional specifications, user stories, and acceptance criteria.
- Feedback: Letting the agent generate and execute tests, supplemented by coverage, mutation testing, or manual testing.

The problem is that AI-generated tests themselves are not necessarily trustworthy. Tests might only verify implementation details rather than actual requirements. The articles mention "approved fixtures" as a pattern that can improve test quality in some scenarios, but it's not a universal solution for all systems.

Therefore, functional correctness remains the area that most needs human product judgment and high-quality specifications.

## Harnessability: Not All Systems Are Equally Easy to Harness

Whether a codebase can be stably operated by an agent depends on whether it possesses enough structural clues.

Systems that are easier to harness usually have:

- Strongly typed languages and strict type checking.
- Clear module boundaries.
- Consistent frameworks and directory structures.
- Automatable tests.
- Clear coding conventions.
- Architectural rules checkable by tools.

Systems that are harder to harness usually have:

- High technical debt.
- Too many implicit rules.
- Vague architectural boundaries.
- Insufficient tests.
- A requirement for significant tribal knowledge.
- Highly mixed frameworks and styles.

This means greenfield projects can be designed for harnessability from day one, while legacy projects need to add structure, tests, and rules before safely increasing agent autonomy.

## Harness Templates

Large organizations often have several common types of services, such as:

- CRUD business services.
- Event processors.
- Data dashboards.
- API gateways.
- Batch jobs.

If these types already have service templates, they can evolve into harness templates. That is, each service type comes built-in with:

- Standard directory structure.
- Tech stack and dependencies.
- Generation and modification guides.
- Test templates.
- Architectural rules.
- CI pipelines.
- Security and observability checks.
- Agent review guides.

This narrows the space in which the agent can arbitrarily generate, making control more feasible. The downside is that the template itself requires version management, synchronization, and governance; otherwise, projects will gradually diverge from the upstream standard.

## Three Human Positions in the Loop

The second article provides another important model: where should humans stand in the loop?

### Humans Outside the Loop

This leaves humans in the "why loop" and lets the agent handle the "how loop." Humans only describe the desired result, and the agent decides how to construct the software.

This approach is close to what's often called "vibe coding." Its appeal lies in speed and minimal intervention, but the risk is that internal quality, maintainability, cost, security, and compliance may spiral out of control.

The articles remind us: we care about internal quality not because code is sacred, but because internal quality affects external outcomes. A chaotic codebase makes agents slower, more likely to get lost, and harder to modify reliably.

### Humans In the Loop

This keeps humans in the lowest-level coding loop, reviewing the agent's code line-by-line.

This approach leverages human experience and judgment, especially when the agent gets stuck, misunderstands, or repeatedly fixes things incorrectly. The problem is that humans become the bottleneck. Agents generate code much faster than humans can review it line-by-line. If all quality assurance relies on manual review, the efficiency gains of AI are neutralized.

### Humans On the Loop

The articles advocate for "humans on the loop": humans do not control the agent line-by-line, nor do they exit completely; instead, they design, manage, and improve the agent's work loop.

The difference can be understood as:

- In the loop: Seeing an incorrect agent output and fixing it directly, or telling the agent to fix that specific output.
- On the loop: Seeing an incorrect agent output and going back to modify the harness so that future similar outputs are more likely to be correct.

This turns every error into an opportunity to improve the system, rather than just fixing a one-off problem.

## Agentic Flywheel

A more advanced state is the "agentic flywheel": humans not only ask the agent to build features but also ask it to analyze the harness's effectiveness and propose improvements.

Implementation can start simply:

1. Let the agent read tests, CI results, and review findings.
2. Ask the agent to identify failure patterns and recurring issues.
3. Have the agent suggest adding or modifying rules, tests, documentation, linting, or pipelines.
4. Humans review these suggestions before assigning the agent to implement them.
5. As trust increases, let the agent flag risks, costs, and benefits for its suggestions.
6. Gradually automate low-risk, high-confidence improvements.

Such a flywheel doesn't aim for a one-time "it mostly works," but rather makes the system progressively more capable of self-checking, self-correcting, and self-improving.

## Practical Implications for Engineering Teams

### 1. Don't Understand AI Engineering Only as Prompting Skills

Prompts are important, but long-term reliability comes from the entire work system. Teams should view AGENTS.md, skills, specification documents, tests, linting, CI, review processes, and production feedback as a single harness rather than fragmented tools.

### 2. Prioritize Moving Cheap, Stable, and Deterministic Checks Upstream

Problems that can be solved with deterministic tooling should not be prioritized for LLM judgment. Type checks, linting, unit tests, formatting, and architectural rules should run as early as possible, ideally during the agent's self-correction phase.

### 3. Focus Human Attention on High-Value Judgments

The most valuable place for humans is not reading every line of code, but judging:

- Whether requirements are clear.
- Whether the product direction is correct.
- Whether architectural trade-offs are reasonable.
- Whether risks are acceptable.
- Which technical debts are intentional and which are out of control.
- How the harness should evolve.

### 4. Turn Recurring Errors into Harness Improvements

If an agent makes the same mistake multiple times, it shouldn't just be fixed each time it happens. Instead, ask:

- Is a feedforward document missing?
- Do tests need to be added?
- Can a lint rule or static analysis be added?
- Does AGENTS.md or a skill need to be updated?
- Does a project-specific review checklist need to be created?
- Can manual knowledge be turned into an automated check?

### 5. Be Cautious About Functional Behavior

Functional correctness is the hardest to automate fully. AI-generated tests cannot be equated directly with trustworthy acceptance. Important features still need clear specifications, acceptance criteria, manual exploratory testing, and, when necessary, domain expert reviews.

## Checklist for Building a Coding Agent Harness

### Phase 1: Establishing Basic Controllability

- Create or update AGENTS.md, explaining project rules, workflows, testing methods, and security limits.
- Ensure the project has one-click commands for install, test, and build.
- Set up type checking, linting, formatting, and unit tests.
- Document common task workflows in how-to guides or skills.
- Ensure the agent clearly knows which files can be modified and which should not be changed manually.

### Phase 2: Strengthening the Feedback Loop

- Automatically execute fast tests and type checks after agent modifications.
- Provide clear correction guidance for common failure messages.
- Add architectural boundary checks or dependency rules.
- Add contract tests or approval tests for important modules.
- Feed CI results back into the agent's correction process.

### Phase 3: Adding Semantic-Level Checks

- Establish a code review skill or checklist.
- Create specialized review processes for architecture, security, performance, and test quality.
- Let AI reviews find high-risk issues first, rather than replacing all manual reviews.
- Periodically review false positives and false negatives from AI reviews.

### Phase 4: Establishing the Harness Improvement Loop

- Collect common error patterns from the agent.
- Turn recurring errors into rules, tests, documentation, or tools.
- Periodically check that AGENTS.md, skills, CI, and linting are consistent with each other.
- Have the agent suggest harness improvements based on CI, reviews, and production data.
- Flag risks, costs, benefits, and automation levels for improvement suggestions.

## Observations Applicable to This Project

This repository itself is a collection of skills and agent work rules, making it highly suitable for management from a harness engineering perspective.

Consider the following directions:

- Treat each skill as a feedforward guide: it tells the agent how to act in a specific task.
- Treat `test/*.test.js`, `bun run typecheck`, and `bun run build` as computational feedback sensors.
- Treat `src/hooks/secret-guard.ts` and `hooks/hooks.json` as part of the security and governance harness.
- In the future, add specialized checks for skill quality, such as SKILL.md structure, required sections, valid reference paths, and template consistency.
- Establish a "skill review checklist" to assist in checking if instructions are clear, too broad, or in conflict with other skills using inferential review.

## Most Important Conclusion

The reliability of an AI agent is not produced naturally by model capability alone; it is formed by the combination of the model, context, tools, checks, feedback, and human governance.

The human role should not be simplified into two extremes: either exiting completely or guarding every line. A more sustainable approach is to stand above the loop, continuously designing and improving the system in which the agent works.

For teams actually delivering products, harness engineering will become a core engineering capability: gradually transforming human experience, team conventions, architectural judgment, and quality standards into a work environment that an agent can follow, execute, check, and continuously improve.
