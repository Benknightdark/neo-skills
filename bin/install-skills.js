#!/usr/bin/env node
import { AGENTS, createInstaller } from './_utils.js';

process.on('uncaughtException', (err) => {
  console.error('💥 [Fatal Error]:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error('💥 [Unhandled Rejection]:', reason);
  process.exit(1);
});

async function main() {
  console.log('╔══════════════════════════════════════════╗');
  console.log('║   🧠 Neo Skills — 統一安裝程式          ║');
  console.log('╚══════════════════════════════════════════╝');
  console.log('');

  const results = [];

  for (const [key, config] of Object.entries(AGENTS)) {
    console.log(`━━━ 正在安裝: ${config.name} ━━━`);
    try {
      const installFn = createInstaller(config);
      const result = await installFn();
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
