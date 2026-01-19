# Neo Skills Extension

**Neo Skills Extension** 是一個專為 Gemini CLI 設計的擴充功能，旨在標準化並自動化 DevOps 工作流程。它作為專家級「技能 (Skills)」與可執行「指令 (Commands)」的知識庫，讓 AI Agent 能夠精確地執行複雜的工程任務。

## 🌟 功能特色

*   **技能管理 (Skill Management)**：針對特定領域（如 Azure Pipelines）的結構化知識庫。
*   **自動化工作流 (Automated Workflows)**：透過預定義指令，一次性執行複雜任務。
*   **模版庫 (Template Library)**：收集經過優化、可直接用於生產環境的 YAML 模版。

## 🚀 可用指令

### CI/CD 自動化 (`neo-cicd`)

| 指令 | 說明 |
| :--- | :--- |
| **`neo:ci-dotnet [project_name]`** | 建立完整的 .NET 持續整合 (CI) 流程。自動偵測解決方案檔案並設定建置快取機制。 |
| **`neo:cd-app-service --app_name [name]`** | 設定 Azure App Service 的持續部署 (CD) 流程。支援多階段 (Multi-stage) 部署架構。 |
| **`neo:cd-iis --website_name [name]`** | 設定地端 IIS (On-Premises) 的持續部署流程。包含自動化備份、檔案部署與還原 (Rollback) 機制。 |

### 核心工具

- **`list-skills`**: 列出目前擴充功能中所有可用的技能。
- **`new-skill`**: 快速建立一個新的技能目錄結構。

## 📂 專案結構

```text
.
├── gemini-extension.yaml  # 擴充功能定義檔
├── GEMINI.md              # AI Context 與操作準則 (給 Agent 看的)
├── commands/              # 可執行指令定義 (TOML)
│   ├── neo-ci-dotnet.toml
│   ├── neo-cd-app-service.toml
│   └── neo-cd-iis.toml
└── skills/                # 知識庫與模版
    └── azure-pipelines/
        ├── SKILL.md       # 「大腦」：定義邏輯與推理過程
        └── templates/     # 「雙手」：可重用的 YAML 資源
```

## 📦 安裝方式

您可以透過以下指令直接從 GitHub 安裝此擴充功能：

```bash
gemini extension install https://github.com/Benknightdark/neo-skills
```

或者手動安裝：

1.  複製此儲存庫 (Clone repository)。
2.  將其連結至您的 Gemini CLI 設定，或直接在專案工作區中使用。

## 🤝 貢獻指南

1.  **技能 (Skills)**：在 `skills/` 下新增領域目錄（例如 `skills/docker/`）。
2.  **指令 (Commands)**：在 `commands/` 中使用 TOML 格式定義新的工作流程。
3.  **文件 (Documentation)**：確保 `SKILL.md` 遵循 **感知-推理-行動 (Perceive-Reason-Act)** 的模式。
