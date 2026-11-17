---
name: neo-mas-app-audit
description: >
  Use this skill when the user explicitly asks to perform a mobile App security audit
  or compliance check against Taiwan MAS "行動應用App基本資安檢測基準" (L1/L2/L3/F)
  for their Android, iOS, or cross-platform App. 當使用者明確要求對自己開發的行動應用
  App 進行資安審核、資安規範合規檢測或 MAS 基本資安檢測時才使用此技能。Activate ONLY
  when an App security audit is requested; do NOT use for general App feature
  development, UI coding, bug fixing, unit test writing, or standard PR code reviews.
license: MIT
compatibility: >
  Requires Python 3.11+ and network access to https://www.mas.org.tw/app/questAndAnswer
  for mandatory update checks on each invocation (supports agent-browser fallback).
metadata:
  version: "1.0.0"
  pattern: "reviewer, generator, pipeline"
  standard: "MAS-V4.0"
---

# 行動應用 App 基本資安檢測基準審核技能（MAS Benchmark Audit）

依據行動應用資安聯盟（MAS）公布之中文版**《行動應用 App 基本資安檢測基準 V4.0》（中華民國 113 年 9 月）**，對使用者開發的行動應用 App 進行合規資安審核，並於每次調用前檢查官網標準是否更新、於審核結束後回傳固定格式的結構化分析報告。

## 觸發邊界（Trigger Boundary）

* **僅於以下情境啟動**：使用者明確要求「對 App 進行資安審核／資安檢測／資安合規檢查」、確認 App 是否符合「行動應用 App 基本資安檢測基準 / MAS 規範 / L1 / L2 / L3 / F」。
* **嚴禁於以下情境觸發**：一般 App 功能實作、SwiftUI / Jetpack Compose / Flutter UI 開發、建置或執行期除錯、一般非資安審核導向之 PR Diff Code Review、撰寫單元或整合測試。

## 核心注意與防呆（Gotchas）

1. **禁止跳過 Step 0 來源檢查**：每次被調用都必須先檢查官網基準是否更新；若離線或解析失敗，必須在報告中明確註記失敗原因，不可靜默略過或偽稱「已確認最新」。
2. **無更新不異動檔案；有更新在允許範圍直接覆寫**：`status` 為 `up_to_date` 時不修改任何檔案。若偵測到 `update_available`，將新版 PDF 下載至系統暫存目錄（禁止寫入受測 App 專案），在允許權限範圍內直接覆寫本 Skill 目錄之相關檔案，並於固定報告第一節列出變更清單；若因沙盒／權限受阻無法寫入外部 Skill 目錄，須誠實回報受阻路徑與須補丁之檔案清單，並依新版 PDF 完成本次審核。
3. **禁止無證據推測「符合要求」**：對於須依賴上架商店頁面文字、實機封包側錄、系統備份檢查、實際聯絡測試或伺服器弱點掃描才能最終定論之項目，單憑靜態原始碼不得直接判定通過，必須標記為 **`待人工／動態確認`**。
4. **L2 與 L3 互斥替換與平台差異**：同時具備身分鑑別與交易行為之 App 一律歸為 **L3**；L3 使用 **`4.1.2.3.5`**（取代 L1/L2 的 `4.1.2.3.4`）。iOS App 對 `4.1.5.1.3`（螢幕覆蓋防護）與 `4.1.5.5.8`（USB 偵錯偵測）固定判定為 **`不適用`**；`4.1.2.3.9` 對 Android 須檢查基準 (1)(2)、對 iOS 僅檢查基準 (2)。
5. **過時演算法剔除**：基準 V4.0 自 2023/12/31 起已剔除 Triple DES（3DES / DES3），若專案仍使用 3DES、DES、RC4、MD5/SHA-1（用於加密或金鑰衍生）或非安全亂數函式，相關項目須判定為 **`不符合要求`**。
6. **區分強制檢測項與參考項**：`4.1.1`～`4.2.2` 共 49 個強制檢測編號（依 L1=25 / L2=31 / L3=39、F=9 計數）；附錄五 `REF-1`～`REF-16` 僅供開發建議，不影響強制合規判定。

## 執行流程（Pipeline，嚴格依序執行不可跳過）

### Step 0 — 檢查官網基準是否更新並直接同步 Skill

以本 `SKILL.md` 所在目錄為 `<SKILL_ROOT>`，執行更新檢查腳本（不會寫入受測 App 專案）：

