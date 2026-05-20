---
name: generate-skill
description: 引導使用者建立、更新、審查或最佳化高品質 Agent Skill 定義檔 (SKILL.md)，包含官方規格、description 觸發語、references/scripts/assets/evals 結構，以及 5 種核心設計模式。
---

# Skill Generator Specification

## Perceive
1. Receive the user's request to create, update, convert, review, or optimize an Agent Skill.
2. Identify the target task, usage scenarios, pain points, expected outputs, target agent client, and whether the user already has source material such as docs, runbooks, examples, code, prompts, or previous failures.
3. If high-impact information is missing, ask concise follow-up questions before generating final files. Do not invent domain rules that should come from the user or existing project material.

## Reason
1. **Load Official Agent Skills Reference**: Load and analyze `.gemini/skills/generate-skill/reference/AgentSkillsOfficialReference.md` first. Treat it as the source of truth for `SKILL.md` frontmatter, directory structure, progressive disclosure, description triggering, scripts, references, assets, evals, and client implementation considerations.
2. **Load Reference Patterns**: Load and analyze `.gemini/skills/generate-skill/reference/SkillCategory.md` to understand 5 core design patterns:
   - **Tool Wrapper**: Suitable for encapsulating APIs, libraries, or team development conventions.
   - **Generator**: Suitable for consistently producing structured documents in specific formats (e.g., reports, templates).
   - **Reviewer**: Suitable for systematically checking the quality of code or outputs (e.g., security, style).
   - **Inversion**: Suitable for guided requirement gathering, ensuring the Agent does not guess answers prematurely.
   - **Pipeline**: Suitable for complex tasks that require a strict execution order and cannot skip steps.
3. **Load ReAct Guidelines**: Load and analyze `.gemini/skills/generate-skill/reference/ReAct_vs_CLI.md` when the skill involves local exploration, CLI behavior, autonomous debugging, cross-file analysis, CI/CD assistance, or another agentic operating-system workflow.
4. **Requirement Matching**: Based on the user's requirement, choose the most suitable pattern or combination of patterns. Use official Agent Skills format as the baseline; Perceive/Reason/Act is optional structure, not a mandatory official requirement.
5. **Progressive Disclosure Planning**: Decide what belongs in `SKILL.md` versus `references/`, `scripts/`, `assets/`, and `evals/`. Keep `SKILL.md` concise and load detailed material only when needed.
6. **Description & Validation Planning**: Draft a trigger-focused `description`, identify likely should-trigger and should-not-trigger prompts, and plan output quality checks for important or shareable skills.

## Act
1. **Pattern Recommendation & Explanation**: Present the recommended pattern(s), why they fit, and whether a ReAct-style autonomous workflow or simpler CLI/tool-wrapper approach is appropriate.
2. **Gather Necessary Variables**: Guide the user to provide key information needed to generate or update the skill, including:
   - Skill name (`name`)
   - Trigger-focused description (`description`)
   - Target agent/client and compatibility constraints
   - Source material, domain rules, examples, and gotchas
   - Required references, scripts, assets, templates, or evals
   - Optional metadata, license, and allowed tool expectations
3. **Generate File Content**:
   - Generate a standards-compliant `SKILL.md` whose first line is `---`.
   - Ensure `name` is valid and matches the skill directory.
   - Keep the main body procedural, concise, and grounded in provided expertise.
   - Use relative paths from the skill root for all `references/`, `scripts/`, and `assets/`.
   - Generate supporting reference, script, asset, or eval file outlines when they are necessary for reliability.
4. **Quality Gate**: Before finalizing, check the output against `.gemini/skills/generate-skill/reference/AgentSkillsOfficialReference.md`, especially frontmatter validity, description trigger quality, progressive disclosure, resource paths, script safety, and eval recommendations.
5. **Provide Advanced Suggestions**: Recommend trigger evals, output quality evals, reference files, templates, or scripts that would make the skill more reliable in real use.
