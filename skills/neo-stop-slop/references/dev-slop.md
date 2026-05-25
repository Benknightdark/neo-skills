# Developer Slop Removal (開發者專用 Slop 消除指南)

身為開發者，程式碼註解 (Code Comments)、Git Commit 訊息、以及 PR (Pull Request) 說明書是我們最常寫文字的地方。然而，當使用 AI 輔助生成這些內容時，極易帶入累贅、客套且公式化的 AI Tells。這本指南能幫助您寫出如資深工程師般精煉、乾淨且精確的開發文字。

---

## 1. 程式碼註解與文檔 (Code Comments & Docstrings)
AI 寫註解時往往過度解釋「這段代碼是做什麼的」，並充斥著無意義的過渡語。

### 🚨 AI 腔特徵：
*   **EN**: "This function is responsible for calculating..." / "Helper method to..." / "Please note that..."
*   **ZH**: 「這個函式的主要職責是負責計算...」 / 「用於...的輔助方法」 / 「請注意，這個方法會...」

### 💡 消除方法：
**直接使用「動詞」開頭**。省略主詞與贅詞，專注於行為本身。

*   *AI 腔 (EN)*:
    ```typescript
    // This function is responsible for retrieving the user profiles from the database.
    // Please note that it returns null if the user does not exist in the system.
    function getUser(id: string) { ... }
    ```
*   *重構 (EN)*:
    ```typescript
    // Fetch user profiles from database. Returns null if not found.
    function getUser(id: string) { ... }
    ```
*   *AI 腔 (ZH)*:
    ```csharp
    /// <summary>
    /// 這個類別的主要目的是用來處理支付流程，它整合了多個第三方 API。
    /// 值得注意的是，在使用此類別之前必須先進行初始化。
    /// </summary>
    class PaymentProcessor { ... }
    ```
*   *重構 (ZH)*:
    ```csharp
    /// <summary>
    /// 整合第三方 API 處理支付流程。使用前須完成初始化。
    /// </summary>
    class PaymentProcessor { ... }
    ```

---

## 2. Git Commit 訊息 (Git Commit Messages)
Git Commit 應是命令式、簡短且直接的。AI 喜歡使用完成時態與贅詞。

### 🚨 AI 腔特徵：
*   **Avoid**: "In this commit, we successfully implemented..." / "Add a new feature that permits the user to..." / "Fix a bug where the database will crash when..."
*   **Avoid (ZH)**: 「在此 commit 中，我們成功實現了...」 / 「修復了一個當用戶輸入為空時資料庫會崩潰的 Bug。」

### 💡 消除方法：
**使用現在式、命令式動詞**。絕不說 "successfully"、"in this commit"。

*   *AI 腔 (EN)*: `feat: successfully added authentication middleware to secure endpoints`
*   *重構 (EN)*: `feat: add auth middleware`
*   *AI 腔 (ZH)*: `fix: 在此提交中，修復了當資料庫連線失敗時會引發記憶體洩漏的嚴重問題`
*   *重構 (ZH)*: `fix: 修正資料庫連線失敗時的記憶體洩漏`

---

## 3. Pull Request 說明書 (PR Descriptions)
PR 說明書應該像一份高效的變更清單，而不是一份行銷簡報。

### 🚨 AI 腔特徵：
AI 產生的 PR 說明通常像這樣：
> "This PR introduces a series of vital enhancements designed to elevate our developer experience and foster better synergy between our modules. We have carefully modified the configuration..."

### 💡 消除方法：
**直接使用項目符號 (Bullet points) 列出具體變更**。去掉所有宣傳性廢話。

*   *AI 腔 (ZH)*:
    > 「這是一個非常重要的 Pull Request，我們對身份驗證模組進行了重塑。值得注意的是，我們將舊有的 Token 驗證機制替換為更安全的 JWT。這無疑能為系統安全提供極佳的護城河，並解決過去用戶偶爾會遇到的登入痛點。」
*   *重構 (ZH)*:
    > - 替換舊有 Token 機制為 JWT，提升驗證安全性。
    > - 修正特定邊界條件下用戶被強制登出的 Bug。
