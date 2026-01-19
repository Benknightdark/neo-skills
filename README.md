# Neo Skills Extension

這是一個基於 Gemini CLI 架構的技能管理擴充功能。參考了 `conductor` 的設計模式，用於標準化管理專案中的各種「技能 (Skills)」。

## 功能

- **`list-skills`**: 列出目前專案中所有可用的技能。
- **`new-skill`**: 快速建立一個新的技能模版結構。
- **`neo:dotnet-ci [project_name]`**: 自動為 .NET 專案設置 Azure Pipelines CI 流程 (包含複製模版)。

## 安裝

在您的 Gemini CLI 設定中連結此目錄，或直接在專案根目錄使用。

## 結構

- `gemini-extension.yaml`: 擴充功能配置
- `GEMINI.md`: AI Context
- `commands/`: 指令腳本
- `skills/`: 技能存放區
