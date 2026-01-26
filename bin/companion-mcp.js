#!/usr/bin/env node

/**
 * Claude Companion MCP 服务器
 * 通过 stdio 实现 MCP 协议，让 Claude Code 能够调用 Companion 功能
 */

import { CompanionMCPServer } from '../dist/mcp/server.js';
import { Readable } from 'stream';

/**
 * 解析 MCP 请求
 */
async function parseRequest(input: string): Promise<{ method: string; params: any; id?: number | string }> {
  try {
    return JSON.parse(input);
  } catch (error) {
    throw new Error(`Invalid JSON: ${error}`);
  }
}

/**
 * 格式化 MCP 响应
 */
function formatResponse(result: any, id: number | string | undefined): string {
  return JSON.stringify({
    jsonrpc: '2.0',
    result,
    id
  }) + '\n';
}

/**
 * 格式化错误响应
 */
function formatError(error: any, id: number | string | undefined): string {
  return JSON.stringify({
    jsonrpc: '2.0',
    error: {
      code: -32000,
      message: error instanceof Error ? error.message : String(error)
    },
    id
  }) + '\n';
}

/**
 * 主循环
 */
async function main() {
  const server = await CompanionMCPServer ? await new (await import('../dist/mcp/server.js')).CompanionMCPServer() : null;

  if (!server) {
    console.error('Failed to initialize MCP server');
    process.exit(1);
  }

  await server.initialize();

  // 监听 stdin
  let buffer = '';

  process.stdin.setEncoding('utf8');
  process.stdin.on('data', async (chunk: string) => {
    buffer += chunk;
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (!line.trim()) continue;

      try {
        const request = await parseRequest(line);

        if (request.method === 'initialize') {
          // 初始化请求
          const response = formatResponse({
            protocolVersion: '2024-11-05',
            serverInfo: {
              name: 'claude-companion',
              version: '1.0.0'
            },
            capabilities: {
              tools: {}
            }
          }, request.id);
          process.stdout.write(response);

        } else if (request.method === 'tools/list') {
          // 列出工具
          const tools = server.listTools();
          const response = formatResponse({ tools }, request.id);
          process.stdout.write(response);

        } else if (request.method === 'tools/call') {
          // 调用工具
          const { name, arguments: args } = request.params;
          const result = await server.callTool(name, args);
          const response = formatResponse(result, request.id);
          process.stdout.write(response);

        } else {
          // 未知方法
          const response = formatError(`Unknown method: ${request.method}`, request.id);
          process.stdout.write(response);
        }

      } catch (error) {
        const response = formatError(error, undefined);
        process.stdout.write(response);
      }
    }
  });

  // 清理
  process.on('SIGINT', async () => {
    await server.shutdown();
    process.exit(0);
  });
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
