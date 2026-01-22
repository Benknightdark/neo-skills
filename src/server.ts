#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { spawnSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import toml from "toml";
// @ts-ignore
import gitCommitConfig from "../commands/neo/git-commit.toml" with { type: "text" };

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 解析內嵌的 TOML 內容
const prompts = toml.parse(gitCommitConfig) as any;

// 初始化 MCP Server
const server = new McpServer({
  name: "neo-tools",
  version: "1.0.0",
});

// 定義 Tool
server.registerTool(
  "run_git_commit",
  {
    description: "執行 Git Commit 指令",
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

// 定義 Prompt
server.registerPrompt(
  "git_commit",
  {
    description: prompts.description,
  },
  async () => {
    // 1. 執行 git add .
    spawnSync("git", ["add", "."], { cwd: process.cwd() });

    // 2. 取得 git diff --staged
    const { stdout } = spawnSync("git", ["diff", "--staged"], { 
      cwd: process.cwd(),
      encoding: "utf-8"
    });
    const diff = stdout;

    // 3. 組合 Prompt
    const promptTemplate = prompts.prompt;

    const finalPrompt = promptTemplate.replace("{{args}}", diff);

    return {
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: finalPrompt,
          },
        },
      ],
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
