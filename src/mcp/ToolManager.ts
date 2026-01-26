import { MCPClient, MCPToolDefinition, MCPToolResult, MCPToolCallPlan } from './MCPClient.js';
import type { CompanionConfig } from '../types/index.js';

/**
 * 工具管理器
 * 管理 MCP 工具的调用和安全检查
 */
export class ToolManager {
  private client: MCPClient;
  private config: CompanionConfig['mcp'];
  private callHistory: Array<{
    toolName: string;
    timestamp: string;
    success: boolean;
  }> = [];

  constructor(client: MCPClient, config: CompanionConfig['mcp']) {
    this.client = client;
    this.config = config;
  }

  /**
   * 调用工具（带安全检查）
   */
  async callTool(
    toolName: string,
    parameters: Record<string, unknown>,
    context?: {
      requireConfirmation?: boolean;
      userIntent?: string;
    }
  ): Promise<MCPToolResult> {
    // 检查 MCP 是否启用
    if (!this.config.enabled) {
      return {
        success: false,
        error: 'MCP is disabled in configuration'
      };
    }

    // 检查工具是否可用
    if (!this.client.hasTool(toolName)) {
      return {
        success: false,
        error: `Tool ${toolName} is not available`
      };
    }

    // 获取工具定义
    const tool = this.client.getTool(toolName);
    if (!tool) {
      return {
        success: false,
        error: `Tool definition for ${toolName} not found`
      };
    }

    // 安全检查
    const securityCheck = this.performSecurityCheck(toolName, parameters);
    if (!securityCheck.safe) {
      if (this.config.strategy === 'conservative' || context?.requireConfirmation) {
        return {
          success: false,
          error: `Security check failed: ${securityCheck.reason}. Requires user confirmation.`
        };
      }
    }

    // 风险评估
    const risk = this.assessRisk(toolName, parameters);
    if (risk.level === 'high' && this.config.strategy === 'conservative') {
      return {
        success: false,
        error: `High-risk operation ${toolName} requires explicit user approval in conservative mode.`
      };
    }

    // 执行工具调用
    const result = await this.client.callTool(toolName, parameters);

    // 记录调用历史
    this.callHistory.push({
      toolName,
      timestamp: new Date().toISOString(),
      success: result.success
    });

    return result;
  }

  /**
   * 安全检查
   */
  private performSecurityCheck(
    toolName: string,
    parameters: Record<string, unknown>
  ): { safe: boolean; reason?: string } {
    // 检查危险操作
    const dangerousPatterns = [
      { pattern: /rm\s+-rf/, name: '删除文件' },
      { pattern: /format|mkfs/, name: '格式化磁盘' },
      { pattern: /shutdown|reboot/, name: '系统关机/重启' },
      { pattern: /password|secret|token|key/i, name: '敏感信息' }
    ];

    const paramsStr = JSON.stringify(parameters);

    for (const { pattern, name } of dangerousPatterns) {
      if (pattern.test(paramsStr) || pattern.test(toolName)) {
        return {
          safe: false,
          reason: `Detected potentially dangerous operation: ${name}`
        };
      }
    }

    // 检查参数大小
    const paramsSize = JSON.stringify(parameters).length;
    if (paramsSize > 10 * 1024 * 1024) { // 10MB
      return {
        safe: false,
        reason: 'Parameters too large (> 10MB)'
      };
    }

    return { safe: true };
  }

  /**
   * 风险评估
   */
  assessRisk(
    toolName: string,
    parameters: Record<string, unknown>
  ): { level: 'low' | 'medium' | 'high'; reasons: string[] } {
    const reasons: string[] = [];
    let level: 'low' | 'medium' | 'high' = 'low';

    // 工具类型风险评估
    const highRiskTools = ['file-delete', 'system-execute', 'database-write'];
    const mediumRiskTools = ['file-write', 'network-request', 'database-read'];

    if (highRiskTools.includes(toolName)) {
      level = 'high';
      reasons.push('Tool is classified as high-risk');
    } else if (mediumRiskTools.includes(toolName)) {
      level = 'medium';
      reasons.push('Tool is classified as medium-risk');
    }

    // 参数风险评估
    const paramsStr = JSON.stringify(parameters);

    if (/password|secret|token|key/i.test(paramsStr)) {
      if (level === 'low') level = 'medium';
      reasons.push('Parameters may contain sensitive information');
    }

    if (/delete|remove|drop/i.test(paramsStr)) {
      level = 'high';
      reasons.push('Parameters suggest destructive operation');
    }

    return { level, reasons };
  }

  /**
   * 创建工具调用计划
   */
  createCallPlan(
    toolName: string,
    purpose: string,
    parameters: Record<string, unknown>
  ): MCPToolCallPlan {
    const risk = this.assessRisk(toolName, parameters);

    return {
      toolName,
      purpose,
      parameters,
      expectedResult: this.predictResult(toolName, parameters),
      riskAssessment: {
        level: risk.level,
        potentialRisks: risk.reasons,
        mitigation: this.getMitigationStrategies(risk.level)
      },
      fallback: this.getFallbackStrategy(toolName)
    };
  }

  /**
   * 预测工具结果
   */
  private predictResult(toolName: string, parameters: Record<string, unknown>): string {
    const tool = this.client.getTool(toolName);
    return tool?.description || 'Tool execution result';
  }

