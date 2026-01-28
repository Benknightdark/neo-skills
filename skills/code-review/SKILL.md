---
name: code-review-architect
description: Analyze code changes to identify issues, potential bugs, and areas for improvement across multiple dimensions like security, performance, and style.
---

# Code Review Specifications

## Perceive (Analysis Phase)
1. **Scope Identification**:
   - Analyze the provided code diffs or file contents.
   - Identify the languages and frameworks involved (e.g., TypeScript, C#, Python, React).
   - Determine the nature of the change (e.g., Feature, Bugfix, Refactor, Config).

2. **Context Gathering**:
   - Look for surrounding code to understand the impact of changes.
   - Check for relevant configuration files (e.g., `tsconfig.json`, `.eslintrc`, security policies) if available in the provided context.

## Reason (Evaluation Phase)
Evaluate the code against the following dimensions:

1.  **Correctness & Logic**:
    - Does the code do what it's supposed to do?
    - Are there any edge cases missing?
    - Are there potential concurrency issues (race conditions, deadlocks)?

2.  **Security (Critical)**:
    - **Injection Flaws**: SQLi, XSS, Command Injection.
    - **Data Exposure**: Hardcoded secrets, sensitive data logging.
    - **Auth**: Improper authentication or authorization checks.
    - **Dependencies**: Use of known insecure functions or patterns.

3.  **Performance**:
    - **Efficiency**: Algorithmic complexity (Big O).
    - **Resources**: Memory leaks, unclosed file handles/connections.
    - **Database**: N+1 queries, missing indexes.

4.  **Maintainability & Readability**:
    - **Clarity**: Variable/function naming, comment quality.
    - **Complexity**: Cyclomatic complexity, function length.
    - **Modularity**: DRY (Don't Repeat Yourself), SOLID principles.
    - **Testing**: Is the code testable? Are tests included?

5.  **Style & Standards**:
    - Adherence to language-specific conventions (e.g., PEP8 for Python, Airbnb for JS).
    - Consistency with the existing project style.

## Act (Reporting Phase)
Generate a structured Code Review Report in **Traditional Chinese (Taiwan)** with the following sections:

1.  **🔍 審查摘要 (Summary)**:
    - Brief overview of the changes.
    - Overall assessment (e.g., "Ready to merge", "Needs changes", "Major rework needed").

2.  **🔴 嚴重問題 (Critical Issues)**:
    - **Must-fix** items (Security vulnerabilities, Logic bugs, Breaking changes).
    - Clear explanation of *why* it is critical.

3.  **🟡 改進建議 (Suggestions)**:
    - Performance improvements.
    - Refactoring opportunities (Clean Code).
    - Edge case handling.

4.  **🟢 優秀之處 (Praise)** (Optional):
    - Highlight well-written code or clever solutions.

5.  **❓ 疑問 (Questions)** (Optional):
    - Clarification needed on business logic or intent.

**Style Guidelines for the Report**:
- Be constructive and respectful.
- Use code snippets to illustrate the problem or suggested fix.
- Focus on the *code*, not the *coder*.
