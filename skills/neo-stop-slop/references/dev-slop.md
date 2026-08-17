# Developer Slop Removal

Code comments, Git commit messages, and pull request descriptions are some of the most common kinds of text developers write. AI-generated versions often contain filler, politeness, and formulaic AI tells. Use this guide to write concise, clean, and precise developer-facing text.

---

## 1. Code Comments and Docstrings

AI-generated comments often over-explain what code does and add meaningless transitions.

### 🚨 AI tell patterns

*   **EN**: "This function is responsible for calculating..." / "Helper method to..." / "Please note that..."
*   **ZH**: 「這個函式的主要職責是負責計算...」 / 「用於...的輔助方法」 / 「請注意，這個方法會...」

### 💡 How to remove them

**Start with the verb.** Omit unnecessary subjects and filler; focus on the behavior.

*   *AI slop (EN)*:
    ```typescript
    // This function is responsible for retrieving the user profiles from the database.
    // Please note that it returns null if the user does not exist in the system.
    function getUser(id: string) { ... }
    ```
*   *Rewrite (EN)*:
    ```typescript
    // Fetch user profiles from database. Returns null if not found.
    function getUser(id: string) { ... }
    ```
*   *AI slop (ZH)*:
    ```csharp
    /// <summary>
    /// 這個類別的主要目的是用來處理支付流程，它整合了多個第三方 API。
    /// 值得注意的是，在使用此類別之前必須先進行初始化。
    /// </summary>
    class PaymentProcessor { ... }
    ```
*   *Rewrite (ZH)*:
    ```csharp
    /// <summary>
    /// 整合第三方 API 處理支付流程。使用前須完成初始化。
    /// </summary>
    class PaymentProcessor { ... }
    ```

---

## 2. Git Commit Messages

Git commits should be imperative, short, and direct. AI often uses past tense and filler.

### 🚨 AI tell patterns

*   **Avoid**: "In this commit, we successfully implemented..." / "Add a new feature that permits the user to..." / "Fix a bug where the database will crash when..."
*   **Avoid (ZH)**: 「在此 commit 中，我們成功實現了...」 / 「修復了一個當用戶輸入為空時資料庫會崩潰的 Bug。」

### 💡 How to remove them

**Use present-tense imperative verbs.** Never use "successfully" or "in this commit".

*   *AI slop (EN)*: `feat: successfully added authentication middleware to secure endpoints`
*   *Rewrite (EN)*: `feat: add auth middleware`
*   *AI slop (ZH)*: `fix: 在此提交中，修復了當資料庫連線失敗時會引發記憶體洩漏的嚴重問題`
*   *Rewrite (ZH)*: `fix: 修正資料庫連線失敗時的記憶體洩漏`

---

## 3. Pull Request Descriptions

PR descriptions should be efficient change lists, not marketing briefs.

### 🚨 AI tell patterns

An AI-generated PR description often looks like this:
> "This PR introduces a series of vital enhancements designed to elevate our developer experience and foster better synergy between our modules. We have carefully modified the configuration..."

### 💡 How to remove them

**List concrete changes directly with bullet points.** Remove promotional filler.

*   *AI slop (ZH)*:
    > 「這是一個非常重要的 Pull Request，我們對身份驗證模組進行了重塑。值得注意的是，我們將舊有的 Token 驗證機制替換為更安全的 JWT。這無疑能為系統安全提供極佳的護城河，並解決過去用戶偶爾會遇到的登入痛點。」
*   *Rewrite (ZH)*:
    > - 替換舊有 Token 機制為 JWT，提升驗證安全性。
    > - 修正特定邊界條件下用戶被強制登出的 Bug。
