#!/usr/bin/env python3
# /// script
# requires-python = ">=3.11"
# dependencies = []
# ///

"""
Agent Skill Structure and Syntax Validator (Non-interactive)
專為 AI Agent 與 CI 設計的技能模組結構與 Frontmatter 靜態校驗工具。

設計要點：
1. 嚴禁任何互動式提示詞 (input(), confirm())。
2. 診斷日誌、錯誤訊息一律寫入 sys.stderr。
3. 處理結果一律以乾淨的 JSON 結構輸出至 sys.stdout。
"""

import sys
import argparse
import os
import json
import re
from typing import Dict, List, Any

SUPPORTED_FRONTMATTER_KEYS = {
    "name",
    "description",
    "license",
    "compatibility",
    "metadata",
    "allowed-tools",
}

TRIGGER_DESCRIPTION_PATTERNS = [
    re.compile(r"\bUse this skill when\b", re.IGNORECASE),
    re.compile(r"\bUse when\b", re.IGNORECASE),
    re.compile(r"當.+使用"),
    re.compile(r"使用.+技能"),
    re.compile(r"用於"),
]

def log_diagnostic(message: str) -> None:
    """將診斷日誌印至 stderr，避免污染 stdout 的 JSON。"""
    print(f"[LOG] {message}", file=sys.stderr)

def parse_yaml_frontmatter(content: str) -> tuple[Dict[str, str], List[str], List[str]]:
    """解析 Markdown 中的 YAML Frontmatter，回傳 metadata 字典與解析錯誤清單。"""
    errors = []
    metadata = {}
    top_level_keys = []
    
    # 檢查是否以 --- 開始
    if not content.startswith("---"):
        errors.append("檔案開頭缺少 '---' YAML delimiters 定界符。")
        return metadata, top_level_keys, errors
        
    # 尋找第二個 ---
    parts = content.split("---", 2)
    if len(parts) < 3:
        errors.append("無法解析 Frontmatter，因為找不到結尾的 '---'。")
        return metadata, top_level_keys, errors
        
    frontmatter_text = parts[1]

    lines = frontmatter_text.splitlines()
    line_index = 0

    # 逐行解析頂層鍵值對 (簡易 YAML 解析器，避免引進外部 yaml 庫)
    while line_index < len(lines):
        raw_line = lines[line_index]
        line_num = line_index + 2
        line = raw_line.strip()
        if not line or line.startswith("#"):
            line_index += 1
            continue

        is_indented = raw_line.startswith(" ") or raw_line.startswith("\t")
        if is_indented:
            # 支援 metadata 等巢狀設定；巢狀欄位不是 frontmatter 頂層欄位。
            line_index += 1
            continue

        if ":" not in line:
            errors.append(f"第 {line_num} 行：YAML 語法錯誤，缺少冒號分界符 ': '。")
            line_index += 1
            continue

        key, value = line.split(":", 1)
        key = key.strip()
        value = value.strip()
        top_level_keys.append(key)
        
        # 處理多行定義符 > 或 |
        if value in (">", "|"):
            block_lines = []
            line_index += 1
            while line_index < len(lines):
                block_raw = lines[line_index]
                block_line = block_raw.strip()
                next_is_top_level_key = (
                    not block_raw.startswith((" ", "\t"))
                    and bool(re.match(r"^[A-Za-z0-9_-]+\s*:", block_raw))
                )
                if next_is_top_level_key:
                    break
                if block_line and not block_line.startswith("#"):
                    block_lines.append(block_line)
                line_index += 1
            metadata[key] = " ".join(block_lines)
            continue
        else:
            # 去除可能的引號
            if (value.startswith('"') and value.endswith('"')) or (value.startswith("'") and value.endswith("'")):
                value = value[1:-1]
            metadata[key] = value

        line_index += 1
            
    # 清理並合併各屬性的連續空白
    for k in metadata:
        metadata[k] = re.sub(r'\s+', ' ', metadata[k]).strip()
        
    return metadata, top_level_keys, errors

