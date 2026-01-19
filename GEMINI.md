# Neo Skills Extension Context

此檔案定義了 `neo-skills` 擴充功能的核心行為與知識庫。當使用者載入此擴充功能時，這些 context 將被用來輔助 AI 理解如何使用這裡提供的工具。

## Extension Purpose
此擴充功能旨在為專案提供標準化的「技能 (Skills)」管理機制，類似於 `conductor` 管理 Tracks 的方式。

## Core Concepts

### 1. Skill (技能)
一個 Skill 代表一個獨立的功能模組或自動化工作流程。
- 每個 Skill 都有獨立的目錄結構。
- Skill 必須包含定義其行為的 metadata。

## Workflow
1. 使用 `new-skill` 創建新技能。
2. 在 `skills/` 目錄中實作技能邏輯。
3. 使用 `list-skills` 查看狀態。
