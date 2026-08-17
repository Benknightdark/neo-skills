---
name: neo-stop-slop
description: >
  Use this skill when the user wants to polish, rewrite, shorten, or review prose so
  it sounds natural rather than AI-generated. Trigger for Traditional Chinese or English
  drafts, rough notes, source material, articles, technical docs, code comments, commit
  messages, PR descriptions, sales copy, or requests to remove AI tells, slop, fluff,
  or formulaic phrasing.
license: MIT
compatibility: Requires Node.js (ESM) to run the analyze-slop.js script.
metadata:
  author: Ben Knight Dark
  version: "1.1.0"
  patterns: reviewer, generator
---

# Neo Stop Slop

`neo-stop-slop` is a writing skill for removing AI tells, filler, and formulaic verbosity from Chinese and English prose. It handles copy, technical drafts, code comments, Git commits, PR descriptions, and rough notes or source material that need to become clear, accurate articles.

It combines two core workflows: **Reviewer** for diagnosing text and **Generator** for rewriting it. Article Rewrite rules add source fidelity and Taiwan Traditional Chinese writing guidance where needed.

---

## Gotchas

*   **Over-shortening risk**: When rewriting, preserve all important technical details and facts. Removing AI tells means removing filler and decorative structure, not deleting substance.
*   **Article Rewrite fact boundary**: When handling drafts, notes, articles, or source material, use only information supplied and supported by the user. Do not add external context, data, causality, motives, impact, or unverified conclusions. Preserve uncertainty, attribution, and contradictions. See `references/article-rewrite.md` for the complete rules.
*   **Code syntax and comment markers**: When trimming code comments, do not break XML documentation structures such as C# `<summary>` and `<param>`, or JSDoc/TSDoc markers.
*   **Analyzer execution**: Run `analyze-slop.js` non-interactively with `--file` or `--input`, optionally using `--format json`; never invoke a TTY prompt that could hang the agent.

---

## Workflow Checklist

Progress:
- [ ] **Step 1 — Perceive**: Identify the language, content context, and output goal. Route the request to `Review`, general `Rewrite`, or `Article Rewrite`.
- [ ] **Step 2 — Reason**: Load only the `references/` resources relevant to the context. Article Rewrite must load `article-rewrite.md`.
- [ ] **Step 3 — Act: Review**: Run `analyze-slop.js` only when the user asks for an AI-tell diagnosis.
- [ ] **Step 4 — Act: Rewrite**: Remove information-free filler, formulaic structures, and vague wording. In Article Rewrite mode, reorder the supplied information without deleting facts for brevity.
- [ ] **Step 5 — Verify**: Check style, source fidelity, output format, and technical markers according to the selected mode. Treat analyzer scores as diagnostic signals, not hard gates for every mode.

---

## Detailed Guidelines

### Step 1 — Perceive
Analyze the user's request and text carefully:
1.  **Detect the language**: Determine whether the primary language is **Taiwan Traditional Chinese** or **English**.
2.  **Classify the context**:
    *   *General copy or drafts*: Load `phrases-zh.md` or `phrases-en.md`, plus `structures.md`.
    *   *Developer text (comments, commits, or PRs)*: Load `dev-slop.md`.
    *   *Article Rewrite (rough notes, source material, news, or technical content)*: Load `article-rewrite.md` and prioritize source fidelity and natural narrative flow.
3.  **Choose the mode**:
    *   If the user asks whether text contains AI tells or asks for a text review, use **Review mode**.
    *   If the user directly asks to rewrite text or remove AI tells, use **Rewrite mode**.
    *   If the user asks to organize drafts, notes, articles, or source material into a complete article, use **Article Rewrite mode**.

---

### Step 2 — Reason & Load References
Load the skill's focused reference material dynamically. Based on Step 1, load the applicable paths:
*   **General English**: `references/phrases-en.md`
*   **General Chinese**: `references/phrases-zh.md`
*   **Formulaic structures**: `references/structures.md`
*   **Developer-specific guidance**: `references/dev-slop.md`
*   **Article Rewrite guidance**: `references/article-rewrite.md`
*   **Before/after examples**: `references/examples.md`

---

