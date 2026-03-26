#!/usr/bin/env node
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { pathToFileURL } from 'node:url';

// 取得當前檔案路徑
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const serverPath = join(__dirname, '..', 'dist', 'server.js');

async function start() {
  if (!existsSync(serverPath)) {
    console.error('❌ 錯誤: 找不到 dist/server.js。');
    console.error('這通常是因為您是透過 Git 直接下載此專案，但尚未執行建置流程 (build)。');
    console.error('請依照以下步驟進行建置：');
    console.error('  1. 安裝 Bun (https://bun.sh/)');
    console.error('  2. 執行 bun run build');
    process.exit(1);
  }

  // 動態載入伺服器
  try {
    await import(pathToFileURL(serverPath).href);
  } catch (err) {
    console.error('❌ 啟動伺服器時發生錯誤:', err);
    process.exit(1);
  }
}

start();
