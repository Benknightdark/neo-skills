# Agent Execution Rules & Diagnostic Reference

This reference provides concrete execution guidelines, diagnostic checklists, and antipattern rules for AI Agents performing software development tasks.

## Agent Execution Checklist

### 1. Pre-Execution Phase (Perception & Boundaries)
- [ ] Have I checked `AGENTS.md` and repository guidelines?
- [ ] Have I identified the project type, build toolchain, and primary language?
- [ ] Do I have exact one-click verification commands (e.g., `npm test`, `pytest`, `cargo test`)?
- [ ] Am I editing only files relevant to the task?

### 2. Execution Phase (Code Generation & Modification)
- [ ] Are code edits atomic, minimal, and targeted?
- [ ] Did I preserve existing comments, public API contracts, and naming conventions?
- [ ] Am I using explicit imports and verified symbols instead of guessing exports?
- [ ] Did I avoid adding unrequested dependencies or third-party packages?

### 3. Post-Execution Phase (Sensors & Verification)
- [ ] Did I execute local tests, linters, or typecheck commands?
- [ ] If a command failed, did I inspect the full error log instead of guessing?
- [ ] Did I verify that all tests PASS before claiming completion?
- [ ] Is there any unhandled exception or silent fallback introduced?

---

## High-Risk Antipatterns (Strictly Forbidden)

| Antipattern | Description & Risk | Required Alternative |
| :--- | :--- | :--- |
| **Silent Exception Swallowing** | Wrapping broken logic in empty `try/catch` or returning empty default arrays without logging. | Let errors surface or handle explicitly with verified logging. |
| **Test Deletion / Suppression** | Commenting out or deleting failing unit test assertions to force a CI build to pass. | Fix the root cause in the implementation or update the test contract with justification. |
| **Hallucinated Signatures** | Calling imported functions or methods without inspecting their definition file. | Read the target symbol definition using code search or view_file first. |
| **Unverified Success Claim** | Reporting to the user that a bug is fixed or feature is complete without running verification commands. | Run exact test/build commands and present empirical sensor output. |
| **Context Exhaustion Shift** | Modifying dozens of files in a single turn without saving progress. | Break tasks into small chunks and persist state in `Plan.md` or `Progress.md`. |

---

## State Persistence & Session Handoff Template

When executing multi-step tasks across session resets or context compaction, create or update a persistent progress file using this format:

```markdown
# Task Progress & State Persistence

## Active Goal
- [Description of current task objective]

## Completed Milestones
- [x] Milestone 1: Verified project structure and tests.
- [x] Milestone 2: Implemented feature module.

## Pending Verification
- [ ] Milestone 3: Run full integration test suite.

## Remaining Risks & Decisions
- [Open question or architectural tradeoff needing human review]
```
