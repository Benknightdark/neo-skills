#!/usr/bin/env node
/**
 * Neo Skills — 系統提示詞安裝程式
 *
 * 用法：
 *   install-system-instructions --instructions technical-co-founder
 *   install-system-instructions --ai-agent claude --instructions technical-co-founder
 *   install-system-instructions --ai-agent copilot --instructions technical-co-founder --project-path .
 *
 * 參數：
 *   --ai-agent <name>         指定目標 AI Agent（可用值見 _utils.js 的 AGENTS）。
 *                              省略時安裝至全部已註冊 agent。
 *   --instructions <key>      指定要安裝的系統提示詞（可用值見 _system-instructions.js 的 INSTRUCTIONS）。必填。
 *   --project-path <path>     指定專案根目錄作為安裝基底（取代 $HOME）。省略時安裝至全域路徑。
 */
import { readFile, writeFile, mkdir, access } from 'node:fs/promises';
import { join, resolve, dirname } from 'node:path';
import { homedir } from 'node:os';

import { AGENTS } from './_utils.js';
import { INSTRUCTIONS } from './_system-instructions.js';
import { setupGlobalErrorHandlers, parseCliArgs } from './_cli-utils.js';

setupGlobalErrorHandlers();

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

/**
 * 對單一 agent 執行系統提示詞安裝。
 *
 * @param {string} agentKey - AGENTS 中的 key
 * @param {object} agentConfig - AGENTS[agentKey]
 * @param {string} instructionsKey - INSTRUCTIONS 中的 key
 * @param {object} instruction - INSTRUCTIONS[instructionsKey]
 * @param {string | undefined} projectPath - 使用者指定的專案路徑
 * @returns {Promise<{success: boolean, message: string}>}
 */
async function installForAgent(agentKey, agentConfig, instructionsKey, instruction, projectPath) {
  if (!agentConfig.instructionFile) {
    const msg = `agent "${agentKey}" 未設定 instructionFile，跳過。`;
    console.warn(`⚠️ ${msg}`);
    return { success: true, message: msg };
  }

  const { instructionFile } = agentConfig;
  const baseDir = projectPath ? resolve(projectPath) : homedir();
  const subPath = projectPath && instructionFile.projectPath
    ? instructionFile.projectPath
    : instructionFile.homePath;
  const targetFile = join(baseDir, subPath);

  console.log(`🚀 [${agentConfig.name}] 開始安裝系統提示詞: ${instruction.name}`);
  console.log(`🎯 目標檔案: ${targetFile}`);

  const wrappedContent = wrapContent(instructionsKey, instruction.content);

  let fileExists = false;
  try {
    await access(targetFile);
    fileExists = true;
  } catch {
    // 檔案不存在，稍後建立
  }

  if (fileExists) {
    const existing = await readFile(targetFile, 'utf8');

    if (existing.includes(startMarker(instructionsKey))) {
      const msg = `指導檔中已包含 "${instruction.name}" 提示詞，跳過安裝。`;
      console.log(`⏭️  ${msg}`);
      return { success: true, message: msg };
    }

    const newContent = existing.trimEnd() + '\n\n' + wrappedContent + '\n';
    await writeFile(targetFile, newContent, 'utf8');
    const msg = `已將 "${instruction.name}" 附加至既有指導檔。`;
    console.log(`✅ [${agentConfig.name}] ${msg}`);
    return { success: true, message: msg };
  }

  await mkdir(dirname(targetFile), { recursive: true });
  await writeFile(targetFile, wrappedContent + '\n', 'utf8');
  const msg = `已建立指導檔並寫入 "${instruction.name}" 提示詞。`;
  console.log(`✅ [${agentConfig.name}] ${msg}`);
  return { success: true, message: msg };
}

async function main() {
  const args = parseCliArgs();
  const agentKey = args['ai-agent'];
  const projectPath = args['project-path'];
  const instructionsKey = args['instructions'];

  // ── 驗證 --instructions（兩種模式皆需要）──
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

  // ── 模式一：指定單一 agent ──
  if (agentKey) {
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

    const result = await installForAgent(agentKey, agentConfig, instructionsKey, instruction, projectPath);
    if (!result.success) process.exit(1);
    return;
  }

  // ── 模式二：安裝至全部 agent ──
  console.log('╔══════════════════════════════════════════╗');
  console.log('║   🧠 Neo Skills — 系統提示詞安裝程式    ║');
  console.log('╚══════════════════════════════════════════╝');
  console.log('');

  const results = [];

  for (const [key, config] of Object.entries(AGENTS)) {
    console.log(`━━━ 正在安裝: ${config.name} ━━━`);
    try {
      const result = await installForAgent(key, config, instructionsKey, instruction, projectPath);
      results.push({ name: config.name, ...result });
    } catch (error) {
      console.error(`❌ [${config.name}] 安裝失敗:`, error.message || error);
      results.push({ name: config.name, success: false, message: error.message || String(error) });
    }
    console.log('');
  }

  // 彙總報告
  console.log('══════════════════════════════════════════');
  console.log('📊 安裝結果彙總:');
  const failed = results.filter(r => !r.success);

  for (const r of results) {
    console.log(`  ${r.success ? '✅' : '❌'} ${r.name}: ${r.message}`);
  }

  console.log('');
  console.log(`成功: ${results.length - failed.length} / ${results.length}`);

  if (failed.length > 0) {
    console.log(`失敗: ${failed.length} — ${failed.map(r => r.name).join(', ')}`);
    process.exit(1);
  }

  console.log('🎉 全部安裝完成！');
}

main();
