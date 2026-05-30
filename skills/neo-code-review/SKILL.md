---
name: neo-code-review
description: >
  Systematically reviews source code for quality, performance, security, and style issues. Use this skill when the user submits code for review, asks for feedback or a code audit, wants to identify bugs/vulnerabilities, or requests a review of recent changes (such as git diff, staged changes, or a specific commit).
---

# Code Review Specifications

Apply the Reviewer Pattern. Follow this protocol strictly to systematically, objectively, and constructively review the user's code changes.

---

## 1. Perceive Phase

1. **Identify the Input Source**:
   - **Scenario A: Specific files are provided**
     - If the user provides specific file paths or directly attaches code snippets in the conversation, use them as the primary targets for review.
   - **Scenario B: No files are specified but inside a Git repository**
     - If the user asks to "review changes", "review PR", or asks for a review without providing explicit code but the project is a Git repository, **proactively run the helper script** to fetch the changes:
       ```bash
       uv run skills/neo-code-review/scripts/git-diff-reviewer.py
       ```
     - To review only the staging area, append the `--staged` argument.
     - To review a specific commit range, append the `--commit <range>` argument.
   - **Scenario C: No changes detected and not a Git repository**
     - If no code input is detected and the environment is not a Git repository, gracefully prompt the user: "No code changes detected. Please provide a specific code snippet or file path." and terminate the review.

2. **Identify Programming Languages & Frameworks**:
   - Identify the programming language (e.g., TypeScript, C#, Python) and relevant frameworks in the code changes to apply language-specific style standards in subsequent phases.

---

## 2. Reason Phase

1. **Load the Review Checklist**:
   - Before evaluating any code, **always read** the external review checklist reference:
     [review-checklist.md](file:///Users/ben/Projects/neo-skills/skills/neo-code-review/references/review-checklist.md)
   
2. **Systematically Evaluate Code**:
   - Analyze the code logic deeply and compare it against the checklist dimensions: Correctness, Regression Risk, Security, Performance, Data & Concurrency, Test Gaps, SOLID/Design Principles, Logging/Observability, Maintainability, and Style.
   - Prioritize evidence-backed findings that create concrete behavioral, security, operational, compatibility, or maintainability risk.
   - Filter out **🔴 Critical Issues (Must-fix)** for defects such as requirement breakage, security vulnerabilities, data corruption/loss, broken authorization, severe regressions, or production-impacting reliability failures.
   - Classify lower-risk performance, design, logging, test coverage, readability, and maintainability issues under **🟡 Suggestions** when they have a clear reason and actionable remediation.

---

## 3. Act Phase

Generate a highly structured and elegant Code Review Report in **Traditional Chinese (Taiwan)**. The report must strictly follow this format:

### 🔍 審查摘要 (Summary)
- **整體評估 (Overall Assessment)**: Provide a brief summary and a clear status rating (e.g., "🔴 需要重大修正後合併" (Needs major changes before merging), "🟡 建議修正後合併" (Recommended to fix before merging), "🟢 結構優良，隨時可合併" (Excellent structure, ready to merge)).
- **變更概述 (Change Overview)**: Briefly describe the main purpose and scope of this change.

### 🔴 嚴重問題 (Critical Issues)
*This section must ONLY contain **Must-fix** items (security vulnerabilities, critical logic bugs, or severe flaws that may cause system failure). If none are found, write "無" (None).*
- **[檔案路徑 / 程式碼區段]** (File Path / Code Snippet)
  - **問題描述 (Problem Description)**: Clearly state what the problem is.
  - **嚴重原因 (Severity Reason)**: Explain *why* this is a critical issue and its potential consequences.
  - **修復方案 (Remediation)**: Provide a **concrete corrected code snippet (Code Snippet)** comparing it with the original or showing the fixed version.

### 🟡 改進建議 (Suggestions)
*Includes suggestions for performance optimization, clean code refactoring, edge-case handling, and comment improvements.*
- **[檔案路徑 / 程式碼區段]** (File Path / Code Snippet)
  - **建議事項 (Recommendation)**: How to optimize the code for performance, readability, or maintainability.
  - **推薦做法 (Proposed Fix)**: Provide an optimized code example.

### 🟢 優秀之處 (Praise) (Optional)
- Highlight exceptionally well-written, elegant, highly readable, or well-tested code sections to encourage best practices.

### ❓ 疑問與釐清 (Questions) (Optional)
- Ask objective questions regarding business logic or unexpected implementations to seek clarification from the user.

---

## 4. Communication Guidelines

- **Focus on the Code, not the Coder**: Be constructive, objective, respectful, and humble.
- **Provide Code Snippets**: Always provide a "corrected code example" for identified issues where applicable. Avoid purely theoretical descriptions.
