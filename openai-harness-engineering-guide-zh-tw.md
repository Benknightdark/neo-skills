# OpenAI Harness Engineering 設計指南

> 整理日期：2026-08-26  
> 語言：繁體中文（台灣）  
> 定位：依 OpenAI 官方 Harness Engineering、Codex ExecPlan、Codex App Server、Agents SDK 公開資料整理的工程實作指南。  
> 注意：本文同時包含「OpenAI 官方明確提出的做法」與「依其原則整理出的可落地工程模板」。後者會標示為實務建議，不代表 OpenAI 規定必須採用相同檔名或工具。

---

## 目錄

1. [Harness 是什麼](#1-harness-是什麼)
2. [核心思想：Humans steer, agents execute](#2-核心思想humans-steer-agents-execute)
3. [Harness 的五個設計目標](#3-harness-的五個設計目標)
4. [Repository 是 Agent 的系統紀錄](#4-repository-是-agent-的系統紀錄)
5. [AGENTS.md：給地圖，不要給百科全書](#5-agentsmd給地圖不要給百科全書)
6. [Progressive Disclosure：逐層揭露 Context](#6-progressive-disclosure逐層揭露-context)
7. [ExecPlan / PLANS.md：長任務的持久化計畫](#7-execplan--plansmd長任務的持久化計畫)
8. [Agent Legibility：讓系統本身可被 Agent 觀察](#8-agent-legibility讓系統本身可被-agent-觀察)
9. [架構約束：Enforce invariants, not implementations](#9-架構約束enforce-invariants-not-implementations)
10. [Feedback Loop：Agent 必須能自己驗證與修正](#10-feedback-loopagent-必須能自己驗證與修正)
11. [Review Loop 與 Agent-to-Agent Review](#11-review-loop-與-agent-to-agent-review)
12. [Observability：Logs / Metrics / Traces 也要可讀](#12-observabilitylogs--metrics--traces-也要可讀)
13. [Sandbox 與 Harness / Compute 分離](#13-sandbox-與-harness--compute-分離)
14. [Codex Harness 與 App Server](#14-codex-harness-與-app-server)
15. [Entropy 與 Garbage Collection](#15-entropy-與-garbage-collection)
16. [推薦 Repo 結構](#16-推薦-repo-結構)
17. [一份實用的 AGENTS.md 模板](#17-一份實用的-agentsmd-模板)
18. [一份實用的 ARCHITECTURE.md 模板](#18-一份實用的-architecturemd-模板)
19. [一份實用的 PLANS.md 規範](#19-一份實用的-plansmd-規範)
20. [ExecPlan 範本](#20-execplan-範本)
21. [統一驗證入口 verify](#21-統一驗證入口-verify)
22. [CI / Architecture Check 建議](#22-ci--architecture-check-建議)
23. [Harness Failure 的診斷方式](#23-harness-failure-的診斷方式)
24. [成熟度模型](#24-成熟度模型)
25. [最小可行 Harness](#25-最小可行-harness)
26. [完整落地 Checklist](#26-完整落地-checklist)
27. [常見反模式](#27-常見反模式)
28. [一句話總結](#28-一句話總結)
29. [官方來源](#29-官方來源)

---

# 1. Harness 是什麼

在 Agentic Software Engineering 裡，**Harness** 可以理解成：

> 包住模型的工程執行環境與控制系統，讓模型不只是產生文字，而是能可靠地理解任務、取得 Context、操作工具、修改系統、驗證結果、處理失敗並持續執行。

因此 Harness 不等於 System Prompt。

一個完整 Harness 通常涵蓋：

```text
Instructions
    +
Repository knowledge
    +
Tools
    +
Filesystem
    +
Shell
    +
Tests
    +
Architecture constraints
    +
Browser / UI
    +
Logs / Metrics / Traces
    +
Sandbox
    +
Review
    +
State / Plans
    +
Feedback loops
```

可簡化為：

```text
                    Human Intent
                         │
                         ▼
                    Instructions
                         │
             ┌───────────┴───────────┐
             ▼                       ▼
       Repository Context           Tools
             │                       │
             └───────────┬───────────┘
                         ▼
                       Agent
                         │
            ┌────────────┼────────────┐
            ▼            ▼            ▼
          Code         Runtime      Browser
            │            │            │
            └───────┬────┴─────┬──────┘
                    ▼          ▼
                  Tests    Observability
                    │          │
                    └────┬─────┘
                         ▼
                     Validation
                         │
                failure ─┴─ success
                   │          │
                   ▼          ▼
                 Fix         PR
```

---

# 2. 核心思想：Humans steer, agents execute

OpenAI Harness Engineering 文章用非常直接的一句話描述角色分工：

> Humans steer. Agents execute.

實際工程含義是：

### 人類主要負責

- 決定產品與工程意圖
- 定義 acceptance criteria
- 建立 architecture boundary
- 提供 agent 所需 capability
- 設計 feedback loop
- 建立可執行的規則
- 決定風險與 approval boundary
- 調整 Harness 本身

### Agent 主要負責

- 搜尋 repository
- 閱讀文件
- 理解 architecture
- 建立 plan
- 修改程式碼
- 寫測試
- 執行測試
- 啟動 application
- 重現 bug
- 讀 log / trace / metric
- self-review
- 回應 review feedback
- 修正失敗
- 建立 PR

這表示工程師的 leverage 從：

```text
我自己寫多少 code
```

逐漸轉變成：

```text
我設計的環境可以讓多少 agent work 被可靠完成
```

---

# 3. Harness 的五個設計目標

依 OpenAI 公開的工程做法，可以整理成五個核心目標。

## 3.1 Legibility

Agent 必須看得懂：

- repository
- architecture
- product domain
- application runtime
- UI
- logs
- metrics
- traces
- test failures
- CI failures

如果 agent 看不到，就很難可靠操作。

---

## 3.2 Enforceability

重要規則不要只存在自然語言。

例如：

```text
不要讓 domain import UI
```

比起只有文件，更好的做法是：

```text
architecture test
dependency lint
module boundary check
```

---

## 3.3 Verifiability

Agent 必須能回答：

```text
我怎麼知道這個 task 完成了？
```

最好有一個機械式答案：

```bash
npm run verify
```

或：

```bash
make verify
```

且 exit code 為 0 才算完成。

---

## 3.4 Recoverability

長任務可能遇到：

- context compaction
- process restart
- container loss
- tool failure
- agent handoff

所以重要 state 不應只存在模型暫時 context。

應外部化到：

- repository
- ExecPlan
- checkpoints
- persisted threads
- artifacts

---

## 3.5 Scalability

Harness 應允許：

- 多個 agent 同時工作
- 每個 task 有隔離 workspace
- agent-to-agent review
- parallel sandbox
- 自動 cleanup
- CI 驗證

---

# 4. Repository 是 Agent 的系統紀錄

OpenAI Harness Engineering 的核心經驗之一，是把 repository knowledge 做成 system of record。

對 Agent 而言：

```text
無法取得的資訊 ≈ 不存在
```

如果重要知識只在：

```text
Slack
Notion
Google Docs
meeting
某位工程師腦中
私人聊天
```

Agent 在 execution time 無法取得時，就無法利用它。

因此重要資訊應盡可能變成：

```text
repo-local
version-controlled
searchable
structured
machine-verifiable
```

例如：

```text
ARCHITECTURE.md
design docs
ADRs
schemas
product specs
ExecPlans
quality score
reliability rules
security rules
scripts
tests
```

這個做法也對人類工程師有利，因為新進工程師同樣可以透過 repository 理解系統。

---

# 5. AGENTS.md：給地圖，不要給百科全書

OpenAI 表示，他們曾嘗試使用大型 `AGENTS.md`，結果出現幾個問題：

- Context 被大量 instruction 佔用。
- 所有東西都標成重要，反而沒有優先級。
- 文件很容易 stale。
- 巨型自然語言文件難以做機械驗證。

因此較好的策略是：

```text
AGENTS.md = table of contents / map
```

而不是：

```text
AGENTS.md = entire engineering handbook
```

OpenAI 的 Harness Engineering 案例中，`AGENTS.md` 大約維持在百行級別，主要把 agent 導向更深入的 repo-local 文件。

推薦概念：

```text
AGENTS.md
    │
    ├── Architecture → ARCHITECTURE.md
    │
    ├── Design → docs/design-docs/
    │
    ├── Product → docs/product-specs/
    │
    ├── Plans → docs/exec-plans/
    │
    ├── Reliability → docs/RELIABILITY.md
    │
    └── Security → docs/SECURITY.md
```

---

# 6. Progressive Disclosure：逐層揭露 Context

與其一次把全部 Context 丟給 Agent，應採用 progressive disclosure：

```text
Layer 1
AGENTS.md
    ↓
Layer 2
Architecture / Index
    ↓
Layer 3
Relevant design doc
    ↓
Layer 4
Relevant module / code
    ↓
Layer 5
Runtime evidence
```

好處：

1. 降低 token 浪費。
2. 讓 Agent 先理解高階結構。
3. 避免無關 instruction 干擾當前 task。
4. 文件比較容易維護。
5. 可按 domain 分割 ownership。

Harness 的目標不是：

```text
把所有資訊都塞入 Context
```

而是：

```text
確保 Agent 可以可靠地找到正確資訊
```

---

# 7. ExecPlan / PLANS.md：長任務的持久化計畫

OpenAI Cookbook 曾公開 `PLANS.md` / ExecPlan 方法，用於多小時的複雜任務。

> 注意：截至本文整理日期，這篇 Cookbook 頁面被標記為 archived，因此應把它視為 OpenAI 公開過的工作模式，而不是最新 SDK API 規格。

核心思想：

```text
長任務不要只依賴 conversation state
```

而是把計畫放進 repository。

例如：

```text
docs/
└── exec-plans/
    ├── active/
    │   ├── add-authentication.md
    │   └── migrate-storage.md
    │
    └── completed/
        └── add-search.md
```

OpenAI 對 ExecPlan 的重要要求之一是：

> Plan 應該是 self-contained。

也就是一個新 agent：

```text
沒有前一次 conversation
沒有歷史 memory
只有 current working tree
+ ExecPlan
```

仍然可以繼續工作。

---

## ExecPlan 不只是 TODO list

普通 TODO：

```md
- add endpoint
- update UI
- test
```

資訊通常不夠。

ExecPlan 應包含：

```text
Goal
Context
Current behavior
Architecture
Files / modules
Implementation approach
Progress
Discoveries
Decisions
Validation
Recovery
Outcome
```

而且它是 living document。

Agent 在 execution 過程中應同步更新：

```text
Progress
Surprises & Discoveries
Decision Log
Outcome
```

---

# 8. Agent Legibility：讓系統本身可被 Agent 觀察

OpenAI 發現，當 code generation throughput 增加後，瓶頸會轉移到 QA。

因此 Harness 不應只讓 agent：

```text
read code
write code
run unit tests
```

還應讓 agent 觀察 application 本身。

OpenAI Harness Engineering 案例包括：

```text
每個 git worktree
    ↓
可以獨立 boot application

Agent
    ↓
Chrome DevTools Protocol
    ↓
DOM
navigation
screenshots
```

因此 agent 可以：

```text
reproduce bug
→ inspect DOM
→ modify code
→ restart app
→ exercise UI
→ verify fix
```

這種能力就是 application legibility / agent legibility。

---

# 9. 架構約束：Enforce invariants, not implementations

OpenAI 的一個重要設計原則可整理成：

> 強制不變量，而不是微管理實作。

例如你可以規定：

```text
所有 external payload 必須在 boundary validation
```

但不一定要強迫：

```text
一定必須使用某個特定 validation library
```

同樣地：

```text
Domain 不可以 dependency on UI
```

應該被 enforce。

但：

```text
這個 helper 必須寫成 class 還是 function
```

可能不需要限制。

---

## 文件規則 vs executable rule

弱 Harness：

```md
Please don't import UI from domain.
```

較強 Harness：

```text
dependency-cruiser
eslint boundary rule
Nx constraints
ArchUnit
custom static checker
```

如果 agent 違反：

```text
src/domain/order.ts
  ↓
imports src/ui/OrderDialog.tsx
```

驗證應直接失敗：

```text
Architecture violation:
domain must not depend on ui.

Allowed direction:
ui -> application -> domain
```

最好 error 本身就包含修復方向。

---

# 10. Feedback Loop：Agent 必須能自己驗證與修正

理想 Harness 不應是：

```text
Agent writes code
       ↓
Human runs tests
       ↓
Human pastes error
       ↓
Agent fixes
```

而應該是：

```text
Agent
  ↓
implement
  ↓
test
  ↓
failure?
  ├── yes → inspect → fix → test again
  └── no
       ↓
typecheck
       ↓
lint
       ↓
build
       ↓
runtime validation
       ↓
review
```

也就是：

```text
Observe
  ↓
Act
  ↓
Validate
  ↓
Correct
  └────────→ repeat
```

Harness 品質很大程度取決於 feedback loop 的閉環程度。

---

# 11. Review Loop 與 Agent-to-Agent Review

OpenAI Harness Engineering 案例中，人類會要求 Codex：

1. local self-review
2. additional agent reviews
3. 處理 agent / human feedback
4. 修正
5. 再 review
6. 重複直到 reviewer 滿意

這代表 review 本身也可以納入 Harness。

概念：

```text
Implementation Agent
        ↓
Self Review
        ↓
Review Agent A
        ↓
Review Agent B
        ↓
Feedback
        ↓
Implementation Agent
        ↓
Fix
        ↓
Tests
        ↓
Review again
```

Review task 可以拆不同視角：

```text
correctness
security
architecture
performance
UX
maintainability
```

---

# 12. Observability：Logs / Metrics / Traces 也要可讀

OpenAI Harness Engineering 特別把 observability 暴露給 Codex。

包含：

```text
logs
metrics
traces
```

且每個 worktree 可以有自己的 ephemeral observability environment。

文中提到：

```text
LogQL → logs
PromQL → metrics
```

因此 agent 能處理：

```text
service startup < 800 ms
```

這種單靠 unit test 不容易判斷的 requirement。

完整的 runtime Harness 可以長這樣：

```text
Agent
 │
 ├── source code
 ├── unit tests
 ├── browser
 ├── DOM
 ├── console
 ├── HTTP traffic
 ├── logs
 ├── metrics
 └── traces
```

---

# 13. Sandbox 與 Harness / Compute 分離

OpenAI 在 2026 年更新的 Agents SDK 設計中，強調：

```text
Harness
   ≠
Compute sandbox
```

可以拆成：

```text
Control Plane / Harness
├── model loop
├── state
├── tools policy
├── credentials
├── approvals
└── orchestration

           │
           ▼

Sandbox / Compute
├── filesystem
├── packages
├── shell
├── generated code
└── task workspace
```

安全好處：

```text
credential
    │
    └── stays in harness/control plane

model-generated code
    │
    └── runs inside isolated compute
```

OpenAI 建議 agentic system 應假設會遇到：

```text
prompt injection
data exfiltration attempt
```

因此不應把高權限 credential 直接放入執行 model-generated code 的 sandbox。

---

## Durable execution

Harness / Compute 分離也讓 state 可以外部化。

如果 sandbox container 消失：

```text
sandbox lost
   ↓
new sandbox
   ↓
restore snapshot
   ↓
rehydrate state
   ↓
continue task
```

這對長時間 agent workflow 很重要。

---

# 14. Codex Harness 與 App Server

OpenAI Codex 的 CLI、IDE、Web 等不同 surface 底層使用相同的 Codex harness。

若要把 Codex agent loop 嵌入自己的產品，OpenAI 公開的 App Server 會提供 client-friendly 的 bidirectional JSON-RPC interface。

Codex Harness 內部概念包括：

```text
core agent loop
thread lifecycle
persistence
config
auth
tool execution
sandbox
MCP
skills
```

App Server 把這些能力包成可供 client 使用的 long-lived process。

---

## Conversation primitives

OpenAI App Server 定義三個主要 primitive。

### Item

最小 I/O unit，例如：

```text
user message
agent message
tool execution
approval request
diff
```

Item lifecycle：

```text
started
  ↓
delta...
  ↓
completed
```

---

### Turn

一個 user input 觸發的一次 agent 工作單位。

例如：

```text
User:
run tests and fix failures
```

這整個執行就是一個 Turn。

Turn 裡會包含多個 Item。

---

### Thread

一段持久化 agent conversation / workflow。

概念：

```text
Thread
 ├── Turn
 │    ├── Item
 │    ├── Item
 │    └── Item
 │
 └── Turn
      ├── Item
      └── Item
```

---

## 為什麼不是單純 HTTP request / response？

因為 agent task 往往是：

```text
request
  ↓
inspect files
  ↓
tool call
  ↓
streaming output
  ↓
approval
  ↓
tool call
  ↓
diff
  ↓
final result
```

因此需要雙向、事件式 protocol。

---

# 15. Entropy 與 Garbage Collection

Agent 會學習 repository 已有 pattern。

問題是：

```text
Bad pattern
    ↓
Agent sees it
    ↓
Agent copies it
    ↓
More bad patterns
    ↓
Future agents copy more
```

所以 agent-generated repository 會產生 entropy / drift。

OpenAI 一開始曾靠人類固定時間清理，之後改成建立：

```text
golden principles
+
recurring cleanup
```

Golden principles 是具有明確偏好的機械式規則。

例如 OpenAI 文中提到的方向包含：

```text
優先 shared utility
而不是每個地方自行重寫 helper
```

以及：

```text
不要猜 external data shape
應使用 boundary validation 或 typed SDK
```

---

## Garbage Collection 的核心

不是：

```text
一年一次大型重構
```

而是：

```text
daily / recurring small cleanup
```

例如定期掃：

```text
duplicate helpers
architecture drift
stale docs
oversized modules
dead code
unvalidated boundaries
quality regression
```

再產生小 PR 修正。

---

# 16. 推薦 Repo 結構

以下是依 OpenAI Harness Engineering 原則整理的一個實務模板。

```text
repo/
├── AGENTS.md
├── ARCHITECTURE.md
├── PLANS.md
│
├── docs/
│   ├── design-docs/
│   │   ├── index.md
│   │   ├── core-beliefs.md
│   │   └── ...
│   │
│   ├── product-specs/
│   │   └── ...
│   │
│   ├── exec-plans/
│   │   ├── active/
│   │   └── completed/
│   │
│   ├── references/
│   │   └── ...
│   │
│   ├── generated/
│   │   └── ...
│   │
│   ├── RELIABILITY.md
│   ├── SECURITY.md
│   └── QUALITY.md
│
├── scripts/
│   ├── check-architecture.*
│   ├── verify.*
│   └── cleanup.*
│
├── src/
├── tests/
│
└── .github/
    └── workflows/
        └── verify.yml
```

---

# 17. 一份實用的 AGENTS.md 模板

```md
# AGENTS.md

This repository is <short description>.

Keep this file short.
Use it as a map to repository knowledge rather than a complete handbook.

## Start here

Before making changes:

1. Read `ARCHITECTURE.md`.
2. Read the relevant module documentation.
3. Inspect existing code before designing a new abstraction.
4. For complex features or significant refactors, create or update an ExecPlan.

## Repository knowledge

Architecture:

    ARCHITECTURE.md

Design documents:

    docs/design-docs/

Product specifications:

    docs/product-specs/

Execution plans:

    docs/exec-plans/

Reliability:

    docs/RELIABILITY.md

Security:

    docs/SECURITY.md

## Commands

Install:

    <install command>

Development:

    <dev command>

Tests:

    <test command>

Full verification:

    <verify command>

## Architecture

Key dependency direction:

    UI → Application → Domain → Infrastructure boundary

Detailed rules:

    ARCHITECTURE.md

## Implementation principles

Prefer:

- small modules
- explicit boundaries
- typed interfaces
- existing shared utilities
- tests close to behavior
- deterministic tooling

Avoid:

- guessing external data shapes
- unrelated refactors
- hidden side effects
- duplicated infrastructure
- bypassing architecture boundaries

## Completion criteria

Work is complete only when:

1. requested behavior is implemented
2. relevant tests exist
3. full verification succeeds
4. architecture constraints pass
5. documentation / ExecPlan is updated when applicable
```

這份檔案應維持短小。

---

# 18. 一份實用的 ARCHITECTURE.md 模板

```md
# Architecture

## System overview

Describe the system in a few paragraphs.

## Layers

    UI
     ↓
    Application
     ↓
    Domain
     ↓
    Infrastructure

## UI

Responsibilities:

- rendering
- user interaction
- presentation state

Allowed dependencies:

- application

Forbidden dependencies:

- infrastructure internals

## Application

Responsibilities:

- use cases
- orchestration
- transaction boundaries

Allowed dependencies:

- domain
- interfaces

## Domain

Responsibilities:

- business rules
- entities
- value objects
- domain invariants

Forbidden:

- framework imports
- database clients
- HTTP clients
- UI imports

## Infrastructure

Responsibilities:

- database adapters
- HTTP adapters
- external SDK integrations

## Mechanical enforcement

Architecture rules are checked by:

    <command>

Example:

    npm run check:architecture
```

---

# 19. 一份實用的 PLANS.md 規範

以下為依 OpenAI ExecPlan 思路整理的簡化版本。

```md
# Execution Plans

Use an ExecPlan for:

- complex features
- significant refactors
- migrations
- multi-module changes
- unfamiliar systems
- work likely to span multiple sessions

Plans live in:

    docs/exec-plans/active/

Completed plans move to:

    docs/exec-plans/completed/

Every plan must be self-contained.

Assume the reader has:

- the current repository
- this plan

Assume the reader does not have:

- previous conversation history
- prior agent memory
- external context

The plan must be updated during implementation.

Required sections:

- Purpose / Big Picture
- Context
- Current Behavior
- Architecture / Constraints
- Plan of Work
- Progress
- Surprises & Discoveries
- Decision Log
- Concrete Steps
- Validation
- Recovery / Idempotence
- Outcome
```

---

# 20. ExecPlan 範本

```md
# <Feature / Change Name>

## Purpose / Big Picture

Describe what becomes possible after this work is complete.

## Context

Explain the relevant system and terminology.

List important files and modules.

## Current Behavior

Describe what happens today.

## Desired Behavior

Describe observable behavior after completion.

## Architecture / Constraints

List relevant architecture rules.

Example:

    UI → Application → Domain

The domain layer must not import framework code.

## Plan of Work

Describe the implementation sequence.

### Milestone 1

...

### Milestone 2

...

## Progress

- [ ] inspect existing implementation
- [ ] implement domain behavior
- [ ] implement application integration
- [ ] update UI
- [ ] add tests
- [ ] run full verification

## Surprises & Discoveries

Record facts discovered during implementation.

## Decision Log

### Decision: <title>

Reason:

...

Alternatives considered:

...

## Concrete Steps

Commands:

    <command>

Files:

    path/to/file

Expected result:

    ...

## Validation

Automated:

    <verify command>

Manual smoke test:

1. ...
2. ...
3. ...

Acceptance criteria:

- ...
- ...

## Idempotence and Recovery

Explain:

- what can safely be rerun
- how partial state is recovered
- how migrations are rolled back
- how failed operations are retried

## Outcome

Completed work:

...

Remaining work:

...

Validation result:

...
```

---

# 21. 統一驗證入口 verify

一個成熟 Harness 最值得優先建立的東西之一：

```text
one canonical verification command
```

例如 Node / TypeScript：

```json
{
  "scripts": {
    "verify": "npm run format:check && npm run lint && npm run typecheck && npm run check:architecture && npm run test && npm run build"
  }
}
```

Agent completion rule：

```text
npm run verify
exit 0
```

才算完成。

---

## 理想 verify pipeline

```text
format
  ↓
lint
  ↓
typecheck
  ↓
architecture
  ↓
unit tests
  ↓
integration tests
  ↓
component tests
  ↓
e2e
  ↓
production build
```

不一定每個 repo 都需要全部，但應提供單一 canonical entry point。

---

# 22. CI / Architecture Check 建議

例如 GitHub Actions：

```yaml
name: Verify

on:
  pull_request:
  push:

jobs:
  verify:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm

      - run: npm ci
      - run: npm run verify
```

---

## 可機械化的 Harness Rule

適合變成 lint / test 的規則：

```text
dependency direction
forbidden imports
schema validation
API boundary
file size
naming
generated files
database migration checks
security-sensitive APIs
logging requirements
test coverage
public API compatibility
```

原則：

```text
如果一條規則可以被機器確定判斷，
優先把它變成 executable check。
```

不要只放在 prompt。

---

# 23. Harness Failure 的診斷方式

Agent 失敗時，不要第一反應就是：

```text
再 prompt 一次
```

或：

```text
把 prompt 寫更兇
```

OpenAI Harness Engineering 的思考方式是：

```text
What capability is missing?
```

建議檢查：

### Context

Agent 是否找不到：

```text
architecture
product constraint
design decision
domain terminology
```

解法：

```text
repo-local docs
index
better AGENTS.md navigation
```

---

### Tool

Agent 是否缺：

```text
browser
database inspection
shell
GitHub CLI
trace viewer
```

解法：

```text
add tool / skill
```

---

### Feedback

Agent 是否：

```text
可以修改
但不能知道結果對不對
```

解法：

```text
tests
runtime checks
browser validation
metrics
```

---

### Enforceability

Agent 是否一直違反同一規則？

解法通常不是：

```text
AGENTS.md 再寫一次
```

而是：

```text
lint
architecture test
schema
CI
```

---

### Observability

Agent 是否無法 reproduce production / runtime 問題？

加入：

```text
logs
metrics
traces
DOM
network
screenshots
```

---

### State

Agent 是否長任務做到一半就失去方向？

加入：

```text
ExecPlan
checkpoint
persistent thread
externalized task state
```

---

# 24. 成熟度模型

可以把 Harness 成熟度粗略分成五級。

## Level 0 — Prompt-only

```text
Prompt
  ↓
Agent
  ↓
Code
```

特徵：

- 大量人工 copy/paste
- 人工跑測試
- 規則只在 prompt
- Agent 不知道 architecture

---

## Level 1 — Repo-aware

加入：

```text
AGENTS.md
ARCHITECTURE.md
tests
```

Agent 可以自行理解基本 repository。

---

## Level 2 — Self-verifying

加入：

```text
canonical verify command
lint
typecheck
architecture checks
CI
```

Agent 可以自行：

```text
implement
→ verify
→ fix
```

---

## Level 3 — Runtime-aware

加入：

```text
browser
app startup
logs
metrics
traces
```

Agent 可以：

```text
reproduce
→ modify
→ run
→ observe
→ validate
```

---

## Level 4 — Autonomous Engineering Loop

加入：

```text
ExecPlans
parallel workspaces
agent review
PR automation
recurring garbage collection
sandbox
persistent state
```

此時：

```text
Human
  ↓
intent / acceptance criteria

Agents
  ↓
plan
implement
test
review
fix
PR
cleanup
```

---

# 25. 最小可行 Harness

如果不想一次做到很大，可以先完成下面 6 件事。

```text
1. AGENTS.md
2. ARCHITECTURE.md
3. docs/
4. PLANS.md + exec-plans/
5. canonical verify command
6. agent 能自行執行 application / tests
```

第二階段：

```text
7. architecture lint
8. browser automation
9. structured logs
10. metrics / traces
11. review agent
12. recurring cleanup
```

第三階段：

```text
13. isolated worktree / sandbox
14. persistent state
15. parallel agents
16. PR automation
17. security approval boundaries
```

---

# 26. 完整落地 Checklist

## Repository knowledge

- [ ] `AGENTS.md` 存在且保持短小
- [ ] `ARCHITECTURE.md` 描述 dependency direction
- [ ] design docs 有 index
- [ ] product specs 在 repo 中可搜尋
- [ ] 關鍵 architecture decision 不只存在 Slack / meeting
- [ ] stale docs 有清理機制

## Planning

- [ ] 定義哪些任務需要 ExecPlan
- [ ] 有 `PLANS.md`
- [ ] active / completed plan 分離
- [ ] ExecPlan self-contained
- [ ] ExecPlan 有 progress
- [ ] ExecPlan 有 decision log
- [ ] ExecPlan 有 validation
- [ ] ExecPlan 有 recovery 說明

## Verification

- [ ] 有 canonical verify command
- [ ] format 可以自動檢查
- [ ] lint 可以自動檢查
- [ ] typecheck 可以自動檢查
- [ ] architecture 可以自動檢查
- [ ] unit test 可以自動執行
- [ ] production build 可以自動執行
- [ ] CI 使用同一套 verify

## Architecture

- [ ] layer boundary 明確
- [ ] dependency direction 明確
- [ ] forbidden import 可機械檢查
- [ ] external payload 有 boundary validation
- [ ] shared utilities 有清楚 ownership

## Runtime

- [ ] Agent 能啟動 app
- [ ] task 有獨立 workspace
- [ ] Agent 能執行 smoke test
- [ ] Agent 能讀 console
- [ ] Agent 能 inspect HTTP failure

## UI

- [ ] Agent 可以操作 browser
- [ ] Agent 可以 inspect DOM
- [ ] Agent 可以產生 screenshot
- [ ] Agent 可以重現 UI bug
- [ ] Agent 可以驗證 UI fix

## Observability

- [ ] structured logs
- [ ] logs 可被 agent query
- [ ] metrics 可被 agent query
- [ ] traces 可被 agent query
- [ ] 每個 task 的 telemetry 可以隔離

## Review

- [ ] Agent 做 self-review
- [ ] 可以呼叫 independent reviewer
- [ ] reviewer feedback 可以回到 implementation loop
- [ ] architecture / security review 可獨立執行

## Security

- [ ] model-generated code 執行在 sandbox
- [ ] secrets 不直接暴露給 sandbox
- [ ] dangerous tool 有 approval boundary
- [ ] network access 有 policy
- [ ] production write 有明確控制
- [ ] prompt injection 被視為預期威脅

## Maintenance

- [ ] golden principles 被寫進 repo
- [ ] 常見 drift 有機械檢查
- [ ] tech debt 採小批次持續清理
- [ ] duplicate pattern 有 cleanup process
- [ ] generated artifacts 有 ownership

---

# 27. 常見反模式

## 27.1 巨型 AGENTS.md

```text
1000+ lines instructions
```

問題：

```text
context pollution
stale rules
priority collapse
```

改成：

```text
short map
+
linked source-of-truth docs
```

---

## 27.2 每次失敗都加 prompt

例如：

```text
Agent 又 import 錯 layer
    ↓
在 prompt 加：
"DO NOT IMPORT UI"
```

更好的做法：

```text
architecture check
```

---

## 27.3 Human-as-tool-router

```text
Agent:
please run npm test

Human:
runs it

Human:
pastes failure

Agent:
fixes
```

應盡可能改成：

```text
Agent runs npm test itself
```

---

## 27.4 只有 unit test，沒有 runtime legibility

某些問題：

```text
layout
network
startup performance
race condition
runtime config
```

需要：

```text
browser
logs
metrics
traces
```

---

## 27.5 Long task 只靠 conversation memory

當：

```text
context compacted
session lost
handoff
```

進度容易遺失。

改成：

```text
ExecPlan
repository artifacts
persistent task state
```

---

## 27.6 把 secret 放進 agent compute environment

高風險。

應考慮：

```text
Harness / Control Plane
        ↓ controlled operation
Sandbox
```

而不是讓任意 model-generated code 直接取得高權限 credential。

---

## 27.7 Agent 產生更多爛 pattern，卻沒有 cleanup

Agent throughput 高時：

```text
small drift × high throughput = fast entropy
```

因此需要：

```text
golden principles
+
continuous garbage collection
```

---

# 28. 一句話總結

OpenAI Harness Engineering 的重點不是：

```text
「怎麼寫出完美 Prompt？」
```

而是：

```text
「怎麼設計一個環境，
讓 Agent 能找到正確資訊、
做出改動、
觀察結果、
驗證自己、
修正錯誤，
而且同類錯誤未來可以被系統性防止？」
```

可以濃縮成：

```text
少把知識塞進 Prompt，
多把知識放進 Repository。

少要求 Agent 記住規則，
多把規則變成 Executable Constraints。

少讓 Human 搬運 Context，
多讓 Agent 自己取得 Evidence。

少用「看起來完成」，
多使用 Mechanical Verification。

少依賴一次性的 Prompt 修正，
多改善 Harness 本身。

少讓 Tech Debt 大爆炸，
多做 Continuous Garbage Collection。
```

最終的理想 loop：

```text
Human Intent
    ↓
Repository Knowledge
    ↓
Agent Plan
    ↓
Implementation
    ↓
Tests
    ↓
Runtime Observation
    ↓
Review
    ↓
Validation
    ↓
Fix
    └───────┐
            │
            ▼
          repeat
            │
            ▼
            PR
            │
            ▼
        CI / Merge
            │
            ▼
 Continuous Cleanup
```

Harness 的核心不是讓 Agent「更聽話」。

而是讓：

```text
正確的行為容易做到，
錯誤的行為容易被發現，
重要的規則可以被機器強制，
失敗能形成新的系統能力。
```

---

# 29. 官方來源

以下是本文主要依據的 OpenAI 官方公開資料。

## 1. Harness engineering: leveraging Codex in an agent-first world

OpenAI Engineering, 2026-02-11

https://openai.com/index/harness-engineering/

主要涵蓋：

- Humans steer, agents execute
- repository knowledge as system of record
- short AGENTS.md / progressive disclosure
- agent legibility
- per-worktree application environments
- browser / DOM / screenshot capability
- logs / metrics / traces
- architecture enforcement
- agent-to-agent review
- autonomy
- entropy
- golden principles
- recurring garbage collection

繁體中文官方頁：

https://openai.com/zh-Hant/index/harness-engineering/

---

## 2. Using PLANS.md for multi-hour problem solving

OpenAI Cookbook, 2025-10-07

https://developers.openai.com/cookbook/articles/codex_exec_plans

主要涵蓋：

- ExecPlan
- PLANS.md
- long-running implementation
- living document
- self-contained plan
- AGENTS.md 如何引導 Agent 使用 plan

注意：

該頁截至 2026-08-26 已被官方標示為 archived，可能引用舊模型或 API。本文只採用其工程規劃方法，不把其中舊模型資訊當成現行 API 建議。

---

## 3. Unlocking the Codex harness: how we built the App Server

OpenAI Engineering, 2026-02-04

https://openai.com/index/unlocking-the-codex-harness/

主要涵蓋：

- Codex harness
- agent loop
- thread lifecycle
- persistence
- tool execution
- sandbox
- MCP
- skills
- App Server
- bidirectional JSON-RPC
- Item / Turn / Thread
- IDE / Web / CLI 共用 harness

---

## 4. The next evolution of the Agents SDK

OpenAI, 2026-04-15

https://openai.com/index/the-next-evolution-of-the-agents-sdk/

主要涵蓋：

- model-native harness
- configurable memory
- sandbox-aware orchestration
- filesystem tools
- MCP
- Skills
- AGENTS.md
- shell
- apply patch
- native sandbox execution
- harness / compute separation
- prompt injection / exfiltration threat model
- snapshot / rehydration
- parallel isolated compute

繁體中文官方頁：

https://openai.com/zh-Hant/index/the-next-evolution-of-the-agents-sdk/

---

## 建議閱讀順序

如果只想快速理解 Harness：

```text
1. Harness Engineering
2. PLANS.md / ExecPlan
3. Codex App Server
4. Agents SDK sandbox architecture
```

如果要落地到既有專案：

```text
AGENTS.md
    ↓
ARCHITECTURE.md
    ↓
verify command
    ↓
architecture constraints
    ↓
ExecPlans
    ↓
runtime / browser legibility
    ↓
observability
    ↓
agent review
    ↓
continuous garbage collection
```

---

_End of document._
