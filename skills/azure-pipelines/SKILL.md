---
name: azure-pipeline-architect
description: 根據 Microsoft 官方文件與專案需求，設計並生成符合最新標準的 Azure Pipelines YAML 腳本。優先使用模組化 Templates。
---

# Azure Pipeline 腳本設計規範

## 感知 (Perceive)
1. 訪問並檢索官方文件路徑 `https://learn.microsoft.com/en-us/azure/devops/pipelines/?view=azure-devops`，獲取最新的 YAML 語法架構、Task 更新說明及安全性最佳實踐。
2. 獲取應用程式的開發語言類型（如 .NET, Java, Python, Node.js）及其特定版本需求。
3. 識別目標部署平台（如 Azure App Service, Azure Kubernetes Service, Function App 或地端伺服器）。
4. 偵測專案原始碼結構，確認建置工具（如 Maven, Gradle, Npm, NuGet）與測試框架。
5. 讀取安全性與合規性要求，包括靜態代碼掃描（SAST）、套件弱點掃描及容器映像檔掃描。
6. 確認環境變數需求、秘密資訊來源（如 Azure Key Vault）及服務連線（Service Connections）權限。
7. **主動掃描 `skills/azure-pipelines/templates/` 目錄，識別現有可重用的模版資源。包含：**
    *   **Build**: `build/build-dotnet.yml`
    *   **Deploy**: `deploy/deploy-app-service.yml`, `deploy/deploy-iis.yml`
    *   **Utils**: `util/clean-artifact.yml`, `util/extract-artifact.yml`, `util/iis/*.yml` 等。

## 推理 (Reason)
1. 對比官方文件中的最新版本與現有配置，判定是否需更新 Task 版本號（如使用 Checkout@v1 或 Checkout@v4）。
2. 根據專案規模判定是否採用多階段（Multi-stage）架構，以實現 Build、Test、Staging、Production 的邏輯隔離。
3. 評估並設計建置快取策略（Caching），針對相依性套件資料夾進行優化以縮短執行時間。
4. 根據分支策略（Branching Strategy）設計觸發機制（Triggers），區分 Continuous Integration (CI) 與 Continuous Deployment (CD) 的觸發路徑。
5. 判斷部署策略的適用性，如藍綠部署（Blue-Green）、金絲雀部署（Canary）或滾動更新（Rolling Update）。
6. 驗證 Pipeline 邏輯中的條件式執行語法（Conditions），確保僅在特定分支或成功前置作業後才執行後續步驟。
7. **優先採用 `skills/azure-pipelines/templates/` 中的模版來組裝 Pipeline，而非從頭撰寫原始 YAML。**
    *   若專案為 .NET 且需部署至 IIS，應組合 `build-dotnet.yml` 與 `deploy-iis.yml`。
    *   若需操作 Artifacts，應優先使用 `util/extract-artifact.yml`。

## 行動 (Act)
1. 輸出符合最新 Azure DevOps Schema 標準的 YAML 全域設定腳本。
2. 提供完善的參數化定義（Parameters），增加 Pipeline 執行的靈活性與可重用性。
3. 生成環境標籤（Environments）與部署核准機制（Approvals and Checks）的配置建議。
4. 輸出腳本中涉及的 Task 資源引用清單，並標註版本號以確保執行環境一致性。
5. 針對常見執行錯誤（如權限不足、相依性衝突）提供預防性的註釋說明。
6. **使用 `template` 語法引用選定的模版檔案，並正確傳遞所需的參數 (parameters)。例如：**
   ```yaml
   - template: skills/azure-pipelines/templates/build/build-dotnet.yml
     parameters:
       buildConfiguration: 'Release'
   ```
