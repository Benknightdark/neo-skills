#!/usr/bin/env python3
# /// script
# requires-python = ">=3.11"
# dependencies = [
#   "requests>=2.31.0",
# ]
# ///

# ==============================================================================
# 💡 PEP 723 (Script Metadata) 說明：
# 上方的註解區塊定義了此獨立腳本執行所需的 Python 最低版本與第三方依賴套件。
# 當 Agent 在 terminal 執行時，可以直接呼叫 `uv run scripts/pep723.py`，
# uv 工具會自動讀取此 block，建立暫時的虛擬隔離環境並自動下載快取依賴，免除手動 pip install 的繁瑣步驟。
# ==============================================================================

"""
Template Script for Agentic Use (AI 代理專用 Python 腳本樣板)

設計指引 (Guidelines)：
1. 嚴禁互動式提示 (STRICTLY Non-interactive)：
   - 絕不能呼叫會阻塞等待人類輸入的 `input()` 或確認選單。
   - 所有輸入參數必須經由 argparse 從 CLI 命令列、環境變數或 stdin 傳入。
2. 乾淨的結構化輸出 (Structured Output)：
   - 傳送至 `stdout` 的一律是純淨、易於被程式解析的結構化資料（如 JSON/CSV）。
3. 診斷日誌導向 stderr (Diagnostic logging to stderr)：
   - 所有的進度提示、INFO、WARN 或錯誤訊息，一律使用 `file=sys.stderr` 印出。
   - 這能讓 Agent 輕鬆以 `jq` 讀取 stdout 乾淨資料，而當出錯時又能去 stderr 取得排障資訊。
4. 預防輸出被截斷 (Predictable output size)：
   - 當資料量龐大時，預設應印出 Summary，或支援將完整資料透過 `--output` 參數直接寫入檔案中。
"""

import sys
import argparse
import json

def parse_args():
    # 透過 argparse 提供完善的參數介面。
    # 這是 Agent 藉由 `--help` 讀取並學習您腳本功能的唯一管道。
    parser = argparse.ArgumentParser(
        description="專為 AI Agent 設計的非互動式參數處理腳本範本。",
        epilog="使用範例: python scripts/pep723.py --input data.txt --format json"
    )
    parser.add_argument(
        "-i", "--input",
        required=True,
        help="待處理的輸入檔案路徑。"
    )
    parser.add_argument(
        "-f", "--format",
        default="json",
        choices=["json", "csv"],
        help="stdout 的輸出格式，預設為 JSON。"
    )
    parser.add_argument(
        "-o", "--output",
        help="選填。指定將結構化結果寫入此檔案路徑，而非直接印在 stdout。"
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="模擬執行模式。僅印出日誌與變更預覽，而不實際寫入檔案或變更系統狀態。"
    )
    return parser.parse_args()

def log_diagnostic(message: str):
    # 💡 關鍵設計：所有的執行過程、日誌日誌，一律導向 sys.stderr，
    # 這樣 stdout 才能保持完全乾淨，不被 [INFO] 或 [DEBUG] 等雜訊干擾。
    print(f"[INFO] {message}", file=sys.stderr)

def main():
    try:
        args = parse_args()
        log_diagnostic(f"開始初始化處理程序，輸入目標: {args.input}")
        
        if args.dry_run:
            log_diagnostic("啟用模擬模式 (Dry-Run)，將不會套用任何實際寫入。")
            
        # ---------------------------------------------------------
        # 此處為您腳本的核心業務邏輯區...
        # ---------------------------------------------------------
        result_data = {
            "status": "success",
            "processed_file": args.input,
            "summary": "AI 代理模式下程式執行成功。"
        }
        
        # 將最終結果序列化為乾淨的結構化字串
        output_str = json.dumps(result_data, indent=2)
        
        # 根據參數決定數據落地方式
        if args.output:
            # 寫入指定的檔案中，預防因 stdout 太長而被 Harness 截斷
            with open(args.output, "w") as f:
                f.write(output_str)
            log_diagnostic(f"結構化分析報告已成功寫入至檔案: {args.output}")
        else:
            # 💡 乾淨資料落地：直接印在 stdout，供 Agent 或 jq 鏈接解析
            print(output_str)
            
        sys.exit(0)
        
    except Exception as e:
        # 💡 錯誤安全防禦：出錯時一律將具體的 stack/error 資訊印至 stderr，並以非零 exit code 退出
        print(f"執行出錯: {str(e)}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
