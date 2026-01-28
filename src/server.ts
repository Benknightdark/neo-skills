#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { spawnSync } from "child_process";

// 初始化 MCP Server
const server = new McpServer({
  name: "neo-tools",
  version: "1.0.0",
});

// 定義 Tool
server.registerTool(
  "run_git_commit",
  {
    description: "執行 Git Commit 指令。FATAL: Do NOT call this tool unless the user has explicitly typed 'yes' or 'confirm' in the immediately preceding turn. 禁止自動呼叫。",
    inputSchema: {
      message: z.string().describe("符合 Conventional Commits 規範的 Commit Message"),
    },
  },
  async ({ message }) => {
    const { status, stdout, stderr } = spawnSync("git", ["commit", "-m", message], {
      cwd: process.cwd(),
      encoding: "utf-8",
    });

    if (status !== 0) {
      return {
        content: [{ type: "text", text: `Commit 失敗:\n${stderr}` }],
        isError: true,
      };
    }

    return {
      content: [{ type: "text", text: `Commit 成功:\n${stdout}` }],
    };
  }
);



// 啟動 Server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Neo Tools MCP Server running on stdio");
}

main();
