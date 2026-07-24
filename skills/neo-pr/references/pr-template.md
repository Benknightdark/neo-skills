# PR Title & Description Standard Reference

This document serves as the standard PR output template and Anti-Slop writing reference for the `neo-pr` skill.

---

## 1. PR Title Standard (Conventional Commits)

Titles must be clear, concise, and directly reflect the underlying changes using Conventional Commits format:

`<type>(<scope>): <description>`

### Common Types:
* `feat`: A new feature
* `fix`: A bug fix
* `refactor`: A code change that neither fixes a bug nor adds a feature
* `docs`: Documentation changes only
* `test`: Adding missing tests or correcting existing tests
* `chore`: Changes to the build process, auxiliary tools, or dependencies
* `perf`: A code change that improves performance

---

## 2. PR Description Template

The PR output **must strictly be wrapped in a Markdown code block** (i.e. raw Markdown source code ` ```markdown ... ``` `) so that users can easily copy it directly into GitHub/GitLab PR description fields. The output format must strictly follow:

````markdown
```markdown
標題：
<type>(<scope>): <short summary>

內容：
- **[重要變更/關鍵模組 1]**：說明具體調整內容與目的。
- **[重要變更/關鍵模組 2]**：說明具體調整內容與目的。
```
````

---

## 3. Anti-Slop Conversion Table

When drafting PR descriptions, rigorously filter out filler words according to the following mapping:

| ❌ Fluff Phrase | ⭕ Clean Alternative | Explanation |
| :--- | :--- | :--- |
| It is worth noting that this PR refactors auth logic. | 重構驗證邏輯，改用統一中介軟體。 | Delete throat-clearing openers; use direct action verbs. |
| This PR aims to resolve a potential crash during login. | 修復登入時因 null 使用者引發的閃退問題。 | Omit "This PR aims to"; state goal and root cause directly. |
| In summary, this change seamlessly boosts system performance. | 減少 DB 查詢，降低 API 延遲 40ms。 | Replace "seamlessly" with concrete metrics. |
