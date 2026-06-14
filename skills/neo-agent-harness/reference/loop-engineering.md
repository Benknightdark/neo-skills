# Loop Engineering

Use this reference when designing loop architectures that automate agent-driven workflows beyond a single session.

## Relationship Between Loops and Harnesses

- Harness = the working environment for a single agent (guides + sensors + gates)
- Loop = the scheduling layer on top of the harness that lets the harness run itself
- Designing a loop does not replace prompts; it systematizes repetitive prompt actions

```text
Loop = Automations + Worktrees + Skills + Connectors + Sub-agents + State
       ─────────────────────────────────────────────────────────────────
                          running on top of the Harness
```

## Five Primitives + State

### 1. Automations (Heartbeat)

A loop without automations runs only once; automations make it repeat.

- Schedule-driven triggers that periodically run exploration and classification.
- Findings go to the triage inbox; non-findings are auto-archived.
- Pair with skills to keep scheduled tasks maintainable—invoke `$skill-name` instead of pasting a wall of instructions.
- `/loop` repeats at a set frequency; `/goal` runs until a stop condition is met, with an independent model judging completion.

Tool mapping:

- Codex: Automations tab (select project, prompt, frequency, environment); results go to Triage inbox; `/goal` for run-until-done.
- Claude Code: `/loop`, `/goal`, hooks, cron, GitHub Actions.

### 2. Worktrees (Isolation)

Prevent file conflicts when multiple agents run in parallel.

- Each agent works in its own git worktree, sharing repo history.
- One agent's edits never touch another agent's checkout.
- Human review bandwidth is still the bottleneck—worktrees solve mechanical conflicts, but the number of agents you can run is limited by how many threads you can review simultaneously (orchestration tax).

Tool mapping:

- Codex: Built-in worktree per thread.
- Claude Code: `git worktree`, `--worktree` flag, subagent `isolation: worktree` setting.

### 3. Skills (Crystallized Knowledge)

Write repeatedly explained project context into a SKILL.md.

- Eliminate intent debt: on every cold start, an agent fills intent gaps with confident guesses. A skill externalizes intent so the agent reads it every time instead of reconstructing it.
- A loop without skills re-derives your entire project from scratch each cycle; a loop with skills carries forward knowledge from the last run.
- A skill is an authoring format; a plugin is a distribution format—package skills as plugins when sharing across repos.

Tool mapping:

- Codex: Agent Skills (`SKILL.md`), invoked via `$name` or `/skills`, or auto-triggered by description.
- Claude Code: Agent Skills (`SKILL.md`).

### 4. Plugins / Connectors (External Integration)

Connect external tools via MCP so the loop can act in real environments.

- Can connect to issue trackers, databases, staging APIs, Slack.
- Both Codex and Claude Code use MCP; connectors are generally cross-tool portable.
- Plugins bundle connectors and skills together for one-step team installation.

A loop without connectors can only output suggestions; a loop with connectors can open PRs, link tickets, and ping channels directly.

### 5. Sub-agents (Separating Generation from Verification)

The structural premise of a loop is separating maker from checker.

- The model that writes the code grades its own work too leniently. A second agent with different instructions (sometimes a different model) catches issues the first agent convinced itself to accept.
- `/goal` also uses maker/checker separation under the hood—an independent small model judges whether the loop is done, rather than letting the working agent declare itself finished.
- Common division of labor: one explores, one implements, one verifies against spec.
- Sub-agents burn more tokens; spend them where a second opinion is worthwhile.

> **Responsibility boundary**: This section only covers the design rationale for why loops need maker/checker separation. For implementation details such as sub-agent definition format, instruction writing, and model selection, use the `neo-sub-agent` skill.

Tool mapping:

- Codex: TOML definition files under `.codex/agents/`, each with name, description, instructions, optional model, and reasoning effort.
- Claude Code: Subagent definitions under `.claude/agents/` + agent teams.

### 6. State (External Memory)

Models forget between conversations; progress must be written to the repo.

- Format: markdown files, Linear boards, or any persistent store outside the conversation.
- State tracks what was done, what passed, and what remains. Every long-running agent depends on it: agents forget, repos don't.

## Primitives Comparison Table

| Primitive | Role in Loop | Codex | Claude Code |
|:--|:--|:--|:--|
| Automations | Scheduled exploration and classification | Automations tab, `/goal` | `/loop`, `/goal`, hooks, cron, GitHub Actions |
| Worktrees | Parallel isolation | Built-in worktree per thread | `git worktree`, `--worktree`, `isolation: worktree` |
| Skills | Crystallized project knowledge | Agent Skills (`SKILL.md`), `$name` | Agent Skills (`SKILL.md`) |
| Plugins / Connectors | External tool integration | Connectors (MCP) + Plugins | MCP servers + Plugins |
| Sub-agents | Separating generation from verification | `.codex/agents/` TOML | `.claude/agents/` + agent teams |
| State | Cross-conversation progress | Markdown / Linear connector | Markdown (`AGENTS.md`, progress files) / Linear MCP |

## Example: A Complete Loop Flow

1. **Automation** runs on the repo every morning; prompt invokes the triage skill.
2. Triage skill reads yesterday's CI failures, open issues, and recent commits.
3. Noteworthy findings are written to a **state file** or Linear board.
4. For each finding, an isolated **worktree** is created.
5. A **sub-agent** (maker) is sent into the worktree to draft a fix.
6. A second **sub-agent** (checker) reviews the draft using project **skills** and existing tests.
7. **Connectors** open a PR, update the ticket, and ping the channel once CI passes.
8. Findings that cannot be handled are sent to the triage inbox for humans.
9. The **state file** records what was attempted, what passed, and what remains open.
10. Tomorrow morning's run picks up from state.

You design it once; after that, you never manually prompt any step.

## Three Major Loop Risks

### 1. Verification Is Still on You

An unattended loop also makes mistakes unattended. Maker/checker separation is necessary but not sufficient—"done" is a claim, not a proof. Your job is to ship code you have confirmed works.

### 2. Comprehension Debt

The faster a loop produces code you didn't write, the larger your understanding gap grows. Unless you read what the loop produces, comprehension debt only accelerates.

### 3. Cognitive Surrender

When a loop runs itself, people easily stop having opinions and accept everything at face value. The same loop design, used by someone with judgment, accelerates deeply understood work; used by someone without judgment, it becomes a way to avoid understanding the work itself—same action, opposite outcomes.

### Risk Mitigation Strategies

- Periodically spot-check loop output; don't rely solely on green CI.
- Set output volume caps on the loop to prevent review backlog from spiraling.
- Record the timestamp of the last human review in the state file.
- Force high-risk changes (security, compliance, product scope) to exit the loop and wait for a human.
- Regularly feed loop error patterns back to improve the harness (agentic flywheel).

## When to Introduce a Loop vs. Stay with the Harness

| Condition | Recommendation |
|:--|:--|
| Project lacks reliable local verification commands | Build the harness first |
| CI is unstable or frequently red | Fix CI first |
| Team has no review process for agent output | Establish a review process first |
| Maturity Level < 3 | Upgrade the harness first |
| Highly repetitive, low-risk tasks (triage, format fixes, dependency updates) | Good fit for a loop |
| Changes involve product scope, security, or architecture trade-offs | Not suitable for a fully automated loop |
