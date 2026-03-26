#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import axios from "axios";
import * as cheerio from "cheerio";

/**
 * Neo Tools MCP Server
 * 提供網頁內容擷取等實用工具。
 */

// 初始化 MCP Server
const server = new McpServer({
  name: "neo-tools",
  version: "1.0.0",
});

// 定義 Tool: fetch_web_content
// 用於獲取網頁 HTML 內容，支援 CSS 選擇器篩選。
server.registerTool(
  "fetch_web_content",
  {
    description: "從指定的 URL 獲取網頁 HTML 內容。支援使用 CSS 選擇器篩選特定區塊（若無指定則回傳完整內容）。",
    inputSchema: {
      url: z.url().describe("目標網頁的完整 URL"),
      selector: z.string().optional().describe("選填：用於篩選內容的 CSS 選擇器（如 'div.main-content' 或 'article'）"),
    },
  },
  async ({ url, selector }) => {
    try {
      const response = await axios.get(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        },
        timeout: 10000,
      });

      const $ = cheerio.load(response.data);
      let content = "";

      if (selector) {
        const selectedElements = $(selector);
        if (selectedElements.length > 0) {
          content = selectedElements.html() || "";
        } else {
          return {
            content: [{ type: "text", text: `未找到符合選擇器 '${selector}' 的元素。` }],
            isError: false,
          };
        }
      } else {
        content = response.data;
      }

      return {
        content: [{ type: "text", text: content }],
      };
    } catch (error: any) {
      return {
        content: [{ type: "text", text: `擷取網頁失敗: ${error.message}` }],
        isError: true,
      };
    }
  }
);

// 啟動 Server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Neo Tools MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
