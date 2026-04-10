/**
 * Shared utilities for agent skill installers.
 */
import { cp, mkdir, access } from 'node:fs/promises';
import { join, resolve, dirname } from 'node:path';
import { homedir } from 'node:os';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(__dirname, '..');
const sourceDir = join(packageRoot, 'skills');

/**
 * Agent 設定中心 — 所有 agent 的安裝參數集中管理於此。
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
    instructionFile: {
      homePath: '.claude/CLAUDE.md',
      projectPath: 'CLAUDE.md',
    },
    hint: '請確保您的 Claude Desktop 或相關插件已指向此目錄。',
  },
  copilot: {
    name: 'Copilot',
    homePath: '.copilot/skills',
    projectPath: '.github/skills',
    instructionFile: {
      homePath: '.copilot/copilot-instructions.md',
      projectPath: '.github/copilot-instructions.md',
    },
    hint: '請確保您的 GitHub Copilot CLI 已指向此目錄。',
  },
  codex: {
    name: 'Codex',
    homePath: '.codex/skills',
    instructionFile: {
      homePath: '.codex/AGENTS.md',
      projectPath: 'AGENTS.md',
    },
    hint: '請確保您的 Codex CLI 已指向此目錄。',
  },
};

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
 *   預設:                          ~/.copilot/skills              （homedir + homePath）
 *   --project-path /my/project:   /my/project/.github/skills     （projectPath + projectPath）
 *
 * @param {object} config - AGENTS 中的 agent 設定物件
 * @param {string} [targetPath] - 使用者透過 --project-path 指定的自訂根目錄
 */
export function createInstaller({ name: agentName, homePath, projectPath, hint }, cliBasePath) {
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
    const baseDir = cliBasePath ? resolve(cliBasePath) : homedir();
    // 子目錄：專案層級有獨立路徑時採用 projectPath，否則用預設的 homePath
    const subDir = cliBasePath && projectPath ? projectPath : homePath;
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

    const displayPath = cliBasePath || homePath;
    const msg = `已同步 ${copyCount} 個檔案/資料夾至 ${displayPath}`;
    console.log(`✅ [${agentName}] 安裝成功！${msg}`);
    if (hint) console.log(`💡 提示: ${hint}`);
    return { success: true, message: msg };
  };
}
