# Loop Engineering

Use this reference when designing loop architectures that automate agent-driven workflows beyond a single session.

## Loop 與 Harness 的關係

- Harness = 單一 agent 的工作環境（guides + sensors + gates）
- Loop = harness 之上的排程驅動層，讓 harness 自己跑
- 設計 loop 不是取代 prompt，而是把反覆的 prompt 動作系統化

```text
Loop = Automations + Worktrees + Skills + Connectors + Sub-agents + State
       ─────────────────────────────────────────────────────────────────
                          running on top of the Harness
```

## 五個基本原件 + State

### 1. Automations（心跳）

沒有 automations 的 loop 只跑一次；有了它才會重複。

- 排程式觸發，定時執行探索與分類。
- 找到問題的送 triage inbox，沒發現的自動歸檔。
- 可搭配 skills 維護排程任務的可維護性——呼叫 `$skill-name` 而非貼一大段指令。
- `/loop` 按頻率重複執行；`/goal` 持續執行直到停止條件成立，且由獨立模型判斷是否完成。

工具對應：

- Codex：Automations tab（選專案、prompt、頻率、環境），結果進 Triage inbox；`/goal` run-until-done。
- Claude Code：`/loop`、`/goal`、hooks、cron、GitHub Actions。

### 2. Worktrees（隔離）

多 agent 並行時避免檔案衝突。

- 每個 agent 在獨立的 git worktree 工作，共享 repo history。
- 一個 agent 的編輯不會碰到另一個的 checkout。
- 人的 review bandwidth 仍是瓶頸——worktree 解決機械衝突，但你能同時審幾條線決定了你能跑幾個 agent（orchestration tax）。

工具對應：

- Codex：內建 worktree per thread。
- Claude Code：`git worktree`、`--worktree` flag、subagent 的 `isolation: worktree` 設定。

### 3. Skills（知識固化）

把反覆解釋的專案上下文寫成 SKILL.md。

- 消除 intent debt：每次冷啟動，agent 會用自信的猜測填補意圖缺口。Skill 把意圖寫在外面，agent 每次讀取，不需重建。
- 沒有 skills 的 loop 每個 cycle 從零推導你的整個專案；有 skills 的 loop 每次都帶著上次的知識跑。
- Skill 是創作格式，Plugin 是發布格式——跨 repo 分享時打包成 plugin。

工具對應：

- Codex：Agent Skills (`SKILL.md`)，用 `$name` 或 `/skills` 呼叫，或由 description 自動觸發。
- Claude Code：Agent Skills (`SKILL.md`)。

### 4. Plugins / Connectors（外部整合）

透過 MCP 連接外部工具，讓 loop 能在真實環境中行動。

- 可連接 issue tracker、database、staging API、Slack。
- Codex 和 Claude Code 都用 MCP，connector 通常跨工具可用。
- Plugins 把 connectors 和 skills 打包在一起，方便團隊成員一次安裝。

沒有 connectors 的 loop 只能輸出建議；有 connectors 的 loop 能直接開 PR、連 ticket、ping channel。

### 5. Sub-agents（生成與驗證分離）

Loop 的結構性前提是把 maker 和 checker 分開。

- 寫程式碼的 model 對自己的作業打分數太寬容。第二個 agent 用不同指令（有時不同 model）才能抓到第一個說服自己接受的問題。
- `/goal` 底層也是 maker/checker 分離——用獨立的小模型判斷 loop 是否完成，而不是讓做事的 agent 自己說完成了。
- 常見分工：一個 explore、一個 implement、一個 verify against spec。
- Sub-agents 會燒更多 token，花在值得第二意見的地方。

> **職責邊界**：本段只講「為什麼 loop 需要 maker/checker 分離」這個設計決策。具體 sub-agent 的定義格式、指令撰寫、model 選擇等實作細節，請使用 `neo-sub-agent` 技能。

工具對應：

