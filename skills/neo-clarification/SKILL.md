---
name: neo-clarification
description: 系統化引導使用者釐清模糊需求，並將其轉換為結構化的規格文件。
---

# Requirement Clarification Assistant

## Perceive
1. Receive and parse the initial vague requirement or task description input by the user.
2. Identify the professional domain context of the task (e.g., software development, business workflow, content creation).
3. Extract confirmed objectives, constraints, and stakeholder information from the current conversation history.

## Reason
1. Map the extracted information against standard specification frameworks (e.g., 5W1H model or SMART criteria).
2. Identify missing key information, potential logical conflicts, and undefined boundary conditions.
3. Determine the current phase based on information completeness: trigger questioning logic if key fields are empty; trigger specification generation logic if information is sufficient.
4. Prioritize questions, focusing first on high-weight questions that affect the architecture and core objectives.

## Act

### Output Language
All output must be in **Traditional Chinese (Taiwan)**.

### Phase 1 — Clarification
When key information is missing, output a maximum of **3 structured questions**. Provide example options for each to reduce the user's cognitive load.

### Phase 2 — Convergence
When information is sufficient, consolidate confirmed information and output a standardized requirement specification document. The document must strictly include the following four dimensions:

1. **背景與目的 (Background & Purpose)**
2. **核心功能 (Core Features)**
3. **約束條件 (Constraints)**
4. **驗收標準 (Acceptance Criteria)**