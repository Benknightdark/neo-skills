#!/usr/bin/env node
/**
 * Neo Skills 統一安裝程式
 *
 * 用法：
 *   install-skills                                         安裝全部 AI Agent 技能至 $HOME
 *   install-skills --ai-agent claude                       只安裝 Claude 技能至 $HOME
 *   install-skills --ai-agent copilot --project-path .     安裝 Copilot 技能至指定專案
 *
 * 參數：
 *   --ai-agent <name>      指定要安裝的 agent（可用值見 _utils.js 的 AGENTS）。
 *                           省略時安裝全部 agent。
 *   --project-path <path>  指定專案根目錄作為安裝基底（取代 $HOME）。
 *                           省略時安裝至全域路徑。
 */
import { AGENTS, createInstaller } from './_utils.js';

/**
 * 從 process.argv 解析指定 flag 的值。
 * 例如 parseArg('--ai-agent') 在 argv 含 ['--ai-agent', 'claude'] 時回傳 'claude'。
 * @param {string} flag
 * @returns {string | undefined}
 */
function parseArg(flag) {
  const idx = process.argv.indexOf(flag);
  if (idx === -1 || idx + 1 >= process.argv.length) return undefined;
  return process.argv[idx + 1];
}

// 全域錯誤攔截，確保非預期錯誤不會靜默失敗
process.on('uncaughtException', (err) => {
  console.error('💥 [Fatal Error]:', err);
  process.exit(1);
});
process.on('unhandledRejection', (reason) => {
  console.error('💥 [Unhandled Rejection]:', reason);
  process.exit(1);
});

async function main() {
  // 先統一解析 CLI 參數，後續分支都使用同一份輸入來源，
  // 避免在不同模式中重複讀取 process.argv。
  const agentKey = parseArg('--ai-agent');
  const projectPath = parseArg('--project-path');

  // ── 模式一：指定單一 agent ──
  if (agentKey) {
    // 以 AGENTS 作為唯一白名單來源，避免使用者輸入未支援的 agent 名稱。
    const config = AGENTS[agentKey];
    if (!config) {
      const valid = Object.keys(AGENTS).join(', ');
      console.error(`❌ 未知的 agent: "${agentKey}"。可用選項: ${valid}`);
      process.exit(1);
    }

    // createInstaller 會根據 agent 設定與 projectPath
    // 回傳對應的安裝函式，這裡只需執行一次即可完成單一 agent 安裝。
    const installFn = createInstaller(config, projectPath);
    const result = await installFn();
    if (!result.success) process.exit(1);
    return;
  }

  // ── 模式二：安裝全部 agent ──
  console.log('╔══════════════════════════════════════════╗');
  console.log('║   🧠 Neo Skills — 統一安裝程式          ║');
  console.log('╚══════════════════════════════════════════╝');
  console.log('');

  const results = [];

  // 未指定 --ai-agent 時，逐一嘗試安裝所有已註冊 agent。
  // 每個 agent 的錯誤都獨立處理，確保單一失敗不會中斷整體彙總流程。
  for (const [, config] of Object.entries(AGENTS)) {
    console.log(`━━━ 正在安裝: ${config.name} ━━━`);
    try {
      const installFn = createInstaller(config, projectPath);
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

  // 統一列出每個 agent 的最終結果，讓使用者能快速判斷成功與失敗原因。
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

// 以單一入口啟動 CLI，讓所有例外都集中經過上方的全域錯誤處理。
main();
