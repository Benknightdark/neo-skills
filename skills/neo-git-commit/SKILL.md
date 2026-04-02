---
name: neo-git-commit
description: Analyzes staged changes, generates a high-quality Conventional Commits message in Traditional Chinese, and executes the commit only after user confirmation.
disable-model-invocation: true
---

# Git Commit Message Generator

## CRITICAL SAFETY PROTOCOL

- **Absolute prohibition**: Never execute `git commit` in the same turn you generate the commit message.
- **Wait for confirmation**: Output the proposed message, then stop immediately and ask the user to confirm.
- **User-triggered only**: Only execute the commit in the next turn if the user explicitly replies with "yes", "ok", "是", or "commit".
- **No commit trailers**: Do **not** generate or append any commit trailer lines such as `Co-authored-by:`, `Signed-off-by:`, `Reviewed-by:`, or similar metadata unless the user explicitly requests them.

---

## Perceive

1. Run `git add .` to stage all changes.
2. Run `git diff --staged` to retrieve the full staged diff.
3. If the staging area is empty, inform the user "No staged changes found." and stop.

## Reason

Analyze the diff to determine the core intent of the changes:

1. **Full scan**: Identify added, deleted, and modified files.
2. **Find correlations**: Determine whether the changes serve a single goal (e.g., adding a Model and updating a Service indicates a feature implementation).
3. **Filter noise**: Ignore pure formatting adjustments (whitespace, line endings) and focus on logical changes.
4. **Define type**: Choose the most accurate Conventional Commits type based on the primary purpose of the changes.

## Act

### Step 1: Generate the commit message

Output strictly in the following format:

```
<type>(<scope>): <subject>

<body>
```

**Type** — choose the most appropriate one:

| Type | When to use |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation changes only |
| `style` | Formatting, no logic change |
| `refactor` | Refactoring, not a feature or fix |
| `perf` | Performance improvement |
| `test` | Adding or modifying tests |
| `build` | Build system or dependency changes |
| `ci` | CI/CD configuration changes |
| `chore` | Other maintenance tasks |
| `revert` | Reverting a previous commit |

**Quality rules**:

- **Subject**: Max 50 characters, imperative mood (e.g., "新增...", "修復...", "移除...").
- **Body**:
  - Use bullet points (`-`) for complex changes to explain each detail.
  - May be omitted for simple documentation or minor fixes.
  - For new files, describe their purpose.
- **Language**: Both Subject and Body must be written in **Traditional Chinese (Taiwan)**.
- **Tone**: Professional and concise — avoid filler phrases like "This change is for...".
- **Forbidden content**: Do **not** include `Co-authored-by`, `Signed-off-by`, or any other trailer/footer metadata in the generated commit message.

### Step 2: Ask for confirmation

Output the generated commit message inside a code block, then **stop immediately** and ask:

> 請問是否要執行此 commit？（輸入「是」或「yes」確認）

### Step 3: Execute (only after user confirms)

Run:

```bash
git commit -m "<subject>" -m "<body>"
```

Do not append any extra trailer/footer metadata unless the user explicitly requests it.

After execution, run `git log --oneline -1` and display the result to confirm the commit was created successfully.
