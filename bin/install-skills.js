#!/usr/bin/env node
/**
 * Neo Skills — 全域技能安裝程式
 *
 * 用法：
 *   install-skills        安裝專案的技能至全域 Antigravity CLI 技能目錄 (~/.gemini/skills)
 */
import { cp, mkdir, access } from 'node:fs/promises';
import { join, resolve, dirname } from 'node:path';
import { homedir } from 'node:os';
import { fileURLToPath } from 'node:url';

import { setupGlobalErrorHandlers } from './_cli-utils.js';

setupGlobalErrorHandlers();

const __dirname = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(__dirname, '..');
const sourceDir = join(packageRoot, 'skills');

async function main() {
  console.log('╔══════════════════════════════════════════╗');
  console.log('║   🧠 Neo Skills — 全域技能安裝程式       ║');
  console.log('╚══════════════════════════════════════════╝');
  console.log('');

  try {
    await access(sourceDir);
  } catch {
    console.error(`❌ 錯誤: 找不到來源技能目錄 ${sourceDir}`);
    process.exit(1);
  }

  // 決定安裝目標路徑 (支援透過 TEST_HOME_DIR 覆寫以供測試)
  const home = process.env.TEST_HOME_DIR || homedir();
  const targetDir = join(home, '.gemini/antigravity-cli/skills');

  console.log(`🚀 開始同步 Neo Skills 至全域 Antigravity CLI...`);
  console.log(`📁 來源路徑: ${sourceDir}`);
  console.log(`🎯 目標路徑: ${targetDir}`);
  console.log('');

  try {
    await mkdir(targetDir, { recursive: true });

    let copyCount = 0;
    await cp(sourceDir, targetDir, {
      recursive: true,
      force: true,
      filter: (src) => {
        // 解析相對於來源目錄的相對路徑
        const relativePath = src.replace(sourceDir, '');
        
        // 忽略無關的隱藏檔案或特定資料夾
        const isIgnored = 
          relativePath.includes('node_modules') || 
          relativePath.includes('.git') ||
          relativePath.includes('dist') ||
          relativePath.includes('.antigravitycli') ||
          relativePath.includes('.agents') ||
          relativePath.includes('.DS_Store');
        
        if (!isIgnored) {
          copyCount++;
          return true;
        }
        return false;
      }
    });

    if (copyCount === 0) {
      console.warn('⚠️ 警告: 沒有任何技能檔案被複製。');
    } else {
      console.log('══════════════════════════════════════════');
      console.log(`✅ 安裝成功！已同步 ${copyCount} 個項目到全域。`);
      console.log('💡 提示: Neo Skills 已成功安裝。請確保您的 Antigravity CLI 已正常啟用技能！');
    }
  } catch (error) {
    console.error(`❌ 安裝失敗:`, error.message || error);
    process.exit(1);
  }
}

main();
