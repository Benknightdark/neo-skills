# Neo Skills Extension


## Response Guidelines

All responses must strictly adhere to the following guidelines and in Traditional Chinese (Taiwan):
你必須在回答前先進行「事實檢查思考」(fact-check thinking)。 除非使用者明確提供、或資料中確實存在，否則不得假設、推測或自行創造內容。嚴格依據來源：僅使用使用者提供的內容、你內部明確記載的知識、或經明確查證的資料。若資訊不足，請直接說明「沒有足夠資料」或「我無法確定」，不要臆測。顯示思考依據：若你引用資料或推論，請說明你依據的段落或理由。若是個人分析或估計，必須明確標註「這是推論」或「這是假設情境」。避免裝作知道：不可為了讓答案完整而「補完」不存在的內容。若遇到模糊或不完整的問題，請先回問確認或提出選項，而非自行決定。保持語意一致：不可改寫或擴大使用者原意。若你需要重述，應明確標示為「重述版本」，並保持語義對等。回答格式：若有明確資料，回答並附上依據。若無明確資料，回答「無法確定」並說明原因。不要在回答中使用「應該是」「可能是」「我猜」等模糊語氣，除非使用者要求。思考深度：在產出前，先檢查答案是否：a. 有清楚依據，b. 未超出題目範圍，c. 沒有出現任何未被明確提及的人名、數字、事件或假設。最終原則：寧可空白，不可捏造。

## 專案概述 (Project Overview)

這是一個專為 Gemini CLI 設計的擴充功能專案，旨在標準化管理與提供高品質的「技能 (Skills)」。目前的旗艦技能為 **Azure Pipeline Architect**，專注於自動化生成與優化 Azure DevOps CI/CD 流程。

此專案作為 Gemini Agent 的外部知識庫與工具集，透過結構化的目錄與定義檔，讓 Agent 能夠：
1.  **識別專案需求**：透過 `SKILL.md` 定義的感知 (Perceive) 流程。
2.  **推理最佳解法**：根據推理 (Reason) 邏輯選擇適當的架構與策略。
3.  **執行具體行動**：利用預先定義好的 YAML Templates (Act) 生成高品質的程式碼。

## 目錄結構 (Directory Structure)

*   `gemini-extension.yaml`: 擴充功能的定義檔，包含名稱 (`neo-skills`) 與版本。
*   `README.md`: 專案的說明文件。
*   `skills/`: 存放所有技能的根目錄。
    *   `azure-pipelines/`: **Azure Pipeline Architect** 技能目錄。
        *   `SKILL.md`: 定義該技能的核心邏輯 (Perceive-Reason-Act) 與 Prompt。
        *   `templates/`: 可重用的 Azure DevOps YAML 模版庫。
            *   `build/`: 建置相關模版 (e.g., `.NET`, `Node.js`).
            *   `deploy/`: 部署相關模版 (e.g., `App Service`, `IIS`).
            *   `util/`: 工具類模版 (e.g., `IIS Management`, `Artifact Handling`).

## 核心技能 (Key Skills)

### Azure Pipeline Architect (`skills/azure-pipelines`)

這是一個專家級的技能，旨在協助使用者設計企業級的 CI/CD 流程。

*   **知識庫來源**: `SKILL.md` 定義了參考 Microsoft 官方文件的規範。
*   **模版庫**: 位於 `templates/` 下，包含經過優化的 YAML 片段，例如：
    *   **快取機制**: 在 `.NET` 建置中整合 NuGet Cache。
    *   **安全性**: 參數化的 Task 輸入。
    *   **模組化**: 分離 Build, Deploy 與 Utility 邏輯。

## 使用指南 (Usage)

當使用者請求協助建立 Azure Pipelines 時，Agent 應：

1.  **載入 Context**: 參考 `skills/azure-pipelines/SKILL.md` 中的指引。
2.  **分析需求**: 確認使用者的語言 (.NET, Node.js 等) 與部署目標 (App Service, VM, K8s)。
3.  **使用模版**: 優先引用 `skills/azure-pipelines/templates/` 中的現有模版，而非從零撰寫。
    *   *例如*: 需要 .NET Build 流程時，參考 `skills/azure-pipelines/templates/build/build-dotnet.yml`。
4.  **客製化**: 根據使用者專案的特殊需求調整參數。

## 開發與貢獻 (Development)

若要新增一個新的技能 (Skill)：

1.  在 `skills/` 目錄下建立新的資料夾 (e.g., `skills/docker-expert/`)。
2.  建立 `SKILL.md`，定義該技能的 Persona、感知、推理與行動準則。
3.  (選擇性) 建立 `templates/` 或其他輔助檔案，提供該技能所需的知識庫或程式碼片段。

## 指令擴充 (Command Extensions)

### Neo CI/CD (`neo-cicd`)

#### `neo:dotnet-ci [project_name]`
當使用者輸入此指令時，執行以下自動化流程：
1.  **複製模版**: 將 `skills/azure-pipelines/templates/` 資料夾完整複製到專案根目錄下的 `.azure-pipelines/`。
2.  **生成 Pipeline**: 在專案根目錄建立 `ci-[project_name].yml`。
3.  **引用模版**: 內容必須引用 `.azure-pipelines/build/build-dotnet.yml` (使用相對路徑)，並設定參數：
    *   `solution`: 若 `project_name` 為路徑則填入，否則預設 `**/*.sln`。
    *   `dotnetSdkVersion`: 預設 `8.x` (或根據專案自動偵測)。
    *   `buildConfiguration`: `Release`
    *   範例內容：
        ```yaml
        trigger:
          - main

        pool:
          vmImage: 'ubuntu-latest'

        steps:
          - template: .azure-pipelines/build/build-dotnet.yml
            parameters:
              solution: '**/*.sln'
              dotnetSdkVersion: '8.x'
        ```
