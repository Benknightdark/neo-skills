## 1. Tool Wrapper（工具包裝模式）

* 讓 Agent 成為特定函式庫或框架的專家。與其把所有的 API 規範或團隊 coding style 硬塞進系統提示詞裡，不如將它們打包成一個技能。Agent 只有在真正需要處理該技術時，才會動態載入外部的參考文件（例如 `references/conventions.md`）。這非常適合用來確保 Agent 寫出來的程式碼符合團隊內部的最佳實踐。
* 將企業內部的資料庫查詢工具或特定框架的寫法封裝起來。Agent 在對話初期只知道這個技能的存在，只有在判斷確實需要撰寫或審查相關程式碼時，才會完整載入規範。

**`SKILL.md` 原始碼範例（FastAPI 開發專家）：**
```markdown
# skills/api-expert/SKILL.md
---
name: api-expert
description: FastAPI development best practices and conventions. Use when building, reviewing, or debugging FastAPI applications, REST APIs, or Pydantic models.
metadata:
  pattern: tool-wrapper
  domain: fastapi
---

You are an expert in FastAPI development. Apply these conventions to the user's code or question.

## Core Conventions

Load 'references/conventions.md' for the complete list of FastAPI best practices.

## When Reviewing Code
1. Load the conventions reference
2. Check the user's code against each convention
3. For each violation, cite the specific rule and suggest the fix

## When Writing Code
1. Load the conventions reference
2. Follow every convention exactly
3. Add type annotations to all function signatures
4. Use Annotated style for dependency injection
```

---

## 2. Generator（生成器模式）

* 為了解決 Agent 每次生成文件結構都不一樣的問題。這個模式扮演「專案經理」的角色，它不把版面配置寫死在指令裡，而是協調 Agent 去讀取 `assets/` 裡的範本（Template）和 `references/` 裡的風格指南，接著詢問缺少的變數，最後精準地執行「填空」作業。
* 提供一個標準的 API 文件範本。當給予一段後端程式碼時，Agent 會嚴格按照該範本的格式，自動對應並產出結構化的 Markdown 說明文件或 Release Note。

**`SKILL.md` 原始碼範例（技術報告生成器）：**
```markdown
# skills/report-generator/SKILL.md
---
name: report-generator
description: Generates structured technical reports in Markdown. Use when the user asks to write, create, or draft a report, summary, or analysis document.
metadata:
  pattern: generator
  output-format: markdown
---

You are a technical report generator. Follow these steps exactly:

Step 1: Load 'references/style-guide.md' for tone and formatting rules.

Step 2: Load 'assets/report-template.md' for the required output structure.

Step 3: Ask the user for any missing information needed to fill the template:
- Topic or subject
- Key findings or data points
- Target audience (technical, executive, general)

Step 4: Fill the template following the style guide rules. Every section in the template must be present in the output.

Step 5: Return the completed report as a single Markdown document.
```

---

## 3. Reviewer（審閱者模式）

* 將「要檢查什麼」與「如何檢查」徹底分開。透過讀取外部的模組化評分表（如 `references/review-checklist.md`），Agent 會系統性地掃描產出物，並將發現的問題依據嚴重程度進行分類。如果今天要把「風格審查」改成「資安審查」，只要替換那份 checklist 檔案即可，基礎架構完全不用動。
* 在 Code Review 流程中，配置包含記憶體洩漏檢查、命名規範與漏洞防禦的清單。Agent 會逐項掃描原始碼，並產出分級的修改建議與品質報告。

**`SKILL.md` 原始碼範例（Python 程式碼審查）：**
```markdown
# skills/code-reviewer/SKILL.md
---
name: code-reviewer
description: Reviews Python code for quality, style, and common bugs. Use when the user submits code for review, asks for feedback on their code, or wants a code audit.
metadata:
  pattern: reviewer
  severity-levels: error,warning,info
---

You are a Python code reviewer. Follow this review protocol exactly:

Step 1: Load 'references/review-checklist.md' for the complete review criteria.

Step 2: Read the user's code carefully. Understand its purpose before critiquing.

Step 3: Apply each rule from the checklist to the code. For every violation found:
- Note the line number (or approximate location)
- Classify severity: error (must fix), warning (should fix), info (consider)
- Explain WHY it's a problem, not just WHAT is wrong
- Suggest a specific fix with corrected code

Step 4: Produce a structured review with these sections:
- **Summary**: What the code does, overall quality assessment
- **Findings**: Grouped by severity (errors first, then warnings, then info)
- **Score**: Rate 1-10 with brief justification
- **Top 3 Recommendations**: The most impactful improvements
```

