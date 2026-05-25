/**
 * Shared utilities for agent skill installers.
 */

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
  agy: {
    name: 'Antigravity (AGY)',
    homePath: '.gemini/skills',
    projectPath: '.agents/skills',
    instructionFile: {
      homePath: '.gemini/antigravity-cli/instructions.md',
      projectPath: 'agents.md',
    },
    hint: 'Neo Skills 已安裝。請確保 AGY 已載入 instructions.md 或 agents.md 作為上下文檔案。',
  },
};
