---
name: dotnet
version: "1.0.0"
category: "Framework"
description: 用於廣泛 .NET 工作的核心路由技能。此技能將偵測本機安裝的 .NET SDK 版本（要求 .NET 6+），並根據使用者的問題，將任務引導或準備載入其他合適的子技能（例如 Minimal APIs, MVC, Web API, EF Core）。
compatibility: "Supports .NET 6.0 and above. Requires .NET SDK installed on the local machine."
---

# .NET 核心技能

## 概述
此技能作為 .NET 開發環境的統一入口。它確保系統環境符合現代化 .NET 開發的要求，並具備分析使用者需求、產出相應的命令列操作，以及路由至對應領域專家技能的能力。

## 核心職責 (Perceive & Act)

1. **環境偵測與版本驗證**
   - 執行 `dotnet --version` 來檢查當前安裝的 SDK 版本。
   - **強制要求**：只支援 **.NET 6 或更高版本**。若偵測到低於 .NET 6 的版本，請提示使用者升級。

2. **執行適當的 .NET CLI**
   - 根據偵測到的版本與專案狀態，提供或執行現代化的 CLI 命令。
   - 例如：
     - 建置與執行：`dotnet build`, `dotnet run`
     - 測試：`dotnet test`
     - 套件管理：`dotnet add package`, `dotnet tool restore`

3. **需求分析與動態技能路由 (Skill Routing)**
   - 根據使用者的具體問題或專案架構，判斷其涉及的領域。
   - 如果使用者的任務屬於以下特定領域，請**準備載入或建議使用者切換至**對應的子技能（請注意，這些子技能可能尚未實作，請告知使用者後續建立方向）：
     - **`dotnet-minimal-apis`**：當需求為輕量級路由開發、高效能微服務，且未使用 Controllers 時。
     - **`dotnet-webapi`**：當需求為遵循控制器模式、傳統 RESTful API 開發時。
     - **`dotnet-mvc`**：當需求包含伺服器端渲染 (SSR)、Razor 視圖與視圖模型時。
     - **`dotnet-ef-core`**：當需求涉及資料庫移轉 (Migrations)、Linq 查詢優化或模型對應時。

## 使用指引
當此技能被觸發時，請優先確認 SDK 環境，接著回答使用者的 .NET 相關問題，若發現問題屬於上述四個專業領域，請主動建議並準備委派給對應的專家技能處理。

## 文件 (Documentation)

### 官方參考資料 (Official References)
- [.NET CLI 工具概觀](https://learn.microsoft.com/dotnet/core/tools/)