  /**
   * 获取缓解策略
   */
  private getMitigationStrategies(riskLevel: 'low' | 'medium' | 'high'): string[] {
    const strategies: Record<'low' | 'medium' | 'high', string[]> = {
      low: ['Proceed with normal execution'],
      medium: [
        'Verify parameters are correct',
        'Consider creating backup',
        'Monitor execution closely'
      ],
      high: [
        'Require explicit user confirmation',
        'Create backup before execution',
        'Log all operations',
        'Prepare rollback plan'
      ]
    };

    return strategies[riskLevel];
  }

  /**
   * 获取后备策略
   */
  private getFallbackStrategy(toolName: string): string {
    const fallbacks: Record<string, string> = {
      'file-read': 'Use alternative file reading method',
      'file-write': 'Retry with different location or format',
      'network-request': 'Cache results and retry later',
      'database-query': 'Use cached data if available'
    };

    return fallbacks[toolName] || 'Review error and adjust parameters';
  }

  /**
   * 获取调用历史
   */
  getCallHistory(): Array<{
    toolName: string;
    timestamp: string;
    success: boolean;
  }> {
    return [...this.callHistory];
  }

  /**
   * 清除调用历史
   */
  clearHistory(): void {
    this.callHistory = [];
  }

  /**
   * 获取调用统计
   */
  getCallStats(): {
    totalCalls: number;
    successRate: number;
    toolUsage: Record<string, number>;
  } {
    const totalCalls = this.callHistory.length;
    const successCount = this.callHistory.filter(c => c.success).length;
    const toolUsage: Record<string, number> = {};

    for (const call of this.callHistory) {
      toolUsage[call.toolName] = (toolUsage[call.toolName] || 0) + 1;
    }

    return {
      totalCalls,
      successRate: totalCalls > 0 ? successCount / totalCalls : 0,
      toolUsage
    };
  }

  /**
   * 列出可用的工具
   */
  async listAvailableTools(): Promise<MCPToolDefinition[]> {
    return await this.client.listTools();
  }

  /**
   * 获取工具详情
   */
  getToolDetails(toolName: string): MCPToolDefinition | null {
    return this.client.getTool(toolName) || null;
  }

  /**
   * 检查工具是否可用
   */
  isToolAvailable(toolName: string): boolean {
    return this.client.hasTool(toolName);
  }

  /**
   * 生成工具调用报告
   */
  generateToolReport(): string {
    const lines: string[] = [];

    lines.push('## MCP 工具使用报告');
    lines.push('');

    // 连接状态
    const serverInfo = this.client.getServerInfo();
    lines.push('### 连接状态');
    lines.push('');
    lines.push(`- 服务器地址: ${serverInfo.url}`);
    lines.push(`- 连接状态: ${serverInfo.connected ? '已连接' : '未连接'}`);
    lines.push(`- 可用工具数: ${serverInfo.toolCount}`);
    lines.push('');

    // 调用统计
    const stats = this.getCallStats();
    lines.push('### 调用统计');
    lines.push('');
    lines.push(`- 总调用次数: ${stats.totalCalls}`);
    lines.push(`- 成功率: ${Math.round(stats.successRate * 100)}%`);
    lines.push('');

    if (Object.keys(stats.toolUsage).length > 0) {
      lines.push('**工具使用频率**:');
      for (const [tool, count] of Object.entries(stats.toolUsage)) {
        lines.push(`- ${tool}: ${count} 次`);
      }
      lines.push('');
    }

    // 最近调用
    const recentCalls = this.callHistory.slice(-10);
    if (recentCalls.length > 0) {
      lines.push('### 最近调用');
      lines.push('');
      lines.push('| 工具 | 时间 | 结果 |');
      lines.push('|------|------|------|');
      for (const call of recentCalls) {
        const status = call.success ? '✓ 成功' : '✗ 失败';
        const time = new Date(call.timestamp).toLocaleTimeString();
        lines.push(`| ${call.toolName} | ${time} | ${status} |`);
      }
    }

    return lines.join('\n');
  }
}

/**
 * 内置工具定义
 */
export const builtinTools: MCPToolDefinition[] = [
  {
    name: 'file-read',
    description: '读取文件内容',
    parameters: {
      type: 'object',
      properties: {
        filePath: { type: 'string', description: '文件路径' }
      },
      required: ['filePath']
    }
  },
  {
    name: 'file-write',
    description: '写入文件内容',
    parameters: {
      type: 'object',
      properties: {
        filePath: { type: 'string', description: '文件路径' },
        content: { type: 'string', description: '文件内容' }
      },
      required: ['filePath', 'content']
    }
  },
  {
    name: 'file-search',
    description: '搜索文件',
    parameters: {
      type: 'object',
      properties: {
        pattern: { type: 'string', description: '搜索模式' },
        directory: { type: 'string', description: '搜索目录' }
      },
      required: ['pattern']
    }
  },
  {
    name: 'code-exec',
    description: '执行代码',
    parameters: {
      type: 'object',
      properties: {
        language: { type: 'string', description: '编程语言' },
        code: { type: 'string', description: '代码' }
      },
      required: ['language', 'code']
    }
  }
];
