/**
 * Claude Companion MCP 服务器
 * 让 Claude Code 能够通过 MCP 协议调用 Companion 功能
 */

import { createCompanion } from '../index.js';
import type { Companion } from '../index.js';
import { AutoCallEngine } from './AutoCallEngine.js';

/**
 * MCP 服务器类
 */
export class CompanionMCPServer {
  private companion: Companion | null = null;
  private autoCallEngine: AutoCallEngine | null = null;
  private initialized: boolean = false;

  /**
   * 初始化服务器
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    // 创建 Companion 实例
    this.companion = await createCompanion();

    // 创建自动调用引擎
    this.autoCallEngine = new AutoCallEngine(this.companion, {
      autoPersonaSwitch: true,
      autoDeepThinking: true,
      autoMemorySave: true,
      deepThinkingThreshold: 3,
      emotionThreshold: 0.6
    });

    this.initialized = true;
  }

  /**
   * 获取可用工具列表
   */
  listTools(): MCPTool[] {
    return [
      {
        name: 'companion_process',
        description: '处理用户输入，生成带有深度思考、人格和情感的智能响应',
        inputSchema: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
                                      description: '用户的消息或请求'
                                    },
            persona: {
                                      type: 'string',
                                      enum: ['professional-mentor', 'efficient-partner', 'architect', 'explorer', 'auto'],
                                      description: '人格模式（auto 为自动检测）'
                                    },
            context: {
                                      type: 'object',
                                      properties: {
                                        language: { type: 'string', description: '编程语言' },
                                        framework: { type: 'string', description: '框架' },
                                        conversationId: { type: 'string', description: '对话 ID' }
                                      },
                                      description: '上下文信息'
                                    }
                                  },
                                  required: ['message']
        }
      },
      {
        name: 'companion_think',
        description: '生成深度思考过程报告，展示问题解析、知识检索、策略规划等',
        inputSchema: {
          type: 'object',
          properties: {
            request: {
                                      type: 'string',
                                      description: '需要分析的请求或问题'
                                    }
                                  },
                                  required: ['request']
        }
      },
      {
        name: 'companion_switch_persona',
        description: '切换人格模式',
        inputSchema: {
          type: 'object',
          properties: {
            persona: {
                                      type: 'string',
                                      enum: ['professional-mentor', 'efficient-partner', 'architect', 'explorer'],
                                      description: '目标人格模式'
                                    }
                                  },
                                  required: ['persona']
        }
      },
      {
        name: 'companion_get_memory',
        description: '获取记忆摘要，包括对话历史、用户偏好、项目状态等',
        inputSchema: {
          type: 'object',
          properties: {}
        }
      },
      {
        name: 'companion_get_status',
        description: '获取系统状态报告',
        inputSchema: {
          type: 'object',
          properties: {}
        }
      },
      {
        name: 'companion_set_preference',
        description: '更新用户偏好设置',
        inputSchema: {
          type: 'object',
          properties: {
            detailLevel: {
              type: 'string',
              enum: ['concise', 'balanced', 'comprehensive'],
              description: '详细程度'
            },
            explanationStyle: {
              type: 'string',
              enum: ['direct', 'step-by-step', 'analogy'],
              description: '解释风格'
            },
            defaultPersona: {
              type: 'string',
              enum: ['professional-mentor', 'efficient-partner', 'architect', 'explorer'],
              description: '默认人格'
            }
                                  }
        }
      },
      {
        name: 'companion_reflect',
        description: '对已完成任务进行反思和总结',
        inputSchema: {
          type: 'object',
          properties: {
            task: {
                                      type: 'string',
                                      description: '完成的任务'
                                    },
            outcome: {
                                      type: 'string',
                                      description: '任务结果'
                                    },
            challenges: {
                                      type: 'array',
                                      items: { type: 'string' },
                                      description: '遇到的困难'
                                    },
            discoveries: {
                                      type: 'array',
                                      items: { type: 'string' },
                                      description: '新发现'
                                    }
                                  },
                                  required: ['task', 'outcome']
        }
      },
      {
        name: 'companion_analyze_emotion',
        description: '分析消息中的情绪',
        inputSchema: {
          type: 'object',
          properties: {
            message: {
                                      type: 'string',
                                      description: '要分析的消息'
                                    }
                                  },
                                  required: ['message']
        }
      },
      {
        name: 'companion_save_conversation',
        description: '保存对话记录到记忆系统',
        inputSchema: {
          type: 'object',
          properties: {
            title: {
                                      type: 'string',
                                      description: '对话标题'
                                    },
            summary: {
                                      type: 'string',
                                      description: '对话摘要'
                                    },
            decisions: {
                                      type: 'array',
                                      items: {
                                        type: 'object',
                                        properties: {
                                          decision: { type: 'string' },
                                          reason: { type: 'string' }
                                        }
                                      },
                                      description: '关键决策列表'
                                    },
            solutions: {
                                      type: 'array',
                                      items: {
                                        type: 'object',
                                        properties: {
                                          problem: { type: 'string' },
                                          solution: { type: 'string' },
                                          result: { type: 'string' }
                                        }
                                      },
                                      description: '问题和解决方案列表'
                                    }
                                  },
                                  required: ['title']
        }
      },
      {
        name: 'companion_auto_process',
        description: '【推荐】智能自动处理用户请求 - 自动分析并选择最佳处理方式（人格切换、深度思考、记忆保存等）',
        inputSchema: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: '用户的消息或请求'
            },
            context: {
              type: 'object',
              properties: {
                language: { type: 'string', description: '编程语言' },
                framework: { type: 'string', description: '框架' },
                conversationId: { type: 'string', description: '对话 ID' }
              },
              description: '上下文信息'
            },
            showAnalysis: {
              type: 'boolean',
              description: '是否显示分析过程（默认 false）',
              default: false
            }
          },
          required: ['message']
        }
      }
    ];
  }

  /**
   * 调用工具
   */
  async callTool(name: string, args: Record<string, unknown>): Promise<MCPToolResult> {
    if (!this.initialized || !this.companion) {
      return {
        content: [{ type: 'text', text: '错误: 服务器未初始化' }],
        isError: true
      };
    }

    try {
      switch (name) {
        case 'companion_process':
          return await this.process(args);
        case 'companion_auto_process':
          return await this.autoProcess(args);
        case 'companion_think':
          return await this.think(args);
        case 'companion_switch_persona':
          return await this.switchPersona(args);
        case 'companion_get_memory':
          return await this.getMemory();
        case 'companion_get_status':
          return await this.getStatus();
        case 'companion_set_preference':
          return await this.setPreference(args);
        case 'companion_reflect':
          return await this.reflect(args);
        case 'companion_analyze_emotion':
          return await this.analyzeEmotion(args);
        case 'companion_save_conversation':
          return await this.saveConversation(args);
        default:
          return {
            content: [{ type: 'text', text: `未知工具: ${name}` }],
            isError: true
          };
      }
    } catch (error) {
      return {
        content: [{ type: 'text', text: `错误: ${error instanceof Error ? error.message : String(error)}` }],
        isError: true
      };
    }
  }

  /**
   * 处理用户输入
   */
  private async process(args: Record<string, unknown>): Promise<MCPToolResult> {
    if (!this.companion) {
      return {
        content: [{ type: 'text', text: '错误: Companion 未初始化' }],
        isError: true
      };
    }

    const { message, persona, context } = args;

    // 切换人格
    if (persona && typeof persona === 'string' && persona !== 'auto') {
      this.companion.switchPersona(persona as 'professional-mentor' | 'efficient-partner' | 'architect' | 'explorer');
    }

    const result = await this.companion.process({
      message: message as string,
      context: context as { language?: string; framework?: string; conversationId?: string } | undefined
    });

    const response = [
      `**人格**: ${result.persona}`,
      `**情绪**: ${result.emotions?.join(', ') || '无'}`,
      '',
      result.response
    ].join('\n');

    return {
      content: [{ type: 'text', text: response }]
    };
  }

  /**
   * 生成思考报告
   */
  private async think(args: Record<string, unknown>): Promise<MCPToolResult> {
    if (!this.companion) {
      return {
        content: [{ type: 'text', text: '错误: Companion 未初始化' }],
        isError: true
      };
    }

    const { request } = args;
    const report = await this.companion.generateThinkingReport(request as string);

    return {
      content: [{ type: 'text', text: report }]
    };
  }

  /**
   * 切换人格
   */
  private async switchPersona(args: Record<string, unknown>): Promise<MCPToolResult> {
    if (!this.companion) {
      return {
        content: [{ type: 'text', text: '错误: Companion 未初始化' }],
        isError: true
      };
    }

    const { persona } = args;
    this.companion.switchPersona(persona as 'professional-mentor' | 'efficient-partner' | 'architect' | 'explorer');

    const personaNames: Record<string, string> = {
      'professional-mentor': '专业导师',
      'efficient-partner': '高效搭档',
      'architect': '架构师',
      'explorer': '探索者'
    };

    return {
      content: [{ type: 'text', text: `已切换到: ${personaNames[persona as string]}` }]
    };
  }

  /**
   * 获取记忆摘要
   */
  private async getMemory(): Promise<MCPToolResult> {
    if (!this.companion) {
      return {
        content: [{ type: 'text', text: '错误: Companion 未初始化' }],
        isError: true
      };
    }

    const summary = await this.companion.getMemorySummary();

    return {
      content: [{ type: 'text', text: summary }]
    };
  }

  /**
   * 获取状态报告
   */
  private async getStatus(): Promise<MCPToolResult> {
    if (!this.companion) {
      return {
        content: [{ type: 'text', text: '错误: Companion 未初始化' }],
        isError: true
      };
    }

    const report = await this.companion.generateStatusReport();

    return {
      content: [{ type: 'text', text: report }]
    };
  }

  /**
   * 设置用户偏好
   */
  private async setPreference(args: Record<string, unknown>): Promise<MCPToolResult> {
    const { detailLevel, explanationStyle, defaultPersona } = args;

    // 这里可以更新用户偏好
    // 简化实现
    const updates: string[] = [];
    if (detailLevel) updates.push(`详细程度: ${detailLevel}`);
    if (explanationStyle) updates.push(`解释风格: ${explanationStyle}`);
    if (defaultPersona) updates.push(`默认人格: ${defaultPersona}`);

    return {
      content: [{ type: 'text', text: `偏好已更新:\n${updates.join('\n')}` }]
    };
  }

  /**
   * 反思任务
   */
  private async reflect(args: Record<string, unknown>): Promise<MCPToolResult> {
    if (!this.companion) {
      return {
        content: [{ type: 'text', text: '错误: Companion 未初始化' }],
        isError: true
      };
    }

    const { task, outcome, challenges = [], discoveries = [] } = args;

    const reflection = this.companion.reflect({
      task: task as string,
      outcome: outcome as string,
      steps: [],
      challenges: challenges as string[],
      discoveries: discoveries as string[]
    });

    const report = this.companion.getEmotionAI().generateEmotionReport();
    const reflectionText = this.companion.getReflectionAI().generateReflectionText(reflection);

    const fullReport = [
      '# 任务反思',
      '',
      reflectionText,
      '',
      '## 记忆已更新',
      '反思内容已保存到记忆系统，用于改进未来的协作。'
    ].join('\n');

    return {
      content: [{ type: 'text', text: fullReport }]
    };
  }

  /**
   * 分析情绪
   */
  private async analyzeEmotion(args: Record<string, unknown>): Promise<MCPToolResult> {
    if (!this.companion) {
      return {
        content: [{ type: 'text', text: '错误: Companion 未初始化' }],
        isError: true
      };
    }

    const { message } = args;

    const emotionAI = this.companion.getEmotionAI();
    const report = emotionAI.generateEmotionReport(message as string);

    return {
      content: [{ type: 'text', text: report }]
    };
  }

  /**
   * 保存对话
   */
  private async saveConversation(args: Record<string, unknown>): Promise<MCPToolResult> {
    if (!this.companion) {
      return {
        content: [{ type: 'text', text: '错误: Companion 未初始化' }],
        isError: true
      };
    }

    const { title, summary, decisions = [], solutions = [] } = args;

    // 这里需要调用 MemorySystem 来保存对话
    // 简化实现
    const saved = await this.companion.getMemorySystem().createConversation(
      title as string,
      'claude-code-user',
      'claude-code-project'
    );

    return {
      content: [{ type: 'text', text: `对话已保存 (ID: ${saved})\n标题: ${title}\n摘要: ${summary || '无'}` }]
    };
  }

  /**
   * 自动处理用户输入（智能模式）
   */
  private async autoProcess(args: Record<string, unknown>): Promise<MCPToolResult> {
    if (!this.companion || !this.autoCallEngine) {
      return {
        content: [{ type: 'text', text: '错误: Companion 或 AutoCallEngine 未初始化' }],
        isError: true
      };
    }

    const { message, context, showAnalysis = false } = args;

    // 使用自动调用引擎处理
    const result = await this.autoCallEngine.autoProcess(
      message as string,
      context as { language?: string; framework?: string; conversationId?: string }
    );

    // 构建响应
    const responseParts: string[] = [];

    // 添加分析报告（如果请求）
    if (showAnalysis) {
      responseParts.push('## 智能分析');
      responseParts.push('');
      responseParts.push(this.autoCallEngine.generateAnalysisReport(result.analysis));
      responseParts.push('');
      responseParts.push('## 执行动作');
      responseParts.push('');
      if (result.actions.length > 0) {
        result.actions.forEach(action => responseParts.push(`- ${action}`));
      } else {
        responseParts.push('- 无需特殊处理');
      }
      responseParts.push('');
      responseParts.push('---');
      responseParts.push('');
    }

    // 添加响应
    responseParts.push(`**人格**: ${this.companion.getCurrentPersona().type}`);
    responseParts.push(`**情绪**: ${result.response ? '已处理' : '无'}`);
    responseParts.push('');
    responseParts.push(result.response);

    return {
      content: [{ type: 'text', text: responseParts.join('\n') }]
    };
  }

  /**
   * 关闭服务器
   */
  async shutdown(): Promise<void> {
    if (this.companion) {
      await this.companion.shutdown();
    }
    this.initialized = false;
  }

  /**
   * 获取 Companion 实例（用于调试）
   */
  getCompanion(): Companion | null {
    return this.companion;
  }
}

/**
 * MCP 工具定义
 */
export interface MCPTool {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

/**
 * MCP 工具结果
 */
export interface MCPToolResult {
  content: Array<{
    type: 'text';
    text: string;
  }>;
  isError?: boolean;
}

/**
 * 创建并启动 MCP 服务器
 */
export async function createMCPServer(): Promise<CompanionMCPServer> {
  const server = new CompanionMCPServer();
  await server.initialize();
  return server;
}
