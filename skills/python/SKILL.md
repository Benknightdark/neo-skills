---
name: python
version: "1.0.0"
category: "Core"
description: "用於 Python 3.10+ 開發的核心專家技能。專注於現代 Python 特性（Structural Pattern Matching, Union Types, Async Task Groups）、程式碼品質與架構設計。"
compatibility: "支援 Python 3.10 到 3.14。需要 Python 專案結構（pyproject.toml, requirements.txt, 或 venv）。"
---

# Python 3.10+ Expert Skill

## Trigger On
- 使用者要求編寫、偵錯、審查或重構 Python 程式碼。
- 在包含 `*.py`, `pyproject.toml`, `requirements.txt`, `Pipfile` 或 `poetry.lock` 的儲存庫中工作。
- 需要進行非同步程式設計 (`asyncio`)、型別標註 (Type Hinting) 或現代 Python 特性建議。
- 專案需要設置測試框架 (`pytest`) 或靜態分析工具 (`ruff`, `mypy`)。

## Workflow
1. **Perceive (感知階段):**
   - 檢查專案根目錄，辨識套件管理工具：`pyproject.toml` (Poetry/PDM/Ruff), `requirements.txt` (pip), 或 `environment.yml` (Conda)。
   - 探查 Python 版本要求（確認是否符合 3.10+ 最低要求）。
   - 辨識應用類型：Web API (FastAPI, Flask, Django), Data Science (Pandas, PyTorch), 或 CLI 工具。
2. **Reason (推理階段):**
   - 評估當前程式碼是否符合現代 Python (3.10+) 慣用法（如 `match/case`, `|` 聯集類型）。
   - 決定是否需要引入型別檢查 (MyPy/Pyright) 或自動格式化 (Ruff/Black)。
   - 根據專案規模建議適當的架構模式。
3. **Act (執行階段):**
   - 撰寫具備完整型別標註 (Type Hints) 的 Python 程式碼，優先使用 `X | Y` 語法。
   - 優先使用現代語言特性：`match` 語句 (3.10+), `TaskGroup` (3.11+), 泛型新語法 (3.12+)。
   - 確保程式碼通過靜態分析與單元測試。

## Coding Standards
- **型別標註 (Type Hinting):** 強烈建議為所有函式簽名提供型別標註。使用 3.10+ 的聯集語法 `list[int | str]`。
- **PEP 8 規範:** 遵循官方風格指南。推薦使用 `ruff` 作為 linter 和 formatter 以維持一致性。
- **異步處理:** 使用 3.11+ 的 `asyncio.TaskGroup` 管理併發任務。
- **錯誤處理:** 使用具體的異常類型，並利用 3.11+ 的 `ExceptionGroup` 與 `except*` 語法。

## Tooling Recommendations
- **Linter / Formatter:** `ruff` (高效能且整合度高)。
- **Type Checker:** `mypy` 或 `pyright`。
- **Testing:** `pytest` 搭配 `pytest-asyncio` 或 `pytest-cov`。
- **Package Management:** `Poetry` 或 `uv` 以確保相依性鎖定與環境一致。

## Deliver
- **代碼品質報告:** 指出不符合 3.10+ 現代語法或 PEP 8 的部分。
- **最佳實踐建議:** 提供具體的重構建議，例如將複雜邏輯轉化為 `match/case` 結構。
- **驗證過的程式碼:** 提供附帶測試案例與型別檢查通過的 Python 原始碼。

## Validate
- 程式碼應能在 Python 3.10+ 環境中運行。
- 函式應具備 Docstrings (遵循 Google 或 NumPy 風格)。
- 複雜邏輯應附帶單元測試 (Unit Tests)。
- 所有公開 API 應有完整的型別標註。

## Documentation
### References
- [Python 3 Official Documentation](https://docs.python.org/3/)
- [`reference/dev-style.md`](reference/dev-style.md)
- 現代 Python 語法演進 (3.10-3.14) 與 PEP 8 命名慣例。
- [`reference/patterns.md`](reference/patterns.md)
- 現代 Python 3.10 - 3.14 推薦使用的開發模式與最佳實踐範例。
- [`reference/anti-patterns.md`](reference/anti-patterns.md)
- 應避免的 Python 過時寫法、常見錯誤與安全性陷阱。
