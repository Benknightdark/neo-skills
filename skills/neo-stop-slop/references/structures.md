# Formulaic AI Structures to Avoid (避開公式化句式指南)

AI 的寫作不只單字重複，其「句式結構」與「邏輯推進方式」也非常公式化。以下是中英文中最常見的 AI 特徵句式，以及如何將其重構為更自然、直白的寫法。

---

## 1. 二元對立與刻意轉折 (Binary Contrasts / Telegraphed Reversals)
AI 為了製造戲劇效果，極其喜歡先否定一個顯而易見的點，然後翻轉出主旨。這顯得刻意且不真誠。

### 🚨 特徵句型：
*   **EN**: "Not because X, but because Y." / "[X] isn't the problem. [Y] is." / "The answer isn't X. It's Y."
*   **ZH**: 「不是因為 X，而是因為 Y。」 / 「問題不在於 X，而在於 Y。」 / 「答案不是 X，是 Y。」

### 💡 解決方法：
**直接陳述 Y。** 讀者不需要那個「否定 X」的助跑過程。

*   *AI 腔 (EN)*: "Designing software is hard. Not because code is complex. Because requirements change. Let that sink in."
*   *重構 (EN)*: "Designing software is hard because requirements change."
*   *AI 腔 (ZH)*: 「寫測試很麻煩。不是因為工具不好用，而是因為我們沒有好的測試結構。」
*   *重構 (ZH)*: 「混亂的測試結構讓寫測試變得很麻煩。」

---

## 2. 否定式表列 (Negative Listing / Rhetorical Striptease)
在揭曉事物本質前，先列出一長串「它不是什麼」，像是在剝洋蔥。這會浪費讀者的時間。

### 🚨 特徵句型：
*   **EN**: "It wasn't X. It wasn't Y. It was Z." / "Not a blueprint, not a rulebook, but a compass."
*   **ZH**: 「這不是指引，也不是指南，而是一盞明燈。」 / 「這無關技術，無關架構，關乎於人。」

### 💡 解決方法：
**直接寫出 Z。** 省去多餘的鋪墊。

*   *AI 腔 (EN)*: "This project is not a replacement for Git, nor is it a new server. It is a local CLI tool."
*   *重構 (EN)*: "This project is a local CLI tool."
*   *AI 腔 (ZH)*: 「這項改進無關乎伺服器硬體，也無關乎頻寬，而是演算法的優化。」
*   *重構 (ZH)*: 「這項性能提升來自演算法優化。」

---

## 3. 刻意破碎的短句 (Dramatic Fragmentation / Performative Simplicity)
AI 經常使用「名詞。這就夠了。」或「X。然後是 Y。最後是 Z。」等破碎句型來裝作高深、有權威感，但實際上讀起來非常做作。

### 🚨 特徵句型：
*   **EN**: "[Noun]. That's it. That's the [thing]." / "X. And Y. And Z."
*   **ZH**: 「[名詞]。就這樣。這就是 [事物]。」 / 「極簡。這就是我們追求的。」

### 💡 解決方法：
**使用連貫的完整句子。** 信任內容本身的力量，不需要靠格式演戲。

*   *AI 腔 (EN)*: "Continuous integration. That's it. That's the secret."
*   *重構 (EN)*: "Continuous integration is the secret to stable deploys."
*   *AI 腔 (ZH)*: 「高內聚，低耦合。這就是優秀代碼的精髓。」
*   *重構 (ZH)*: 「優秀代碼通常具有高內聚、低耦合的特性。」

---

## 4. 虛假主動權 / 擬人化 (False Agency / Anthropomorphism)
AI 喜歡將「無生命的事物」或「抽象概念」寫得像是有自主意識的活人。這在技術寫作中顯得滑稽且不精確。

### 🚨 特徵句型：
*   **EN**: "The code wants to do X." / "The compiler is trying to tell us..." / "The library brings peace."
*   **ZH**: 「這行代碼渴望告訴我們...」 / 「編譯器正在向我們抗議...」 / 「這個錯誤默默地守護著系統。」

### 💡 解決方法：
**改用客觀、事實性的描述。**

*   *AI 腔 (EN)*: "The garbage collector is fighting to keep the memory clean."
*   *重構 (EN)*: "The garbage collector frees unused memory."
*   *AI 腔 (ZH)*: 「這個函式庫試圖去解決多線程衝突的問題。」
*   *重構 (ZH)*: 「這個函式庫解決了多線程衝突。」

---

## 5. 設問句與自我解答 (Rhetorical Setups & Socratic Posturing)
AI 很喜歡用「如果...會怎樣？」或「想像一下：」等問題來作為段落開頭，然後自己回答。這在非教學性文章中顯得居高臨下。

### 🚨 特徵句型：
*   **EN**: "What if we could [X]?" / "Think about it:" / "Let's be real:"
*   **ZH**: 「如果我們能自動化這一切，會怎麼樣？」 / 「試想一下：」 / 「老實說：」

### 💡 解決方法：
**直接陳述解決方案或事實。**

*   *AI 腔 (ZH)*: 「如果我們能每天節省一小時的部署時間會怎樣？這就是 Docker 的用處。」
*   *重構 (ZH)*: 「Docker 能將每日部署時間縮短一小時。」
