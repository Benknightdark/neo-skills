---
name: generate-skill
description: 引導使用者建立高品質的技能定義檔 (SKILL.md)，參考 5 種核心設計模式。
---

# Skill Generator Specification

## Perceive
1. Receive user requirement descriptions about "what kind of new skill they want to create".
2. Confirm the target skill's usage scenarios, the pain points it solves, and the expected outputs (e.g., code, documents, review reports, etc.).

## Reason
1. **Load Reference Patterns**: Load and analyze `.gemini/skills/generate-skill/reference/SkillCategory.md` to understand 5 core design patterns:
   - **Tool Wrapper**: Suitable for encapsulating APIs, libraries, or team development conventions.
   - **Generator**: Suitable for consistently producing structured documents in specific formats (e.g., reports, templates).
   - **Reviewer**: Suitable for systematically checking the quality of code or outputs (e.g., security, style).
   - **Inversion**: Suitable for guided requirement gathering, ensuring the Agent does not guess answers prematurely.
   - **Pipeline**: Suitable for complex tasks that require a strict execution order and cannot skip steps.
2. **Requirement Matching**: Based on the user's requirement description, analyze which design pattern (or combination of patterns) is most suitable for the skill.
3. **Structure Planning**: Formulate specific content for the Perceive, Reason, and Act phases of the target skill, ensuring logical coherence.

## Act
1. **Pattern Recommendation & Explanation**: Present the recommended pattern(s) and their advantages to the user, explaining why this pattern fits their requirement.
2. **Gather Necessary Variables**: Guide the user to provide key information needed to generate `SKILL.md`, including:
   - Skill name (`name`)
   - Description (`description`)
   - Metadata (`metadata`, optional)
   - Specific calculation logic for Perceive/Reason/Act
3. **Generate File Content**:
   - Precisely generate the complete `SKILL.md` source code based on the selected pattern template.
   - Ensure the output content complies with `SKILL.md` standard specifications.
4. **Provide Advanced Suggestions**: Prompt the user to subsequently create `assets/` templates or `references/` reference files to further enhance the stability of the skill.
