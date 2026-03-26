#!/usr/bin/env node

/**
 * [Claude] Neo Skills 一鍵安裝腳本
 * 此腳本採用 CommonJS 格式以確保 npx 相容性，且完全不依賴外部 package。
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

console.log('🏁 [Neo Skills] 啟動安裝程序...');

// 捕捉錯誤
process.on('uncaughtException', (err) => {
  console.error('💥 [Fatal Error]:', err.message);
  process.exit(1);
});

async function run() {
  try {
    // 取得路徑
    const packageRoot = path.resolve(__dirname, '..');
    const sourceDir = path.join(packageRoot, 'skills');
    const targetBaseDir = path.join(os.homedir(), '.claude');
    const targetSkillsDir = path.join(targetBaseDir, 'skills');

    console.log(`📁 檢查來源: ${sourceDir}`);
    
    if (!fs.existsSync(sourceDir)) {
      console.error('❌ 錯誤: 找不到技能來源資料夾。');
      process.exit(1);
    }

    // 建立目標目錄
    console.log(`🎯 目標目錄: ${targetSkillsDir}`);
    if (!fs.existsSync(targetSkillsDir)) {
      fs.mkdirSync(targetSkillsDir, { recursive: true });
    }

    // 複製檔案 (使用 Node 內建遞迴複製)
    console.log('🚀 開始複製技能檔案...');
    fs.cpSync(sourceDir, targetSkillsDir, { 
      recursive: true, 
      force: true,
      filter: (src) => !src.includes('node_modules') && !src.includes('.git')
    });

    console.log('✅ [Claude] 安裝成功！技能已同步至 ~/.claude/skills');
    console.log('💡 提示: 您現在可以使用 Claude 存取這些技能了。');

  } catch (err) {
    console.error('❌ [Error]:', err.message);
    process.exit(1);
  }
}

run();
