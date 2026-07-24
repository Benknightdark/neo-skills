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

### Title Examples:
- ✅ `feat(auth): add Google OAuth login flow and token handler`
- ✅ `fix(cart): resolve overflow in checkout discount calculation`
- ✅ `refactor(db): extract user repository to domain service layer`
- ❌ `Updated some code` (Too vague)
- ❌ `feat(auth): this PR dramatically improves auth security and UX` (Contains AI fluff)

---

## 2. PR Description Template

```markdown
## 📌 Motivation
- [Briefly describe the issue solved, context, or feature request fulfilled]

## 🛠️ Key Changes
- [Key point 1: Modified module/file and rationale]
- [Key point 2: Added logic or architectural improvement]
- [Key point 3: Environment or dependency adjustments]

## ⚠️ Impact & Breaking Changes
- [Detail impacts on other modules, API contracts, or DB schemas. State "None" if inapplicable]

## 🧪 Verification & Test Steps
- [List automated tests executed, e.g., `npm test` or `dotnet test`]
- [Manual verification steps and expected outcomes]
```

---

## 3. Anti-Slop Conversion Table

When drafting PR descriptions, rigorously filter out filler words according to the following mapping:

| ❌ Fluff Phrase | ⭕ Clean Alternative | Explanation |
| :--- | :--- | :--- |
| It is worth noting that this PR refactors auth logic. | Refactor authorization logic to use unified middleware. | Delete throat-clearing openers; use direct action verbs. |
| This PR aims to resolve a potential crash during login. | Fix crash during login caused by null User reference. | Omit "This PR aims to"; state goal and root cause directly. |
| In summary, this change seamlessly boosts system performance. | Reduce DB queries, lowering API latency by 40ms. | Replace "seamlessly" with concrete metrics. |
| Imagine a scenario where unhandled requests hit the server... | Add defensive 401 error handling for unauthenticated requests. | Remove hypothetical setups; state defensive logic clearly. |
