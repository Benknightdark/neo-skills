---
name: neo-stop-slop
description: >
  Remove AI writing patterns, tells, and slop from prose, technical drafts, code comments,
  git commit messages, or pull request descriptions. Supports both Traditional Chinese and English.
  Use this skill when the user wants to polish, edit, rewrite, or review drafts to make them sound
  more natural, concise, and direct, or when they ask to eliminate AI tells/slop, even if they don't
  explicitly say "stop-slop".
license: MIT
compatibility: Requires Node.js (ESM) to run the analyze-slop.js script.
metadata:
  author: Ben Knight Dark
  version: "1.0.0"
  patterns: reviewer, generator
---

# Neo Stop Slop

`neo-stop-slop` 是一個專門設計用來消除中英文 AI 腔調（AI Tells）、贅詞及公式化囉唆結構的雙核技能。它能讓 AI 生成的文案、技術草稿、程式碼註解、Git Commit 及 PR 說明，轉換為極簡、乾淨且生動的自然語言。

本技能結合了 **Reviewer (文字診斷審查)** 與 **Generator (極簡重寫生成)** 兩大核心工作流。

---

## Gotchas

*   **過度精簡風險**：在進行「Rewrite (重寫)」時，務必確保**沒有遺漏關鍵的技術細節或事實資訊**。去 AI 腔是指「清除贅詞與修飾架構」，而不是刪減實質內容。
*   **代碼語法與註解標記**：修剪「代碼註解」時，切勿破壞 XML 文件結構（如 C# 的 `<summary>`、`<param>`）或 JSDoc/TSDoc 的結構標記。
*   **檢測腳本執行**：使用 `analyze-slop.js` 時，一律採用**非互動模式**（傳入 `--file` 或 `--input`，配合 `--format json` 或不帶選項），避免任何 TTY 卡死。

---

## Workflow Checklist

Progress:
- [ ] **Step 1 — Perceive (感知環境)**：辨識輸入文字的語言（繁中/英文）與場景（文案、註解、Git Commit 或 PR 說明），確認使用者需要 `Review`（診斷）還是 `Rewrite`（重寫）。
- [ ] **Step 2 — Reason (制定策略)**：根據語言與場景，加載相對應的參考手冊（`references/` 資源檔）。
- [ ] **Step 3 — Act: Review (執行診斷，若適用)**：執行內建的 `scripts/analyze-slop.js` 統計贅詞並計算 Slop 密度分數。
- [ ] **Step 4 — Act: Rewrite (執行重寫，若適用)**：對照 `references/examples.md` 的轉換標準，將文字徹底重寫為極簡且充滿力量的直白文句。
- [ ] **Step 5 — Verify (結果驗證)**：再次對重寫後的文字執行 `analyze-slop.js`，確保 Slop 密度降至 A+ 級（< 0.5%）。

---

## Detailed Guidelines

### Step 1 — Perceive (感知環境)
仔細分析使用者的請求與文本：
1.  **語言檢索**：辨識主要語言是 **繁體中文 (Taiwan)** 還是 **英文**。
2.  **場景分類**：
    *   *一般文案/草稿*：加載 `phrases-zh.md`/`phrases-en.md` 與 `structures.md`。
    *   *開發者文字 (註解/Commit/PR)*：加載 `dev-slop.md`。
3.  **模式選擇**：
    *   使用者問「這段文字有 AI 腔嗎？」或「幫我做文字審查」：進入 **Review 模式**。
    *   使用者直接說「幫我重寫這段話」或「把 AI 腔消掉」：進入 **Rewrite 模式**。

---

### Step 2 — Reason & Load References
動態加載該技能目錄下的專用知識庫。請根據 Step 1 的感知結果載入以下相對應的路徑：
*   **英文通用**：`references/phrases-en.md`
*   **中文通用**：`references/phrases-zh.md`
*   **公式化結構**：`references/structures.md`
*   **開發者專項**：`references/dev-slop.md`
*   **Before/After 對照組**：`references/examples.md`

---

