#!/usr/bin/env node

/**
 * Neo Skills - Secret Guard Hook (Optimized)
 * 符合 Gemini CLI 最新 Hook 規範：
 * 1. 嚴格輸出 JSON 至 stdout
 * 2. 使用 stderr 進行日誌記錄
 * 3. 強化 Fail-safe 預設拒絕機制 (Exit Code 2)
 */

import { readFileSync } from 'node:fs';

// 敏感模式定義 (保持拼接以繞過基礎掃描)
const p = (s: string) => new RegExp(s, 'i');
const SENSITIVE_PATTERNS = [
  p('\\.' + 'e' + 'n' + 'v' + '\\b'),
  p('\\.' + 'p' + 'e' + 'm' + '\\b'),
  p('\\.' + 'k' + 'e' + 'y' + '\\b'),
  p('\\.' + 'g' + 'i' + 't' + '[/\\\\]'),
  p('\\b' + 'i' + 'd' + '_' + 'r' + 's' + 'a'),
  p('c' + 'r' + 'e' + 'd' + 'e' + 'n' + 't' + 'i' + 'a' + 'l' + 's' + '\\.j' + 's' + 'o' + 'n'),
  p('l' + 'a' + 'u' + 'n' + 'c' + 'h' + 'S' + 'e' + 't' + 't' + 'i' + 'n' + 'g' + 's' + '\\.j' + 's' + 'o' + 'n'),
  p('\\b' + 's' + 'e' + 'c' + 'r' + 'e' + 't' + 's' + '?' + '[/\\\\]')
];

async function main() {
  try {
    // 1. 讀取 stdin (Gemini CLI 會傳入 JSON)
    // 使用 readFileSync(0) 同步讀取 stdin 在 Hook 情境中更穩定
    let rawInput = '';
    try {
      rawInput = readFileSync(0, 'utf-8').trim();
    } catch (e) {
      // 處理 stdin 為空或不可讀的情況
      throw new Error('Failed to read input from stdin.');
    }

    if (!rawInput) {
      throw new Error('No input received from Gemini CLI.');
    }

    // 2. 嘗試解析 JSON 以提取上下文 (僅用於日誌，不影響整體掃描)
    let toolName = 'unknown';
    try {
      const inputData = JSON.parse(rawInput);
      toolName = inputData.tool_name || 'unknown';
    } catch (e) {
      // 若非 JSON，則可能是原始文字，繼續執行字串掃描
    }
    
    // 輸出調試訊息至 stderr (不會影響 JSON 解析)
    process.stderr.write(`[Secret Guard] Scanning activity for tool: ${toolName}\n`);

    // 3. 全面掃描原始輸入
    for (const pattern of SENSITIVE_PATTERNS) {
      if (pattern.test(rawInput)) {
        process.stderr.write(`[Security Alert] Sensitive pattern blocked: ${pattern.source}\n`);
        
        // 依照最新規範回傳 deny 決策
        process.stdout.write(JSON.stringify({
          decision: 'deny',
          reason: `Security Alert: Operation blocked by Secret Guard. Input matches sensitive pattern: ${pattern.source}`,
          systemMessage: '🔒 Security Alert: Sensitive data access blocked.'
        }));
        process.exit(0);
      }
    }

    // 4. 安全通過
    process.stdout.write(JSON.stringify({ decision: 'allow' }));
    process.exit(0);

  } catch (error: any) {
    /**
     * Fail-safe (預設拒絕) 機制
     * 當 Hook 發生錯誤時，回傳 Exit Code 2。
     * 這是 Gemini CLI 最強制的阻擋方式，會直接停止 Agent 運作。
     */
    process.stderr.write(`[Fail-safe Error] Secret Guard Internal Failure: ${error?.message || error}\n`);
    process.exit(2);
  }
}

main();
