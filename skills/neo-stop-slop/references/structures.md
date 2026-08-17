# Formulaic AI Structures to Avoid

AI writing repeats not only individual words but also sentence structures and logical progressions. The following are common patterns in Chinese and English, with ways to rewrite them more naturally and directly.

---

## 1. Binary Contrasts and Telegraphed Reversals

AI often creates drama by denying an obvious point before revealing the intended point. The result feels deliberate and insincere.

### 🚨 Pattern

*   **EN**: "Not because X, but because Y." / "[X] isn't the problem. [Y] is." / "The answer isn't X. It's Y."
*   **ZH**: 「不是因為 X，而是因為 Y。」 / 「問題不在於 X，而在於 Y。」 / 「答案不是 X，是 Y。」

### 💡 Fix

**State Y directly.** The reader does not need the preliminary denial of X.

*   *AI slop (EN)*: "Designing software is hard. Not because code is complex. Because requirements change. Let that sink in."
*   *Rewrite (EN)*: "Designing software is hard because requirements change."
*   *AI slop (ZH)*: 「寫測試很麻煩。不是因為工具不好用，而是因為我們沒有好的測試結構。」
*   *Rewrite (ZH)*: 「混亂的測試結構讓寫測試變得很麻煩。」

---

## 2. Negative Listing and Rhetorical Striptease

Before revealing what something is, AI often lists a long series of things it is not. This wastes the reader's time.

### 🚨 Pattern

*   **EN**: "It wasn't X. It wasn't Y. It was Z." / "Not a blueprint, not a rulebook, but a compass."
*   **ZH**: 「這不是指引，也不是指南，而是一盞明燈。」 / 「這無關技術，無關架構，關乎於人。」

### 💡 Fix

**State Z directly.** Remove the unnecessary setup.

*   *AI slop (EN)*: "This project is not a replacement for Git, nor is it a new server. It is a local CLI tool."
*   *Rewrite (EN)*: "This project is a local CLI tool."
*   *AI slop (ZH)*: 「這項改進無關乎伺服器硬體，也無關乎頻寬，而是演算法的優化。」
*   *Rewrite (ZH)*: 「這項性能提升來自演算法優化。」

---

## 3. Dramatic Fragmentation and Performative Simplicity

AI often uses fragments such as "Noun. That's it." or "X. Then Y. Finally Z." to sound profound or authoritative. In practice, these structures feel artificial.

### 🚨 Pattern

*   **EN**: "[Noun]. That's it. That's the [thing]." / "X. And Y. And Z."
*   **ZH**: 「[名詞]。就這樣。這就是 [事物]。」 / 「極簡。這就是我們追求的。」

### 💡 Fix

**Use connected complete sentences.** Let the content carry the point instead of performing through formatting.

*   *AI slop (EN)*: "Continuous integration. That's it. That's the secret."
*   *Rewrite (EN)*: "Continuous integration is the secret to stable deploys."
*   *AI slop (ZH)*: 「高內聚，低耦合。這就是優秀代碼的精髓。」
*   *Rewrite (ZH)*: 「優秀代碼通常具有高內聚、低耦合的特性。」

---

## 4. False Agency and Anthropomorphism

AI often writes about inanimate objects or abstract concepts as if they were people with their own intentions. This is imprecise and distracting in technical writing.

### 🚨 Pattern

*   **EN**: "The code wants to do X." / "The compiler is trying to tell us..." / "The library brings peace."
*   **ZH**: 「這行代碼渴望告訴我們...」 / 「編譯器正在向我們抗議...」 / 「這個錯誤默默地守護著系統。」

### 💡 Fix

**Use objective, factual descriptions.**

*   *AI slop (EN)*: "The garbage collector is fighting to keep the memory clean."
*   *Rewrite (EN)*: "The garbage collector frees unused memory."
*   *AI slop (ZH)*: 「這個函式庫試圖去解決多線程衝突的問題。」
*   *Rewrite (ZH)*: 「這個函式庫解決了多線程衝突。」

---

## 5. Rhetorical Setups and Socratic Posturing

AI often opens a section with a question such as "What if...?" or 「想像一下：」 and then answers it. Outside instructional writing, this can sound patronizing.

### 🚨 Pattern

*   **EN**: "What if we could [X]?" / "Think about it:" / "Let's be real:"
*   **ZH**: 「如果我們能自動化這一切，會怎麼樣？」 / 「試想一下：」 / 「老實說：」

### 💡 Fix

**State the solution or fact directly.**

*   *AI slop (ZH)*: 「如果我們能每天節省一小時的部署時間會怎樣？這就是 Docker 的用處。」
*   *Rewrite (ZH)*: 「Docker 能將每日部署時間縮短一小時。」
