#!/usr/bin/env python3
# /// script
# requires-python = ">=3.11"
# dependencies = []
# ///

"""
AI Agentic Requirement Report Validator (Non-interactive)
專為 AI Agent 設計的非互動式需求釐清報告完整性驗證工具。

設計要點：
1. 嚴禁任何互動式提示詞 (input(), confirm())。
2. 診斷日誌、錯誤訊息一律寫入 sys.stderr。
3. 處理結果一律以乾淨的 JSON 結構輸出至 sys.stdout。
"""

import sys
import argparse
import re
import os
import json
from typing import Dict, List, Any

def log_diagnostic(message: str) -> None:
    """將診斷日誌印至 stderr，避免污染 stdout 的 JSON。"""
    print(f"[LOG] {message}", file=sys.stderr)

def validate_markdown(file_content: str) -> List[str]:
    """靜態驗證 Markdown 內容是否符合規格要求。"""
    errors = []
    
    # 1. 驗證必要區段（不論是 H3 還是普通標題，檢查關鍵字）
    required_sections = {
        "現況還原": r"(現況還原|Context)",
        "使用者故事": r"(使用者故事|User Story)",
        "系統需求": r"(系統需求|System Requirements)",
        "待釐清問題": r"(待釐清問題|Open Questions)"
    }
    
    for section_name, pattern in required_sections.items():
        if not re.search(pattern, file_content, re.IGNORECASE):
            errors.append(f"缺少必要區段: {section_name}")
            
    # 2. 驗證「待釐清問題」的項目數量是否介於 2 ~ 10 個之間
    # 我們抓取「待釐清問題」或「Open Questions」區段後方的清單項目
    try:
        # 尋找待釐清問題區段的起始位置
        match = re.search(r"待釐清問題|Open Questions", file_content, re.IGNORECASE)
        if match:
            start_index = match.end()
            # 取得該區段後的文字（直到下一個大標題或結尾）
            remaining_content = file_content[start_index:]
            next_section = re.search(r"\n#", remaining_content)
            section_text = remaining_content[:next_section.start()] if next_section else remaining_content
            
            # 計算該區段內部的 bullet points/checkbox 數量 (- [ ], -, *, 1.)
            items = re.findall(r"^\s*[-*+]\s+.*|^\s*\d+\.\s+.*", section_text, re.MULTILINE)
            # 過濾掉空白項目或純註解項目
            valid_items = [item for item in items if not re.match(r"^\s*[-*+]\s+\[\s*\]\s*$", item)]
            
            log_diagnostic(f"偵測到待釐清問題數量: {len(valid_items)}")
            if len(valid_items) < 2:
                errors.append(f"待釐清問題過少。當前數量: {len(valid_items)} 個（規範要求至少 2 個，最多 10 個）")
            elif len(valid_items) > 10:
                errors.append(f"待釐清問題過多。當前數量: {len(valid_items)} 個（規範要求至少 2 個，最多 10 個）")
        else:
            errors.append("無法驗證待釐清問題數量，因為找不到該區段。")
    except Exception as e:
        log_diagnostic(f"解析待釐清問題數量時出錯: {str(e)}")
        errors.append(f"解析問題數量失敗: {str(e)}")

    return errors

def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="需求釐清報告靜態完整性驗證工具 (AI 專用非互動式)。",
        epilog="使用範例: uv run validate-requirements.py -i report.md"
    )
    parser.add_argument(
        "-i", "--input",
        required=True,
        help="待驗證的需求釐清報告 Markdown 檔案路徑。"
    )
    return parser.parse_args()

def main() -> None:
    try:
        args = parse_args()
        
        if not os.path.exists(args.input):
            log_diagnostic(f"[錯誤] 檔案不存在: {args.input}")
            result = {
                "status": "error",
                "error_message": f"檔案不存在: {args.input}"
            }
            print(json.dumps(result, indent=2))
            sys.exit(1)
            
        log_diagnostic(f"開始驗證檔案: {args.input}")
        
        with open(args.input, "r", encoding="utf-8", errors="ignore") as f:
            content = f.read()
            
        errors = validate_markdown(content)
        
        result: Dict[str, Any] = {}
        if not errors:
            log_diagnostic("驗證成功！報告完全符合規格。")
            result["status"] = "success"
            result["errors"] = []
            print(json.dumps(result, indent=2))
            sys.exit(0)
        else:
            log_diagnostic(f"驗證失敗，發現 {len(errors)} 個問題。")
            result["status"] = "fail"
            result["errors"] = errors
            print(json.dumps(result, indent=2))
            sys.exit(1)
            
    except Exception as e:
        log_diagnostic(f"[致命錯誤] 執行失敗: {str(e)}")
        error_result = {
            "status": "error",
            "error_message": str(e)
        }
        print(json.dumps(error_result, indent=2))
        sys.exit(1)

if __name__ == "__main__":
    main()