```bash
python3 -B "<SKILL_ROOT>/scripts/check-mas-update.py" --download-dir "${TMPDIR:-/tmp}/mas-audit-cache"
```

* **情境 A（`status == "up_to_date"`）**：無需更新 Skill 檔案，直接進入 Step 1，並於報告記錄已確認官網維持最新版本。
* **情境 B（`status == "update_available"`）**：
  1. 讀取 `downloaded_pdf_path` 指向的新版中文 PDF，解析與本地 `references/source-manifest.json` 及各基準章節之差異。
  2. 閱讀 [overview-and-classification.md](references/overview-and-classification.md) 第 6 節同步對應表，**在允許權限內直接覆寫** `<SKILL_ROOT>` 下的 `references/source-manifest.json`、受影響的 `references/*.md`、`assets/audit-report-template.md` 與 `SKILL.md`（若在 `neo-skills` 專案內開發，亦同步檢查測試與 `python3 scripts/check-skills-syntax.py`）。
  3. 記錄「更新前/後版本、異動條文摘要、修改檔案清單」，納入最終固定報告第一節回報給使用者後，繼續執行 Step 1。
* **情境 C（`status == "check_failed"` 且 `fallback_recommended == "agent-browser"`）**：
  * 若為網頁改版導致解析失敗，使用 `agent-browser` 開啟 `https://www.mas.org.tw/app/questAndAnswer` 查看「行動應用App基本資安檢測基準」中文版連結並比對 `references/source-manifest.json`。
  * 若確認為離線／網路受限無法連線，記錄具體錯誤訊息並沿用本地基準執行審核，於固定報告第一節與第五節明確揭露。

### Step 1 — 盤點受測 App 專案與判定分類

檢查受測專案檔案（如 `AndroidManifest.xml`、`build.gradle*`、`network_security_config.xml`、`Info.plist`、`*.entitlements`、`pubspec.yaml`、`package.json` 及主要程式進入點），確認：
1. **平台與基本識別**：Android / iOS / Cross-Platform、App 名稱、Package Name / Bundle ID、版本號。
2. **安全分類**：
   * `L1`（25 項）：無須使用者身分鑑別。
   * `L2`（31 項）：須使用者身分鑑別（登入、Token/Session、存取個人資料）。
   * `L3`（39 項）：含有交易行為（付款、轉帳、購票、點數／虛擬貨幣／實體貨幣交易，同時含 L2 與 L3 一律歸 **L3**）。
   * `+F`（加測 9 項）：使用者明確要求高安全性檢測（或屬金融／醫療／高敏個資交易 App 時主動納入或提醒）。
3. **發布狀態**：`已發布` / `尚未發布` / `不公開（企業內部）`。

### Step 2 — 載入對應參考規範

依需要閱讀下列基準參考檔（以最新同步後之內容為準）：
* 總覽、用語定義、分類矩陣與同步指南：[overview-and-classification.md](references/overview-and-classification.md)
* 發布安全（`4.1.1`）與敏感性資料保護（`4.1.2`）：[checklist-part1-release-and-data.md](references/checklist-part1-release-and-data.md)
* 交易控管（`4.1.3`）、鑑別與連線（`4.1.4`）、程式碼安全（`4.1.5`）及 Webview 安全（`4.2.2`）：[checklist-part2-tx-auth-code-server.md](references/checklist-part2-tx-auth-code-server.md)
* 附錄五參考項目（`REF-1`～`REF-16`）與附錄三調查表（欄位 1～22）：[reference-items-and-survey.md](references/reference-items-and-survey.md)

### Step 3 — 逐項證據式靜態資安審核

針對目標類別所有必檢項目（以及若加測 `+F` 之 9 項），逐項搜尋與閱讀專案程式碼、設定檔、Build 設定與依賴清單，依實際證據判定為：
* `符合要求`（註明 `file:line` 實作證據或符合條文免除條件）
* `不符合要求`（註明 `file:line`、觸犯之檢測基準小點、風險與修復方向）
* `不適用`（註明符合 V4.0 何項不適用條件）
* `待人工／動態確認`（註明無法單靠原始碼定論之原因及動態／商店／後端驗證方式）

### Step 4 — 依固定分析報告模板回傳結果

1. 閱讀 [audit-report-template.md](assets/audit-report-template.md)。
2. **嚴格依照該模板的 6 個固定章節與欄位結構**輸出最終分析報告給使用者，不得省略章節、不得合併表格欄位或更換報告格式；確認第三節明細表涵蓋目標類別之全部必檢項目且加總與第二節統計數字一致。
