# Neo Skills

**Neo Skills** 是給 AI Agent 使用的專家技能套件。核心交付物是 `skills/<skill-name>/SKILL.md` 與其延伸資源，並透過安裝工具同步到 Antigravity CLI 或其他支援 Agent Skills 規格的用戶端。

本專案的目標不是收集提示詞，而是把可重複使用的專業工作流程、參考文件、範本、非互動式腳本與評估資料打包成可維護的技能模組。

## 回應風格

- 使用繁體中文（台灣）。
- Commit 訊息必須使用繁體中文（台灣）。
- 需要事實判斷時，只根據使用者提供內容、目前 worktree、專案檔案或已驗證來源回答；資料不足時直接說明不能確定。

## 專案結構

| 路徑 | 用途 |
| :--- | :--- |
| `skills/<skill-name>/SKILL.md` | 每個技能的主要入口；第一行必須是 `---` frontmatter。 |
| `skills/<skill-name>/references/` 或 `reference/` | 深度知識、檢核表、反模式、設計規範；只在需要時載入。 |
| `skills/<skill-name>/assets/` | 文件、程式碼或設定檔範本。 |
| `skills/<skill-name>/scripts/` | 可重複執行的非互動式輔助腳本。 |
| `skills/<skill-name>/evals/` | 觸發率與輸出品質評估資料。 |
| `bin/` | 安裝 CLI 與共用工具。 |
| `scripts/check-skills-syntax.py` | 技能 frontmatter 與基本結構驗證工具。 |
| `test/*.test.js` | Node.js 測試。 |

## 開發指令

- `npm install`：本地安裝依賴。
- `npm test`：執行 Node.js 測試。
- `python3 scripts/check-skills-syntax.py --dir skills`：驗證所有技能目錄與 `SKILL.md` frontmatter。
- `node bin/install-skills.js`：將技能同步到 Antigravity CLI 全域技能目錄。

## Skill 品質標準

每個技能都必須符合 Agent Skills 的漸進式揭露原則：

1. `SKILL.md` 第一行必須是 `---`。
2. frontmatter 必須包含 `name` 與 `description`。
3. `name` 必須與父資料夾名稱完全一致，使用 lowercase kebab-case。
4. `description` 要描述「何時使用這個技能」，優先使用 `Use this skill when...` 或等價的明確觸發語。
5. 自訂屬性放在 `metadata` 底下；不要在 frontmatter 頂層新增未標準化欄位。
6. `SKILL.md` 保持精簡，複雜規則放入 `references/`、`assets/`、`scripts/` 或 `evals/`。
7. 涉及版本、官方規格、SDK 或雲端服務的內容，若答案依賴最新狀態，必須查證官方來源；不能查證時要標明不確定。
8. 修改技能時，同步檢查 README、evals、references、assets 與 scripts 是否仍一致。

## 腳本規範

寫在 `skills/<skill-name>/scripts/` 或全域 `scripts/` 的輔助腳本必須符合：

1. **非互動式**：只透過 CLI 參數、環境變數或 stdin 接收輸入；不要使用 `input()`、TTY prompt 或確認對話。
2. **stdout/stderr 分離**：stdout 只輸出可解析資料（JSON、CSV、TSV）；診斷、進度與錯誤輸出到 stderr。
3. **可重試**：能支援 dry-run 或安全重跑時要提供；避免同一輸入造成不可預期副作用。
4. **PEP 723**：Python 腳本需放入 inline dependency block，方便 `uv run` 直接執行。

## 測試規範

- 變更 installer、檔案布局、hook 邏輯或驗證腳本時，新增或更新 `test/*.test.js`。
- 變更技能 frontmatter 或新增技能後，執行 `python3 scripts/check-skills-syntax.py --dir skills`。
- 變更腳本時，優先加入可由 CI 或本地命令執行的非互動式測試。
- PR 前至少確認 `npm test` 通過。

## Commit 與 PR

- Commit 採 Conventional Commits 1.0.0：`<type>[optional scope]: <description>`。
- 常用 type：`feat`、`fix`、`docs`、`test`、`refactor`、`build`、`ci`、`chore`。
- Commit 主旨使用繁體中文（台灣），不要加句號。
- 不要加入 `Co-authored-by` 或任何 AI attribution trailer。
- 每個 commit 聚焦單一邏輯變更，不混入不相關修改。
- PR 說明需包含行為變更、已執行指令與相關 issue。

## 安全與內容

- 不提交 secret、token、sample credentials 或可被誤用的危險提示詞。
- 移除技能時，完整刪除目錄並同步清理 README、安裝文件與任何引用。
- 不確定某項外部規格是否仍正確時，不要把它寫成確定事實。

## Agent 工作流程

1. 先讀目前 worktree，不依賴記憶中的舊狀態。
2. 小步修改，保留使用者既有變更。
3. 文件、技能與驗證工具要互相對齊。
4. 完成後回報修改重點、已跑驗證，以及仍未處理的風險或待辦。
