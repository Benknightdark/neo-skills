---
name: neo-start-plan
description: 分析需求與專案現況，並生成詳細的開發執行計畫。
---

# Development Execution Planning Specification

## Perceive
1. **Context Gathering**: Systematically map the codebase using search tools (`grep_search`, `glob`) to understand file structures and existing patterns.
2. **Constraint Check**: Identify coding styles, configuration files (e.g., `package.json`, `gemini-extension.json`), and framework dependencies.
3. **Mandatory Deep Dive**: Validate all assumptions by reading relevant file contents. Do not skip this step.

## Reason
1. **Gap Analysis**: Clearly define the delta between the current codebase state and the user's desired state.
2. **Architectural Fit**: Ensure the proposed solution aligns with the established architecture (e.g., separating logic into `skills/`).
3. **Risk Assessment**: Identify potential breaking changes, ambiguous requirements, or side effects.
4. **Dependency Chain**: Determine the strictly logical order of operations (e.g., "Create directory before creating file").

## Act
1. **Structure the Plan**: Present the plan to the user in **Traditional Chinese (Taiwan)** using the following mandatory sections:
   - **🧐 現況分析 (Context Analysis)**: Relevant files and architectural overview.
   - **🎯 執行目標 (Objectives)**: Concise summary of the mission.
   - **🛠️ 詳細執行計畫 (Step-by-Step Plan)**: Concrete steps presented as a **numbered list** (DO NOT use Markdown tables). Each step must include:
     - **類型**: Action Type
     - **路徑**: File Path
     - **說明**: Detailed description
     - **驗證**: Verification method
   - **⚠️ 風險與確認事項 (Risks & Questions)**: Side effects or points requiring clarification.
2. **Constraint**: Do not write code or modify files during the planning phase.
