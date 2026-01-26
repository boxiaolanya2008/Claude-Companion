import { MemorySystem } from './memory/MemorySystem.js';
import { DeepThinkingEngine } from './core/DeepThinkingEngine.js';
import { PersonaEngine } from './persona/PersonaEngine.js';
import { EmotionalIntelligence } from './emotion/EmotionalIntelligence.js';
import { MCPClient } from './mcp/MCPClient.js';
import { ToolManager } from './mcp/ToolManager.js';
import { SkillLoader, createDefaultSkillRegistry } from './skills/SkillLoader.js';
import { loadConfig, type CompanionConfig, type CompanionInput, type CompanionOutput } from './index.js';

/**
 * Claude Companion 主类
 * 整合所有组件，提供统一的接口
 */
export class Companion {
  private config: CompanionConfig;
  private memory: MemorySystem;
  private thinking: DeepThinkingEngine;
  private persona: PersonaEngine;
  private emotion: EmotionalIntelligence;
  private mcpClient: MCPClient;
  private toolManager: ToolManager;
  private skillLoader: SkillLoader;
  private initialized: boolean = false;

  constructor(config?: Partial<CompanionConfig>) {
    // 加载配置
    const baseConfig = loadConfig();
    this.config = config ? { ...baseConfig, ...config } : baseConfig;

    // 初始化组件
    this.memory = new MemorySystem(this.config.memorySystem);
    this.thinking = new DeepThinkingEngine(this.memory);
    this.persona = new PersonaEngine(this.memory, this.config.persona.defaultMode, this.config.codeStyle, this.config.aesthetics);
    this.emotion = new EmotionalIntelligence(this.memory);
    this.mcpClient = new MCPClient();
    this.toolManager = new ToolManager(this.mcpClient, this.config.mcp);
    this.skillLoader = new SkillLoader(createDefaultSkillRegistry());
  }

  /**
   * 初始化
   */
  async initialize(userId: string = 'default', project: string = 'default'): Promise<void> {
    if (this.initialized) {
      return;
    }

    // 初始化记忆系统
    await this.memory.initialize(userId, project);

    // 初始化人格引擎
    await this.persona.initialize();

    // 连接 MCP（如果启用）
    if (this.config.mcp.enabled) {
      await this.mcpClient.connect();
      // 注册内置工具
      const { builtinTools } = await import('./mcp/ToolManager.js');
      for (const tool of builtinTools) {
        this.mcpClient.registerTool(tool);
      }
    }

    // 加载核心技能
    const coreSkills = ['core.reasoning', 'core.programming', 'core.communication'];
    await this.skillLoader.load(coreSkills);

    this.initialized = true;
  }

  /**
   * 处理用户输入
   */
  async process(input: CompanionInput): Promise<CompanionOutput> {
    if (!this.initialized) {
      throw new Error('Companion not initialized. Call initialize() first.');
    }

    // 增强请求：应用代码风格和美化指南
    const enhancedMessage = this.persona.enhanceRequest(input.message);

    // 1. 情感检测
    let emotionalResponse = undefined;
    let detectedEmotion = undefined;

    if (this.config.emotion.enabled) {
      const emotionResult = await this.emotion.processMessage(input.message);
      emotionalResponse = emotionResult.response;
      detectedEmotion = emotionResult.detection.emotion;
    }

    // 2. 深度思考（使用增强后的消息）
    const thinkingResult = await this.thinking.process(enhancedMessage, {
      language: input.context?.language,
      framework: input.context?.framework,
      conversationId: input.context?.conversationId
    });

    // 3. 人格化响应
    const personaResult = await this.persona.processRequest(enhancedMessage, {
      complexity: thinkingResult.parseResult.complexityRating.level
    });

    // 4. 生成最终响应
    let response = thinkingResult.parseResult.coreIntent;

    // 如果有情感响应，组合进去
    if (emotionalResponse && this.config.emotion.enabled) {
      response = this.emotion.combineWithContent(emotionalResponse, response);
    }

    // 应用人格风格
    response = this.persona.formatOutput(response, personaResult.persona).response;

    // 5. 记录到记忆
    if (this.config.memorySystem.autoSave) {
      // 这里可以记录对话历史
      await this.memory.recordCommonTask(input.message.slice(0, 50));
    }

    return {
      response,
      persona: personaResult.persona.type,
      emotions: detectedEmotion ? [detectedEmotion] : [],
      toolsUsed: [],
      memoryUpdates: [],
      followUpSuggestions: this.persona.formatOutput('', personaResult.persona).followUpSuggestions
    };
  }

  /**
   * 生成思考报告
   */
  async generateThinkingReport(request: string): Promise<string> {
    return await this.thinking.generateThinkingReport(request);
  }

  /**
   * 切换人格
   */
  switchPersona(personaType: 'professional-mentor' | 'efficient-partner' | 'architect' | 'explorer'): void {
    this.persona.switchPersona(personaType, 'manual');
  }

  /**
   * 获取当前人格
   */
  getCurrentPersona() {
    return this.persona.getCurrentPersona();
  }

