/**
 * Claude Companion MCP 服务器
 * 通过 stdio 实现 MCP 协议，让 Claude Code 能够调用 Companion 功能
 */

import { CompanionMCPServer } from './server.js';
import { Readable } from 'stream';

/**
 * 响应类型
 */
interface MCPResponse {
  jsonrpc: '2.0';
  result?: any;
  error?: {
    code: number;
    message: string;
    data?: any;
  };
  id?: number | string;
}

/**
 * 请求类型
 */
interface MCPRequest {
  jsonrpc: '2.0';
  method: string;
  params?: any;
  id?: number | string;
}

/**
 * 运行 MCP 服务器
 */
export async function runMCPServer() {
  const server = new CompanionMCPServer();
  await server.initialize();

  console.error('Claude Companion MCP Server initialized');
  console.error('Waiting for requests...');

  let buffer = '';

  // 处理标准输入
  for await (const chunk of process.stdin) {
    buffer += chunk.toString();
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (!line.trim()) continue;

      try {
        const request: MCPRequest = JSON.parse(line);
        const response: MCPResponse = {
          jsonrpc: '2.0',
          id: request.id
        };

        switch (request.method) {
          case 'initialize':
            response.result = {
              protocolVersion: '2024-11-05',
              serverInfo: {
                name: 'claude-companion',
                version: '1.0.0'
              },
              capabilities: {
                tools: {}
              }
            };
            break;

          case 'tools/list':
            response.result = {
              tools: server.listTools()
            };
            break;

          case 'tools/call':
            const { name, arguments: args } = request.params;
            const result = await server.callTool(name, args);
            response.result = result;
            break;

          default:
            response.error = {
              code: -32601,
              message: `Method not found: ${request.method}`
            };
        }

        process.stdout.write(JSON.stringify(response) + '\n');

      } catch (error) {
        const errorResponse: MCPResponse = {
          jsonrpc: '2.0',
          error: {
            code: -32700,
            message: error instanceof Error ? error.message : String(error)
          },
          id: JSON.parse(line).id
        };
        process.stdout.write(JSON.stringify(errorResponse) + '\n');
      }
    }
  }

  await server.shutdown();
}

/**
 * 主入口（当直接运行此文件时）
 */
runMCPServer().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
