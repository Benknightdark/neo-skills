/**
 * Shared utilities for agent skill installers.
 *
 * 新增 AI agent 只需兩步：
 * 1. 在 AGENTS 加入設定
 * 2. 建立 bin/install-{key}-skills.js（複製任一現有檔案，改 named export 即可）
 */
import { realpathSync } from 'node:fs';
import { cp, mkdir, access } from 'node:fs/promises';
import { join, resolve, dirname, basename } from 'node:path';
import { homedir } from 'node:os';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packageRoot = resolve(__dirname, '..');
const sourceDir = join(packageRoot, 'skills');

/**
 * Agent 設定中心 — 所有 agent 的安裝參數集中管理於此。
 * key 須與檔名 install-{key}-skills.js 一致。
 */
export const AGENTS = {
  claude: {
    name: 'Claude',
    targetSubDir: '.claude/skills',
    hint: '請確保您的 Claude Desktop 或相關插件已指向此目錄。',
  },
  copilot: {
    name: 'Copilot',
    targetSubDir: '.copilot/skills',
    hint: '請確保您的 GitHub Copilot CLI 已指向此目錄。',
  },
  // gemini: {
  //   name: 'Gemini',
  //   targetSubDir: '.gemini/skills',
  //   hint: '請確保您的 Gemini CLI 已指向此目錄。',
  // },
};

/**
 * 從檔名解析 agent key: install-{key}-skills.js → key
 */
function extractAgentKey(importMetaUrl) {
  const filename = basename(fileURLToPath(importMetaUrl), '.js');
  const match = filename.match(/^install-(.+)-skills$/);
  if (!match) throw new Error(`無法從檔名 "${filename}" 解析 agent key`);
  return match[1];
}

/**
 * 根據 agent config 建立 installer 函式
 */
export function createInstaller({ name: agentName, targetSubDir, hint }) {
  return async function install() {
    console.log(`🚀 [${agentName}] 開始同步 Neo Skills...`);

    try {
      await access(sourceDir);
    } catch {
      const msg = `在 ${sourceDir} 找不到來源技能目錄。`;
      console.error(`❌ 錯誤: ${msg}`);
      return { success: false, message: msg };
    }

    const targetSkillsDir = join(homedir(), targetSubDir);

    console.log(`📁 來源路徑: ${sourceDir}`);
    console.log(`🎯 目標路徑: ${targetSkillsDir}`);

    await mkdir(targetSkillsDir, { recursive: true });

    let copyCount = 0;
    await cp(sourceDir, targetSkillsDir, {
      recursive: true,
      force: true,
      filter: (src) => {
        const relativePath = src.replace(sourceDir, '');
        const isIgnored = relativePath.includes('node_modules') || relativePath.includes('.git');
        if (!isIgnored) { copyCount++; return true; }
        return false;
      }
    });

    if (copyCount === 0) {
      console.warn('⚠️ 警告: 沒有任何檔案被複製。請檢查來源目錄是否正確。');
      return { success: true, message: '沒有任何檔案被複製' };
    }

    const msg = `已同步 ${copyCount} 個檔案/資料夾至 ${targetSubDir}`;
    console.log(`✅ [${agentName}] 安裝成功！${msg}`);
    if (hint) console.log(`💡 提示: ${hint}`);
    return { success: true, message: msg };
  };
}

/**
 * 從呼叫端的檔名自動解析 agent，建立對應的 installer。
 * @param {string} importMetaUrl - 呼叫端的 import.meta.url
 */
export function createInstallerFromFile(importMetaUrl) {
  const key = extractAgentKey(importMetaUrl);
  const config = AGENTS[key];
  if (!config) throw new Error(`未知的 agent: "${key}"。請在 _utils.js 的 AGENTS 中註冊。`);
  return createInstaller(config);
}

/**
 * 當腳本被直接執行時（非 import），自動呼叫 installer。
 * Agent 名稱從檔名自動推導。
 * @param {() => Promise<{ success: boolean, message: string }>} installFn
 * @param {string} callerUrl - 呼叫端的 import.meta.url
 */
export function runAsMain(installFn, callerUrl) {
  const callerPath = fileURLToPath(callerUrl);
  const argvPath = process.argv[1];
  const isMain = Boolean(argvPath) && (
    resolve(argvPath) === resolve(callerPath) ||
    realpathSync.native(resolve(argvPath)) === realpathSync.native(resolve(callerPath))
  );
  if (!isMain) return;

  const key = extractAgentKey(callerUrl);
  const agentName = AGENTS[key]?.name || key;

  process.on('uncaughtException', (err) => {
    console.error('💥 [Fatal Error]:', err);
    process.exit(1);
  });
  process.on('unhandledRejection', (reason) => {
    console.error('💥 [Unhandled Rejection]:', reason);
    process.exit(1);
  });

  installFn().then((result) => {
    if (!result.success) process.exit(1);
  }).catch((error) => {
    console.error(`❌ [${agentName}] 安裝失敗:`, error.message || error);
    process.exit(1);
  });
}
