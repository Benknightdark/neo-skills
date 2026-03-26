#!/usr/bin/env node
import { cp, mkdir, access } from 'node:fs/promises';
import { join, resolve, dirname } from 'node:path';
import { homedir } from 'node:os';
import { fileURLToPath } from 'node:url';

// 立即輸出日誌以確認腳本已啟動
console.log('🏁 [Debug] 腳本已啟動...');

// 捕捉全域錯誤
process.on('uncaughtException', (err) => {
  console.error('💥 [Fatal Error]:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 [Unhandled Rejection]:', reason);
  process.exit(1);
});

// 取得當前檔案路徑
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function installClaudeSkills() {
  try {
    // 1. 定義來源目錄: 腳本所在目錄的上一層的 skills 資料夾
    // 當透過 npx 執行時，它會指向臨時下載的 package 內容
    const packageRoot = resolve(__dirname, '..');
    const sourceDir = join(packageRoot, 'skills');
    
    // 2. 定義目標目錄: ~/.claude/skills (跨平台自動處理)
    const targetBaseDir = join(homedir(), '.claude');
    const targetSkillsDir = join(targetBaseDir, 'skills');

    console.log('🚀 [Claude] 開始同步 Neo Skills...');
    
    // 檢查來源是否存在
    try {
      await access(sourceDir);
    } catch {
      console.error(`❌ 錯誤: 在 ${sourceDir} 找不到來源技能目錄。`);
      process.exit(1);
    }

    console.log(`📁 來源路徑: ${sourceDir}`);
    console.log(`🎯 目標路徑: ${targetSkillsDir}`);

    // 3. 確保目標目錄存在 (recursive: true 會自動建立多層目錄)
    await mkdir(targetSkillsDir, { recursive: true });

    // 4. 執行複製
    await cp(sourceDir, targetSkillsDir, { 
      recursive: true, 
      force: true,
      // 過濾掉不必要的開發檔案
      filter: (src) => {
        const isIgnored = src.includes('node_modules') || src.includes('.git');
        return !isIgnored;
      }
    });

    console.log('✅ [Claude] 安裝成功！技能已同步至 .claude/skills');
    console.log('💡 提示: 請確保您的 Claude Desktop 或相關插件已指向此目錄。');

  } catch (error) {
    console.error('❌ [Claude] 安裝失敗:', error.message || error);
    process.exit(1);
  }
}

installClaudeSkills();
