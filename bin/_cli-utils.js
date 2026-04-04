import { parseArgs } from 'node:util';

/**
 * 集中設定全域錯誤攔截，確保非預期錯誤不會靜默失敗
 */
export function setupGlobalErrorHandlers() {
  process.on('uncaughtException', (err) => {
    console.error('💥 [Fatal Error]:', err);
    process.exit(1);
  });
  process.on('unhandledRejection', (reason) => {
    console.error('💥 [Unhandled Rejection]:', reason);
    process.exit(1);
  });
}

/**
 * 解析 CLI 參數，支援 --ai-agent, --project-path, --instructions
 * 允許使用等號賦值 (e.g. --ai-agent=claude) 或空格 (e.g. --ai-agent claude)
 * @returns {{ [key: string]: string | boolean | undefined }} 解析後的參數物件
 */
export function parseCliArgs() {
  const { values } = parseArgs({
    options: {
      'ai-agent': { type: 'string' },
      'project-path': { type: 'string' },
      'instructions': { type: 'string' },
    },
    strict: false // 允許未定義的參數，避免因為傳入未知的 flag 導致 crash
  });
  return values;
}
