#!/usr/bin/env node
/**
 * Neo Skills — 系統提示詞安裝程式
 *
 * 用法：
 *   install-system-instructions --ai-agent claude --instructions technical-co-founder
 *   install-system-instructions --ai-agent copilot --instructions technical-co-founder --project-path .
 *
 * 參數：
 *   --ai-agent <name>         指定目標 AI Agent（可用值見 _utils.js 的 AGENTS）。必填。
 *   --instructions <key>      指定要安裝的系統提示詞（可用值見 _system-instructions.js 的 INSTRUCTIONS）。必填。
 *   --project-path <path>     指定專案根目錄作為安裝基底（取代 $HOME）。省略時安裝至全域路徑。
 */
import { readFile, writeFile, mkdir, access } from 'node:fs/promises';
import { join, resolve, dirname } from 'node:path';
import { homedir } from 'node:os';

import { AGENTS } from './_utils.js';
import { INSTRUCTIONS } from './_system-instructions.js';

/**
 * 從 process.argv 解析指定 flag 的值。
 * @param {string} flag
 * @returns {string | undefined}
 */
function parseArg(flag) {
  const idx = process.argv.indexOf(flag);
  if (idx === -1 || idx + 1 >= process.argv.length) return undefined;
  return process.argv[idx + 1];
}

/**
 * 產生提示詞的起始標記。
 * @param {string} key
 */
function startMarker(key) {
  return `<!-- neo-skills:system-instructions:${key} -->`;
}

/**
 * 產生提示詞的結束標記。
 * @param {string} key
 */
function endMarker(key) {
  return `<!-- /neo-skills:system-instructions:${key} -->`;
}

/**
 * 將提示詞包裹在起始/結束標記之間。
 * @param {string} key
 * @param {string} content
 */
function wrapContent(key, content) {
  return `${startMarker(key)}\n${content}\n${endMarker(key)}`;
}

// 全域錯誤攔截
process.on('uncaughtException', (err) => {
  console.error('💥 [Fatal Error]:', err);
  process.exit(1);
});
process.on('unhandledRejection', (reason) => {
  console.error('💥 [Unhandled Rejection]:', reason);
  process.exit(1);
});

async function main() {
  const agentKey = parseArg('--ai-agent');
  const projectPath = parseArg('--project-path');
  const instructionsKey = parseArg('--instructions');

  // ── 驗證 --ai-agent ──
  if (!agentKey) {
    const valid = Object.keys(AGENTS).join(', ');
    console.error(`❌ 缺少必填參數 --ai-agent。可用選項: ${valid}`);
    process.exit(1);
  }

  const agentConfig = AGENTS[agentKey];
  if (!agentConfig) {
    const valid = Object.keys(AGENTS).join(', ');
    console.error(`❌ 未知的 agent: "${agentKey}"。可用選項: ${valid}`);
    process.exit(1);
  }

  if (!agentConfig.instructionFile) {
    console.error(`❌ agent "${agentKey}" 未設定 instructionFile。`);
    process.exit(1);
  }

  // ── 驗證 --instructions ──
  if (!instructionsKey) {
    const valid = Object.keys(INSTRUCTIONS).join(', ');
    console.error(`❌ 缺少必填參數 --instructions。可用選項: ${valid}`);
    process.exit(1);
  }

  const instruction = INSTRUCTIONS[instructionsKey];
  if (!instruction) {
    const valid = Object.keys(INSTRUCTIONS).join(', ');
    console.error(`❌ 未知的 instructions: "${instructionsKey}"。可用選項: ${valid}`);
    process.exit(1);
  }

  // ── 決定指導檔路徑 ──
  const { instructionFile } = agentConfig;
  const baseDir = projectPath ? resolve(projectPath) : homedir();
  const subPath = projectPath && instructionFile.projectPath
    ? instructionFile.projectPath
    : instructionFile.homePath;
  const targetFile = join(baseDir, subPath);

  console.log(`🚀 [${agentConfig.name}] 開始安裝系統提示詞: ${instruction.name}`);
  console.log(`🎯 目標檔案: ${targetFile}`);

  // ── 組裝標記包裹的提示詞內容 ──
  const wrappedContent = wrapContent(instructionsKey, instruction.content);

  // ── 檢查指導檔是否已存在 ──
  let fileExists = false;
  try {
    await access(targetFile);
    fileExists = true;
  } catch {
    // 檔案不存在，稍後建立
  }

  if (fileExists) {
    // 讀取現有內容
    const existing = await readFile(targetFile, 'utf8');

    // 冪等性檢查：如果已包含相同提示詞的標記，則跳過
    if (existing.includes(startMarker(instructionsKey))) {
      console.log(`⏭️  指導檔中已包含 "${instruction.name}" 提示詞，跳過安裝。`);
      return;
    }

    // 附加至最下方
    const newContent = existing.trimEnd() + '\n\n' + wrappedContent + '\n';
    await writeFile(targetFile, newContent, 'utf8');
    console.log(`✅ [${agentConfig.name}] 已將 "${instruction.name}" 附加至既有指導檔。`);
  } else {
    // 建立目錄結構
    await mkdir(dirname(targetFile), { recursive: true });

    // 建立新檔案並寫入
    await writeFile(targetFile, wrappedContent + '\n', 'utf8');
    console.log(`✅ [${agentConfig.name}] 已建立指導檔並寫入 "${instruction.name}" 提示詞。`);
  }
}

main();
