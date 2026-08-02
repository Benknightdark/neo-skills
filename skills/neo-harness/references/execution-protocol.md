# Agent Execution Protocol & Safety Redlines

This reference synthesizes execution laws, closed-loop SOPs, and antipattern rules from `neo-agent-protocol`.

## The 5 Agent Harness Laws

### Law 1: Feedforward First (Read Before Modify)
- Read `AGENTS.md` and target source files before making edits.
- Never guess API signatures, struct fields, or database schemas. Inspect authoritative files first.

### Law 2: Deterministic Sensors & Verification Gates
- Execute test/lint/build commands after every edit. Never declare completion without log proof.
- Zero-fake pass: Never patch errors by swallowing exceptions, returning dummy fallbacks, commenting out broken assertions, or deleting failing unit tests.

### Law 3: Dual Closed-Loop Execution Protocol
- **Online Execution Loop**: Perceive ➔ Execute (Atomic Diff) ➔ Sense (Fast Local Check) ➔ Remediate (Fix using Log Evidence).
- **Offline Evolution Loop**: Convert recurring agent errors into permanent linter rules or test cases.

### Law 4: Context Collapse Defense & State Persistence
- Maintain disk-based progress files (`Plan.md` or `Progress.md`) for long-horizon or multi-file tasks.
- Keep single-turn code diffs small and targeted.

### Law 5: Human Decision Points & Safety Redlines
Immediately pause and request human intervention when encountering:
- Destructive file/database operations or git history resets.
- Secret/credential exposures or modifications.
- High-risk production deployments, compliance, or architecture trade-offs.

---

## High-Risk Antipattern Redlines

| Forbidden Antipattern | Description & Hazard | Mandatory Alternative |
| :--- | :--- | :--- |
| **Silent Exception Swallowing** | Wrapping errors in empty `try/catch` or returning empty default values. | Surface errors or handle explicitly with verified logging. |
| **Test Deletion / Suppression** | Deleting or commenting out failing test assertions to pass CI. | Fix root cause in source code or update test contract with justification. |
| **Hallucinated Signatures** | Calling functions without reading their definition file. | View target symbol definition file first using code search. |
| **Unverified Completion Claim** | Telling the user a task is fixed without running verification commands. | Run exact test/build commands and present log proof. |

---

## Log-Driven Diagnostic Checklist

1. When a command fails, fetch and read the complete, un-truncated error log.
2. Identify the exact file line number and root cause exception message.
3. Formulate a targeted fix addressing the root cause, not just masking the symptom.
4. Re-run verification commands to confirm the fix works cleanly.