def validate_skill(skill_dir: str) -> List[str]:
    """針對單一技能目錄進行結構與 Frontmatter 驗證。"""
    errors = []
    skill_name = os.path.basename(skill_dir)
    skill_md_path = os.path.join(skill_dir, "SKILL.md")
    
    # 1. 驗證目錄名稱格式 (1-64字，小寫、數字與連字號，不以連字號開頭或結尾，無連續連字號)
    if not re.match(r"^[a-z0-9]+(-[a-z0-9]+)*$", skill_name) or len(skill_name) > 64:
        errors.append(f"目錄名稱 '{skill_name}' 不合規：長度須介於 1-64 字，且僅能包含小寫英文字母、數字與單個連字號 '-'。")
        
    # 2. 驗證是否存在 SKILL.md
    if not os.path.exists(skill_md_path):
        errors.append(f"技能目錄中缺少必填的 'SKILL.md' 檔案。")
        return errors # 缺少主檔案則無須繼續驗證內容
        
    # 3. 讀取並驗證 SKILL.md 內容
    try:
        with open(skill_md_path, "r", encoding="utf-8", errors="ignore") as f:
            content = f.read()
            
        metadata, top_level_keys, fm_errors = parse_yaml_frontmatter(content)
        if fm_errors:
            errors.extend(fm_errors)
            return errors # 語法錯誤則不再進行屬性比對

        unsupported_keys = sorted(set(top_level_keys) - SUPPORTED_FRONTMATTER_KEYS)
        if unsupported_keys:
            errors.append(
                "Frontmatter 含有非標準頂層屬性: "
                + ", ".join(unsupported_keys)
                + "。請將自訂資料放在 'metadata' 底下。"
            )
            
        # 4. 驗證必要屬性是否存在
        if "name" not in metadata or not metadata["name"]:
            errors.append("Frontmatter 中缺少必填屬性 'name'。")
        else:
            # name 規格檢查
            name_val = metadata["name"]
            if not re.match(r"^[a-z0-9]+(-[a-z0-9]+)*$", name_val) or len(name_val) > 64:
                errors.append(f"Frontmatter 'name' 屬性值 '{name_val}' 格式不合規。")
            # 必須與目錄名一致 (注意：有些 client 會使用 name 對應目錄，嚴格比對)
            # 有些技能可能 name 尾部帶有 -architect 但目錄沒有，或反過來，但官方要求 match the parent directory name
            # 這裡我們做嚴格檢索以落實 Discovery
            if name_val != skill_name:
                errors.append(f"Frontmatter 中的 'name' 值 ('{name_val}') 必須與其所在的父目錄名稱 ('{skill_name}') 完全一致。")
                
        if "description" not in metadata or not metadata["description"]:
            errors.append("Frontmatter 中缺少必填屬性 'description'。")
        else:
            desc_val = metadata["description"]
            if len(desc_val) > 1024:
                errors.append(f"Frontmatter 'description' 超過長度限制 1024 字元（目前為 {len(desc_val)} 字元）。")
            if len(desc_val) < 40:
                errors.append("Frontmatter 'description' 過短，應清楚描述技能的使用時機與觸發情境。")
            if not any(pattern.search(desc_val) for pattern in TRIGGER_DESCRIPTION_PATTERNS):
                errors.append("Frontmatter 'description' 不是觸發導向描述；請使用 'Use this skill when...' 或等價用語。")
                
    except Exception as e:
        errors.append(f"讀取或解析 'SKILL.md' 時發生未預期錯誤: {str(e)}")
        
    return errors

def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Neo Skills 技能語法與目錄結構自動化校驗工具 (AI/CI 專用)。",
        epilog="使用範例: python scripts/check-skills-syntax.py --dir skills"
    )
    parser.add_argument(
        "-d", "--dir",
        default="skills",
        help="待掃描的技能根目錄路徑，預設為 './skills'。"
    )
    return parser.parse_args()

def main() -> None:
    try:
        args = parse_args()
        
        if not os.path.exists(args.dir):
            log_diagnostic(f"[錯誤] 指定的技能目錄不存在: {args.dir}")
            result = {
                "status": "error",
                "error_message": f"指定的技能目錄不存在: {args.dir}"
            }
            print(json.dumps(result, indent=2, ensure_ascii=False))
            sys.exit(1)
            
        log_diagnostic(f"開始掃描技能目錄: {args.dir}")
        
        all_errors = {}
        total_skills = 0
        
        # 遍歷所有子目錄
        for item in os.listdir(args.dir):
            item_path = os.path.join(args.dir, item)
            if os.path.isdir(item_path):
                # 排除隱藏目錄
                if item.startswith("."):
                    continue
                    
                total_skills += 1
                log_diagnostic(f"發現技能模組: {item}")
                skill_errors = validate_skill(item_path)
                if skill_errors:
                    all_errors[item] = skill_errors
                    
        # 輸出結果
        result: Dict[str, Any] = {
            "total_scanned_skills": total_skills,
            "failed_skills_count": len(all_errors),
            "errors": all_errors,
            "status": "success" if not all_errors else "fail"
        }
        
        output_str = json.dumps(result, indent=2, ensure_ascii=False)
        print(output_str)
        
        if all_errors:
            log_diagnostic(f"校驗失敗：共有 {len(all_errors)} 個技能模組未通過驗證。")
            sys.exit(1)
        else:
            log_diagnostic(f"校驗成功！所有 {total_skills} 個技能模組結構均完全合法。")
            sys.exit(0)
            
    except Exception as e:
        log_diagnostic(f"[致命錯誤] 校驗程序執行失敗: {str(e)}")
        error_result = {
            "status": "error",
            "error_message": str(e)
        }
        print(json.dumps(error_result, indent=2, ensure_ascii=False))
        sys.exit(1)

if __name__ == "__main__":
    main()