### Step 3 — Act: Review 模式 (診斷)
1.  將使用者提供的文本寫入臨時檔案，或直接作為參數傳遞給統計腳本。
2.  在終端非互動執行 `analyze-slop.js`：
    ```bash
    node skills/neo-stop-slop/scripts/analyze-slop.js --input "[使用者輸入的文本內容]" --format json
    ```
3.  解析腳本產出的 JSON 數據，擷取：
    *   **Slop Density Score (Slop 密度分數)**
    *   **Grade (評估等級)**
    *   **Violations (檢出的贅詞清單)**
4.  依據 Output Templates 呈現 Slop 診斷報告，列出違規行數、違規類型，並給出重構建议。

---

### Step 4 — Act: Rewrite 模式 (重寫)
當需要重寫文本時，請遵循以下 6 條去 Slop 鋼鐵鐵律：
1.  **消滅清喉嚨詞 (Cut fillers)**：徹底刪去「值得注意的是」、「不容忽視」、「Here's the thing」等起手式。
2.  **用主動代替被動 (Active voice)**：確保每個句子都有具體的主語（如「人」或「具體組件」）在執行動作。避免擬人化 ("The code wants to...")。
3.  **打碎公式化結構 (Break formulaic setups)**：去除「不是因為 X，而是因為 Y」這類刻意轉折的二元對立；刪除「試想一下：」等自我設問。
4.  **用具體事實代替空泛形容詞 (Be specific)**：將「大幅提升效能、解決痛點」等空話，改寫為具體成效（例如「減少 80% 記憶體開銷」）。
5.  **縮減字數至少 30%**：AI 腔的本質是稀釋資訊。優秀的文字會以最少字數傳達最大資訊量。
6.  **適用開發者規則 (Apply Dev Conventions)**：若處理代碼註解或 Git Commit，嚴格套用 `dev-slop.md` 的精簡規則。

---

### Step 5 — Verify (結果驗證)
1.  將重寫後的文字再次輸入檢測腳本：
    ```bash
    node skills/neo-stop-slop/scripts/analyze-slop.js --input "[重寫後的文本]" --format json
    ```
2.  確認 `slopDensityScore` **小於 0.5%**（評估等級達到 **A+**）。
3.  向使用者呈交成果時，標明重寫前後的字數變化與 Slop 密度的巨大改善。

---

## Output Templates

### 1. Review 診斷報告範本
當使用者要求「審查/診斷」文字時，請格式化輸出如下：

```markdown
### 🔍 AI Slop 診斷報告

*   **文本字數**: [總字數] 字
*   **檢出 AI Tells 數量**: [檢出數] 處
*   **Slop 密度分數**: **[密度Score]%** (每百字出現 [檢出數] 次)
*   **評估等級**: **[等級]**

#### ⚠️ 檢出細節與修改建議
| 行數 | 檢出贅詞 | 類型 | 診斷與重構建议 |
| :--- | :--- | :--- | :--- |
| 第 X 行 | "值得注意的是" | 廢話起手式 | 刪除此段過渡句，直接陳述後續事實。 |
| 第 Y 行 | "賦能生態系" | AI 濫用詞 | 替換為「提供技術支持」或「構建合作社群」。 |

#### 📝 優化建議摘要
1. [針對該文章結構的第一條具體調整建議]
2. [針對副詞或被動語氣的第二條調整建議]
```

### 2. Rewrite 重寫成果範本
當使用者要求「重寫」文字時，請格式化輸出如下：

```markdown
### ✨ 去 AI 腔重寫成果

*   **字數變化**: [原始字數] 字 ➡️ **[重寫字數] 字 (縮減 [縮減比例]%)**
*   **Slop 密度**: [原始密度]% ➡️ **0.0% (等級 A+ ✨)**

---

#### 📄 重寫後文本
> [在此處寫入重寫後的極簡自然文本。保持排版清爽，避免任何 AI 贅字。]

---

#### 💡 關鍵重構解析
1. **[重構點 1]**：將原始的「[Before 文字]」轉化為「[After 文字]」，去除了「[AI 腔]」並讓語氣更為[主動/直接]。
2. **[重構點 2]**：刪除贅言，以具體事實「[具體內容]」代替空洞的「[Before 詞彙]」。
```