---

## 4. Inversion（角色反轉模式）

* 打破 Agent 總是「急著猜測並給出答案」的習慣。此模式賦予 Agent「面試官/採訪者」的身分，透過設定不可妥協的閘門指令（例如「在所有階段完成前，絕對不要開始建置」），強制 Agent 循序漸進地提問。直到收集完所有需求和限制條件後，才會開始產出最終規劃。
* 當你需要撰寫一份新的系統架構規劃時，Agent 會先主動反問目標建置環境、技術堆疊限制與非功能性需求，待所有前置條件確認完畢後才進行生成。

**`SKILL.md` 原始碼範例（專案規劃採訪者）：**
```markdown
# skills/project-planner/SKILL.md
---
name: project-planner
description: Plans a new software project by gathering requirements through structured questions before producing a plan. Use when the user says "I want to build", "help me plan", "design a system", or "start a new project".
metadata:
  pattern: inversion
  interaction: multi-turn
---

You are conducting a structured requirements interview. DO NOT start building or designing until all phases are complete.

## Phase 1 — Problem Discovery (ask one question at a time, wait for each answer)

Ask these questions in order. Do not skip any.

- Q1: "What problem does this project solve for its users?"
- Q2: "Who are the primary users? What is their technical level?"
- Q3: "What is the expected scale? (users per day, data volume, request rate)"

## Phase 2 — Technical Constraints (only after Phase 1 is fully answered)

- Q4: "What deployment environment will you use?"
- Q5: "Do you have any technology stack requirements or preferences?"
- Q6: "What are the non-negotiable requirements? (latency, uptime, compliance, budget)"

## Phase 3 — Synthesis (only after all questions are answered)

1. Load 'assets/plan-template.md' for the output format
2. Fill in every section of the template using the gathered requirements
3. Present the completed plan to the user
4. Ask: "Does this plan accurately capture your requirements? What would you change?"
5. Iterate on feedback until the user confirms
```

---

## 5. Pipeline（流程管線模式）

* 專為不能跳過步驟或忽視指令的複雜任務而生。在指令中直接定義工作流程，並設置明確的「檢查點」（例如要求使用者確認後才能進入下一階段）。這能有效防止 Agent 偷懶繞過繁瑣的步驟，直接給你一個未經核實的半成品。
* 設計自動化文件生成的 Pipeline。步驟一萃取程式碼結構；步驟二生成 Docstrings 並暫停等待人類開發者確認；確認無誤後，步驟三才組裝成最終的 API 文件。

**`SKILL.md` 原始碼範例（API 文件生成管線）：**
```markdown
# skills/doc-pipeline/SKILL.md
---
name: doc-pipeline
description: Generates API documentation from Python source code through a multi-step pipeline. Use when the user asks to document a module, generate API docs, or create documentation from code.
metadata:
  pattern: pipeline
  steps: "4"
---

You are running a documentation generation pipeline. Execute each step in order. Do NOT skip steps or proceed if a step fails.

## Step 1 — Parse & Inventory
Analyze the user's Python code to extract all public classes, functions, and constants. Present the inventory as a checklist. Ask: "Is this the complete public API you want documented?"

## Step 2 — Generate Docstrings
For each function lacking a docstring:
- Load 'references/docstring-style.md' for the required format
- Generate a docstring following the style guide exactly
- Present each generated docstring for user approval
Do NOT proceed to Step 3 until the user confirms.

## Step 3 — Assemble Documentation
Load 'assets/api-doc-template.md' for the output structure. Compile all classes, functions, and docstrings into a single API reference document.

## Step 4 — Quality Check
Review against 'references/quality-checklist.md':
- Every public symbol documented
- Every parameter has a type and description
- At least one usage example per function
Report results. Fix issues before presenting the final document.
```

## 💡 結語：設計模式的組合應用
這 5 種模式並非互斥，而是可以**互相組合**的。例如，你可以用 Generator 搭配最初的 Inversion 提問，或者在 Pipeline 的最後一步加上 Reviewer 模式來進行自我品質檢查。善用這些模式，能幫助你跳脫傳統提示詞的限制，建構出更穩定、專業的 Agent 應用。

## 參考資料
- [5 Agent Skill design patterns every ADK developer should know](https://x.com/GoogleCloudTech/article/2033953579824758855)

![AI 代理技能設計三原則](/AI/01-04.png)