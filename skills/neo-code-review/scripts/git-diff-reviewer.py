#!/usr/bin/env python3
# /// script
# requires-python = ">=3.11"
# dependencies = []
# ///

"""
AI Agentic Git Diff & Code Reader Tool (Non-interactive)
專為 AI Agent 設計的非互動式程式碼變更與內容擷取腳本。

設計要點：
1. 嚴禁任何互動式提示詞 (input(), confirm())。
2. 診斷日誌、錯誤訊息一律寫入 sys.stderr。
3. 處理結果一律以乾淨的 JSON 結構輸出至 sys.stdout (或寫入指定 --output 檔案)。
"""

import sys
import argparse
import subprocess
import json
import os
from typing import Dict, List, Any

def log_diagnostic(message: str) -> None:
    """將診斷日誌印至 stderr，避免污染 stdout 的 JSON。"""
    print(f"[LOG] {message}", file=sys.stderr)

def run_command(cmd: List[str]) -> str:
    """執行 shell 命令並返回 stdout，出錯時拋出異常。"""
    try:
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            check=True
        )
        return result.stdout
    except subprocess.CalledProcessError as e:
        error_msg = f"命令執行失敗: {' '.join(cmd)}\nStderr: {e.stderr}"
        raise RuntimeError(error_msg)

def get_git_diff(staged_only: bool = False, commit_range: str = None) -> str:
    """根據參數獲取 git diff 內容。"""
    cmd = ["git", "diff"]
    if commit_range:
        cmd.append(commit_range)
    elif staged_only:
        cmd.append("--cached")
    
    log_diagnostic(f"執行 Git 命令: {' '.join(cmd)}")
    return run_command(cmd)

def read_files_content(paths: List[str]) -> List[Dict[str, str]]:
    """讀取指定檔案的完整內容。"""
    contents = []
    for path in paths:
        if not os.path.exists(path):
            log_diagnostic(f"[警告] 檔案不存在，跳過: {path}")
            continue
        if os.path.isdir(path):
            log_diagnostic(f"[警告] 路徑是目錄，跳過: {path}")
            continue
            
        try:
            log_diagnostic(f"讀取檔案內容: {path}")
            with open(path, "r", encoding="utf-8", errors="ignore") as f:
                contents.append({
                    "path": path,
                    "content": f.read()
                })
        except Exception as e:
            log_diagnostic(f"[錯誤] 無法讀取檔案 {path}: {str(e)}")
            
    return contents

def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="專為 AI Agent 設計的非互動式代碼變更與內容擷取工具。",
        epilog="使用範例: uv run git-diff-reviewer.py --staged"
    )
    parser.add_argument(
        "-i", "--input",
        nargs="*",
        help="選填。指定審查的檔案路徑列表。若未指定，將預設讀取 Git 變更。"
    )
    parser.add_argument(
        "--staged",
        action="store_true",
        help="僅讀取已暫存 (Staged) 的 Git 變更。"
    )
    parser.add_argument(
        "--commit",
        help="選填。指定 Commit 雜湊值或範圍（例如 HEAD~1..HEAD 或 commit_sha），獲取該範圍內的變更。"
    )
    parser.add_argument(
        "-o", "--output",
        help="選填。將 JSON 結果寫入指定檔案，而非輸出至 stdout。"
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="模擬執行模式，僅在 stderr 輸出分析計畫，不輸出最終的代碼內容。"
    )
    return parser.parse_args()

def main() -> None:
    try:
        args = parse_args()
        
        # 準備回傳的結構化資料
        result: Dict[str, Any] = {
            "mode": "git-diff",
            "diff": "",
            "files": [],
            "status": "success"
        }
        
        # 1. 如果指定了具體檔案
        if args.input:
            result["mode"] = "specific-files"
            log_diagnostic(f"指定檔案審查模式。目標檔案數: {len(args.input)}")
            if not args.dry_run:
                result["files"] = read_files_content(args.input)
        
        # 2. 否則，預設使用 Git 變更模式
        else:
            result["mode"] = "git-diff"
            log_diagnostic("未指定特定檔案，進入 Git 變更審查模式。")
            
            # 先檢查是否為 git 專案
            try:
                run_command(["git", "rev-parse", "--is-inside-work-tree"])
            except Exception:
                result["status"] = "error"
                result["error_message"] = "當前目錄非 Git 專案，且未指定輸入檔案。"
                print(json.dumps(result, indent=2))
                log_diagnostic("[錯誤] 當前目錄非 Git 專案。")
                sys.exit(1)
                
            if not args.dry_run:
                diff_content = get_git_diff(staged_only=args.staged, commit_range=args.commit)
                if not diff_content.strip():
                    log_diagnostic("未偵測到任何 Git 變更（diff 為空）。")
                    result["status"] = "empty"
                else:
                    result["diff"] = diff_content
                    
        # 3. 輸出結果
        output_str = json.dumps(result, indent=2)
        if args.output:
            with open(args.output, "w", encoding="utf-8") as f:
                f.write(output_str)
            log_diagnostic(f"已成功將代碼變更 JSON 寫入至: {args.output}")
        else:
            # 乾淨地將結果印在 stdout
            print(output_str)
            
        sys.exit(0)
        
    except Exception as e:
        log_diagnostic(f"[致命錯誤] 執行失敗: {str(e)}")
        # 確保即使出錯也輸出 JSON 錯誤，使調用端不易崩潰
        error_result = {
            "status": "error",
            "error_message": str(e)
        }
        print(json.dumps(error_result, indent=2))
        sys.exit(1)

if __name__ == "__main__":
    main()