- Codex：`.codex/agents/` 下的 TOML 定義檔，每個有 name、description、instructions、optional model 和 reasoning effort。
- Claude Code：`.claude/agents/` 下的 subagent 定義 + agent teams。

### 6. State（外部記憶）

模型在對話之間會遺忘，進度必須寫在 repo 裡。

- 格式：markdown 檔、Linear board、或任何對話外的持久化儲存。
- State 負責記住做過什麼、通過什麼、還剩什麼。每個 long-running agent 都依賴它：agent 會忘，repo 不會。

## 原件對照表

| 原件 | Loop 中的職責 | Codex | Claude Code |
|:--|:--|:--|:--|
| Automations | 排程探索與分類 | Automations tab, `/goal` | `/loop`, `/goal`, hooks, cron, GitHub Actions |
| Worktrees | 隔離並行 | 內建 worktree per thread | `git worktree`, `--worktree`, `isolation: worktree` |
| Skills | 固化專案知識 | Agent Skills (`SKILL.md`), `$name` | Agent Skills (`SKILL.md`) |
| Plugins / Connectors | 外部工具整合 | Connectors (MCP) + Plugins | MCP servers + Plugins |
| Sub-agents | 生成與驗證分離 | `.codex/agents/` TOML | `.claude/agents/` + agent teams |
| State | 跨對話進度 | Markdown / Linear connector | Markdown (`AGENTS.md`, progress files) / Linear MCP |

## 範例：一個完整 loop 的流程

1. **Automation** 每天早上在 repo 上執行，prompt 呼叫 triage skill。
2. Triage skill 讀取昨天的 CI failures、open issues、recent commits。
3. 發現值得處理的 findings，寫入 **state file** 或 Linear board。
4. 對每個 finding，開一個隔離的 **worktree**。
5. 送一個 **sub-agent**（maker）進 worktree 草擬修復。
6. 送第二個 **sub-agent**（checker）用專案 **skills** 和現有 tests 審查草稿。
7. **Connectors** 開 PR、更新 ticket、CI 通過後 ping channel。
8. 無法處理的 finding 送到 triage inbox 給人。
9. **State file** 記錄什麼被嘗試了、什麼通過了、什麼還開著。
10. 明天早上的 run 從 state 接續。

你設計了一次，之後不再手動 prompt 任何步驟。

## Loop 三大風險

### 1. 驗證仍在你身上

Loop 無人值守時也會無人值守地犯錯。Maker/checker 分離是必要但不充分的——「done」是一個 claim，不是 proof。你的工作是 ship 你確認有效的程式碼。

### 2. 理解債（Comprehension Debt）

Loop 越快產出你沒寫的程式碼，你對系統的理解缺口越大。除非你讀 loop 產出的東西，否則理解債只會加速累積。

### 3. 認知投降（Cognitive Surrender）

當 loop 自己跑，人很容易停止有主見、照單全收。同一個 loop 設計，有判斷力的人用來加速理解深入的工作，沒有判斷力的人用來迴避理解工作本身——同一動作，相反結果。

### 風險防護策略

- 定期抽查 loop 產出，不要只看 CI 綠燈。
- 設定 loop 的產出量上限，避免 review backlog 失控。
- 在 state file 記錄人類最後審查的時間點。
- 高風險變更（安全、合規、產品 scope）強制跳出 loop 等人。
- 定期用 loop 的錯誤模式回饋改善 harness（agentic flywheel）。

## 何時適合引入 Loop vs 留在 Harness

| 條件 | 建議 |
|:--|:--|
| 專案沒有可靠的本地驗證指令 | 先建 harness |
| CI 不穩定或經常紅燈 | 先修 CI |
| 團隊對 agent 產出沒有 review 流程 | 先建 review 流程 |
| Maturity Level < 3 | 先升級 harness |
| 重複性高、風險低的任務（triage、格式修復、依賴更新） | 適合 loop |
| 變更涉及產品 scope、安全、架構取捨 | 不適合全自動 loop |