### Step 3 — Act: Review
1.  Write the user's text to a temporary file or pass it directly as an argument to the analyzer.
2.  Run `analyze-slop.js` non-interactively:
    ```bash
    node skills/neo-stop-slop/scripts/analyze-slop.js --input "[user input text]" --format json
    ```
3.  Parse the JSON output and extract:
    *   **Slop Density Score**
    *   **Grade**
    *   **Violations**
4.  Use the Output Templates to present a slop diagnosis, including violation line numbers, categories, and concrete restructuring suggestions.

---

### Step 4 — Act: Rewrite
Follow these rules in general Rewrite mode; use `references/article-rewrite.md` instead for Article Rewrite:
1.  **Cut fillers**: Remove openers such as 「值得注意的是」, 「不容忽視」, and "Here's the thing".
2.  **Use active voice**: Give each sentence a concrete subject, such as a person or component, that performs the action. Avoid anthropomorphism such as "The code wants to...".
3.  **Break formulaic setups**: Remove binary contrasts such as 「不是因為 X，而是因為 Y」 and rhetorical prompts such as 「試想一下：」.
4.  **Be specific**: Replace vague claims such as 「大幅提升效能、解決痛點」 with concrete results, such as 「減少 80% 記憶體開銷」.
5.  **Preserve substance**: Remove information-free filler and repetition without applying a fixed word-reduction target or sacrificing facts, conditions, limitations, or technical details.
6.  **Apply developer conventions**: For code comments or Git commits, follow the concise-writing rules in `dev-slop.md`.

In Article Rewrite mode, first extract and reorder the supplied information, then output only the article body. Do not use the general Rewrite word-count target or report format.

---

### Step 5 — Verify
1.  In general Rewrite mode, you may run the rewritten text through the analyzer again:
    ```bash
    node skills/neo-stop-slop/scripts/analyze-slop.js --input "[rewritten text]" --format json
    ```
2.  Compare `slopDensityScore` with the source as a style signal. Unless the user asks otherwise, do not treat `A+` or `< 0.5%` as a hard gate.
3.  Do not use the analyzer to verify facts in Article Rewrite mode. Apply the fact and naturalness checks in `article-rewrite.md`, and output only the article body.
4.  If a general Rewrite response includes a diagnostic summary, it may report word-count and slop-density changes, but must not delete substance to improve the score.

---

## Output Templates

### 1. Review Report Template
When the user asks for a text review or diagnosis, format the response as follows:

```markdown
### 🔍 AI Slop Review

*   **Word count**: [total words]
*   **AI tell count**: [violation count]
*   **Slop density score**: **[score]%** ([violation count] matches per 100 words)
*   **Grade**: **[grade]**

#### ⚠️ Violations and restructuring suggestions
| Line | Detected phrase | Category | Diagnosis and restructuring suggestion |
| :--- | :--- | :--- | :--- |
| Line X | "值得注意的是" | Throat-clearing opener | Delete the transition and state the following fact directly. |
| Line Y | "賦能生態系" | AI slop word | Replace it with 「提供技術支持」 or 「構建合作社群」. |

#### 📝 Summary of recommendations
1. [A concrete recommendation about the article's structure]
2. [A recommendation about adverbs or passive voice]
```

### 2. General Rewrite Result Template
When the user asks for a general rewrite, format the response as follows. Do not use this template for Article Rewrite:

```markdown
### ✨ AI-Slop-Free Rewrite

*   **Word-count change**: [original count] ➡️ **[rewritten count]** (include the reduction percentage only when useful)
*   **Slop density**: [original density]% ➡️ **[rewritten density]%** (diagnostic only)

---

#### 📄 Rewritten text
> [Insert the concise, natural rewrite here. Keep the formatting clean and avoid AI filler.]

---

#### 💡 Key restructuring notes
1. **[Restructuring point 1]**: Changed 「[before text]」 to 「[after text]」, removed 「[AI tell]」, and made the tone more [active/direct].
2. **[Restructuring point 2]**: Removed filler and replaced the vague 「[before wording]」 with the concrete fact 「[specific content]」.
```

### 3. Article Rewrite output

After applying `references/article-rewrite.md`, **output only the article body**. Do not add a title unless the user explicitly requests one or the source already has one. Do not output restructuring notes, analysis, fact lists, edit summaries, check results, or additional commentary.
