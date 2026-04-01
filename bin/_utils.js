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
 *
 * 各欄位說明：
 *   name        — 顯示用名稱，用於 CLI 輸出的 log 標籤。
 *   homePath    — 全域安裝路徑（相對於 $HOME）。未指定 --project-path 時使用。
 *   projectPath — （選填）專案安裝路徑（相對於 --project-path）。
 *                  指定 --project-path 且此欄位有值時，優先使用此路徑取代 homePath。
 *                  例如 Copilot：全域 ~/.copilot/skills，專案 <project>/.github/skills。
 *   hint        — 安裝成功後顯示的提示訊息。
 */
export const AGENTS = {
  claude: {
    name: 'Claude',
    homePath: '.claude/skills',
    hint: '請確保您的 Claude Desktop 或相關插件已指向此目錄。',
  },
  copilot: {
    name: 'Copilot',
    homePath: '.copilot/skills',
    projectPath: '.github/skills',
    hint: '請確保您的 GitHub Copilot CLI 已指向此目錄。',
  },
  codex: {
    name: 'Codex',
    homePath: '.codex/skills',
    hint: '請確保您的 Codex CLI 已指向此目錄。',
  },
  // gemini: {
  //   name: 'Gemini',
  //   homePath: '.gemini/skills/neo-skills',
  //   hint: '請確保您的 Gemini CLI 已指向此目錄。',
  // },
};

/**
 * 從 CLI 參數解析 --project-path 值
 * @returns {string | undefined}
 */
function parseProjectPath() {
  const idx = process.argv.indexOf('--project-path');
  if (idx === -1 || idx + 1 >= process.argv.length) return undefined;
  return process.argv[idx + 1];
}

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
 * 根據 agent config 建立 installer 函式。
 *
 * 路徑解析邏輯：
 *   1. 決定根目錄 (baseDir)：
 *      - 有 --project-path → 使用者指定的絕對路徑
 *      - 無 --project-path → $HOME
 *   2. 決定子目錄 (subDir)：
 *      - 有 --project-path 且 config 定義了 projectPath → 使用 projectPath
 *      - 其餘情況 → 使用 homePath
 *   3. 最終安裝路徑 = baseDir + subDir
 *
 * 範例（以 Copilot 為例）：
 *   預設:         ~/.copilot/skills     （homedir + homePath）
 *   --project-path /my/project:  /my/project/.github/skills （targetPath + projectPath）
 *
 * @param {object} config - AGENTS 中的 agent 設定物件
 * @param {string} [targetPath] - 使用者透過 --project-path 指定的自訂根目錄
 */
export function createInstaller({ name: agentName, homePath, projectPath, hint }, targetPath) {
  return async function install() {
    console.log(`🚀 [${agentName}] 開始同步 Neo Skills...`);

    try {
      await access(sourceDir);
    } catch {
      const msg = `在 ${sourceDir} 找不到來源技能目錄。`;
      console.error(`❌ 錯誤: ${msg}`);
      return { success: false, message: msg };
    }

    // 根目錄：--project-path 優先，否則 $HOME
    const baseDir = targetPath ? resolve(targetPath) : homedir();
    // 子目錄：專案層級有獨立路徑時採用 projectPath，否則用預設的 homePath
    const subDir = targetPath && projectPath ? projectPath : homePath;
    const targetSkillsDir = join(baseDir, subDir);

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

    const displayPath = targetPath || homePath;
    const msg = `已同步 ${copyCount} 個檔案/資料夾至 ${displayPath}`;
    console.log(`✅ [${agentName}] 安裝成功！${msg}`);
    if (hint) console.log(`💡 提示: ${hint}`);
    return { success: true, message: msg };
  };
}

/**
 * 從呼叫端的檔名自動解析 agent，建立對應的 installer。
 * @param {string} importMetaUrl - 呼叫端的 import.meta.url
 * @param {string} [targetPath] - 使用者透過 --project-path 指定的自訂路徑
 */
export function createInstallerFromFile(importMetaUrl, targetPath) {
  const key = extractAgentKey(importMetaUrl);
  const config = AGENTS[key];
  if (!config) throw new Error(`未知的 agent: "${key}"。請在 _utils.js 的 AGENTS 中註冊。`);
  return createInstaller(config, targetPath);
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

  const targetPath = parseProjectPath();
  const actualInstallFn = targetPath
    ? createInstallerFromFile(callerUrl, targetPath)
    : installFn;

  actualInstallFn().then((result) => {
    if (!result.success) process.exit(1);
  }).catch((error) => {
    console.error(`❌ [${agentName}] 安裝失敗:`, error.message || error);
    process.exit(1);
  });
}