  /**
   * 获取记忆摘要
   */
  async getMemorySummary(): Promise<string> {
    return await this.memory.getMemorySummary();
  }

  /**
   * 获取情绪报告
   */
  getEmotionReport(message?: string): string {
    return this.emotion.generateEmotionReport(message);
  }

  /**
   * 获取工具报告
   */
  getToolReport(): string {
    return this.toolManager.generateToolReport();
  }

  /**
   * 获取技能统计
   */
  getSkillStats() {
    return this.skillLoader.getLoadStats();
  }

  /**
   * 加载技能
   */
  async loadSkills(skillIds: string[]) {
    return await this.skillLoader.load(skillIds);
  }

  /**
   * 调用 MCP 工具
   */
  async callTool(toolName: string, parameters: Record<string, unknown>) {
    return await this.toolManager.callTool(toolName, parameters);
  }

  /**
   * 生成系统状态报告
   */
  async generateStatusReport(): Promise<string> {
    const lines: string[] = [];

    lines.push('# Claude Companion 系统状态');
    lines.push('');
    lines.push(`初始化状态: ${this.initialized ? '✓ 已初始化' : '✗ 未初始化'}`);
    lines.push('');

    // 配置信息
    lines.push('## 配置');
    lines.push('');
    lines.push(`- 默认人格: ${this.config.persona.defaultMode}`);
    lines.push(`- 自动人格切换: ${this.config.persona.autoSwitch}`);
    lines.push(`- 记忆系统: ${this.config.memorySystem.enabled ? '启用' : '禁用'}`);
    lines.push(`- 情感系统: ${this.config.emotion.enabled ? '启用' : '禁用'}`);
    lines.push(`- MCP: ${this.config.mcp.enabled ? '启用' : '禁用'}`);
    lines.push('');

    // 记忆摘要
    if (this.config.memorySystem.enabled) {
      const memorySummary = await this.memory.getMemorySummary();
      lines.push('## 记忆系统');
      lines.push('');
      lines.push(memorySummary);
      lines.push('');
    }

    // 人格统计
    const personaStats = this.persona.getPersonaStats();
    lines.push('## 人格系统');
    lines.push('');
    lines.push(`- 当前人格: ${personaStats.current}`);
    lines.push(`- 切换次数: ${personaStats.switchCount}`);
    lines.push('');

    // 情绪统计
    if (this.config.emotion.enabled) {
      const emotionStats = this.emotion.getEmotionStats();
      lines.push('## 情感系统');
      lines.push('');
      lines.push(`- 主导情绪: ${emotionStats.dominant}`);
      lines.push(`- 情感倾向: ${emotionStats.sentiment}`);
      lines.push('');
    }

    // 技能统计
    const skillStats = this.skillLoader.getLoadStats();
    lines.push('## 技能系统');
    lines.push('');
    lines.push(`- 已加载技能: ${skillStats.totalLoaded}`);
    lines.push(`- 核心技能: ${skillStats.byCategory.core}`);
    lines.push(`- 领域技能: ${skillStats.byCategory.domain}`);
    lines.push(`- 专项技能: ${skillStats.byCategory.specialized}`);
    lines.push('');

    // MCP 状态
    if (this.config.mcp.enabled) {
      lines.push('## MCP 工具');
      lines.push('');
      lines.push(this.toolManager.generateToolReport());
    }

    return lines.join('\n');
  }

  /**
   * 保存所有状态
   */
  async save(): Promise<void> {
    await this.memory.saveAll();
  }

  /**
   * 关闭
   */
  async shutdown(): Promise<void> {
    await this.save();
    if (this.config.mcp.enabled) {
      await this.mcpClient.disconnect();
    }
    this.initialized = false;
  }

  /**
   * 反思任务（用于 MCP 集成）
   */
  reflect(context: {
    task: string;
    outcome: string;
    steps: string[];
    challenges: string[];
    discoveries: string[];
  }) {
    return this.thinking.getReflectionOptimizer().generateReflection(context);
  }

  /**
   * 获取情感 AI 实例（用于 MCP 集成）
   */
  getEmotionAI() {
    return this.emotion;
  }

  /**
   * 获取反思优化器实例（用于 MCP 集成）
   */
  getReflectionAI() {
    return this.thinking.getReflectionOptimizer();
  }

  /**
   * 获取记忆系统实例（用于 MCP 集成）
   */
  getMemorySystem() {
    return this.memory;
  }

  /**
   * 获取深度思考引擎（用于 MCP 集成）
   */
  getThinkingEngine() {
    return this.thinking;
  }

  /**
   * 获取人格引擎（用于 MCP 集成）
   */
  getPersonaEngine() {
    return this.persona;
  }
}

/**
 * 创建默认 Companion 实例
 */
export async function createCompanion(config?: Partial<CompanionConfig>): Promise<Companion> {
  const companion = new Companion(config);
  await companion.initialize();
  return companion;
}

/**
 * 默认导出
 */
export default Companion;
