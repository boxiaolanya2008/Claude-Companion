/**
 * 自动调用引擎
 * 智能分析用户输入，自动决定调用哪些 Companion 功能
 */

import type { Companion } from '../Companion.js';

/**
 * 输入分析结果
 */
export interface InputAnalysis {
  // 是否需要深度思考
  needsDeepThinking: boolean;
  // 是否需要切换人格
  needsPersonaSwitch: boolean;
  // 推荐的人格
  recommendedPersona: 'professional-mentor' | 'efficient-partner' | 'architect' | 'explorer' | null;
  // 是否需要保存记忆
  needsMemorySave: boolean;
  // 复杂度评级 (1-5)
  complexityLevel: number;
  // 情绪强度
  emotionIntensity: 'low' | 'medium' | 'high';
  // 需要的工具
  requiredTools: string[];
}

/**
 * 自动调用配置
 */
export interface AutoCallConfig {
  // 是否启用自动人格切换
  autoPersonaSwitch: boolean;
  // 是否启用自动深度思考
  autoDeepThinking: boolean;
  // 是否启用自动记忆保存
  autoMemorySave: boolean;
  // 触发深度思考的最小复杂度
  deepThinkingThreshold: number;
  // 情绪响应强度阈值
  emotionThreshold: number;
}

/**
 * 自动调用引擎
 */
export class AutoCallEngine {
  private config: AutoCallConfig;
  private companion: Companion;

  constructor(companion: Companion, config?: Partial<AutoCallConfig>) {
    this.companion = companion;
    this.config = {
      autoPersonaSwitch: true,
      autoDeepThinking: true,
      autoMemorySave: true,
      deepThinkingThreshold: 3,
      emotionThreshold: 0.6,
      ...config
    };
  }

  /**
   * 分析用户输入
   */
  analyzeInput(message: string): InputAnalysis {
    const analysis: InputAnalysis = {
      needsDeepThinking: false,
      needsPersonaSwitch: false,
      recommendedPersona: null,
      needsMemorySave: false,
      complexityLevel: 1,
      emotionIntensity: 'low',
      requiredTools: []
    };

    // 1. 检测复杂度
    analysis.complexityLevel = this.detectComplexity(message);
    analysis.needsDeepThinking = analysis.complexityLevel >= this.config.deepThinkingThreshold;

    // 2. 检测情绪
    analysis.emotionIntensity = this.detectEmotionIntensity(message);

    // 3. 检测推荐人格
    analysis.recommendedPersona = this.detectPersona(message);
    analysis.needsPersonaSwitch = analysis.recommendedPersona !== null;

    // 4. 检测是否需要保存
    analysis.needsMemorySave = this.shouldSaveMemory(message);

    // 5. 检测需要的工具
    analysis.requiredTools = this.detectRequiredTools(message);

    return analysis;
  }

  /**
   * 自动处理用户输入
   */
  async autoProcess(message: string, context?: {
    language?: string;
    framework?: string;
    conversationId?: string;
  }): Promise<{
    response: string;
    analysis: InputAnalysis;
    actions: string[];
  }> {
    const analysis = this.analyzeInput(message);
    const actions: string[] = [];

    // 1. 自动切换人格（如果需要）
    if (analysis.needsPersonaSwitch && this.config.autoPersonaSwitch && analysis.recommendedPersona) {
      const currentPersona = this.companion.getCurrentPersona().type;
      if (currentPersona !== analysis.recommendedPersona) {
        this.companion.switchPersona(analysis.recommendedPersona);
        actions.push(`自动切换人格: ${currentPersona} -> ${analysis.recommendedPersona}`);
      }
    }

    // 2. 处理消息
    const result = await this.companion.process({
      message,
      context
    });

    // 3. 自动保存记忆（如果需要）
    if (analysis.needsMemorySave && this.config.autoMemorySave) {
      await this.companion.save();
      actions.push('自动保存记忆');
    }

    return {
      response: result.response,
      analysis,
      actions
    };
  }

  /**
   * 检测消息复杂度 (1-5)
   */
  private detectComplexity(message: string): number {
    let complexity = 1;

    // 长度检测
    if (message.length > 200) complexity += 1;
    if (message.length > 500) complexity += 1;

    // 问题类型检测
    const complexPatterns = [
      /如何.*设计/i,
      /架构|系统/i,
      /实现.*功能/i,
      /优化.*性能/i,
      /为什么.*不/i,
      /比较.*差异/i,
      /分析.*问题/i,
      /最佳实践/i
    ];

    for (const pattern of complexPatterns) {
      if (pattern.test(message)) complexity += 0.5;
    }

    // 多步骤问题
    if (message.includes('然后') || message.includes('接着') || message.includes('最后')) {
      complexity += 1;
    }

    // 技术术语密度
    const techTerms = /API|数据库|算法|架构|框架|模式|异步|并发|分布式|微服务/gi;
    const matches = message.match(techTerms);
    if (matches && matches.length > 3) complexity += 0.5;

    return Math.min(5, Math.round(complexity));
  }

  /**
   * 检测情绪强度
   */
  private detectEmotionIntensity(message: string): 'low' | 'medium' | 'high' {
    const highEmotionPatterns = [
      /!!!|！{3,}/,
      /非常|特别|极其/i,
      /着急|焦虑|担心|困扰/i,
      /太.*了|好.*啊/i
    ];

    const mediumEmotionPatterns = [
      /!|！/,
      /有点|有些/i,
      /希望|想要|需要/i
    ];

    for (const pattern of highEmotionPatterns) {
      if (pattern.test(message)) return 'high';
    }

    for (const pattern of mediumEmotionPatterns) {
      if (pattern.test(message)) return 'medium';
    }

    return 'low';
  }

  /**
   * 检测推荐人格
   */
  private detectPersona(message: string): 'professional-mentor' | 'efficient-partner' | 'architect' | 'explorer' | null {
    // 探索者模式 - 学习、研究新事物
    const explorerPatterns = [
      /探索|研究|学习|了解/i,
      /新.*技术|最新/i,
      /尝试.*新/i,
      /好奇|想知道/i
    ];

    // 专业导师模式 - 教学、解释概念
    const mentorPatterns = [
      /解释|说明|教|讲讲/i,
      /什么是|如何|怎么.*理解/i,
      /帮我学|指导/i,
      /不懂|不理解/i
    ];

    // 架构师模式 - 系统设计、技术选型
    const architectPatterns = [
      /架构|设计|系统/i,
      /技术选型|方案/i,
      /规划|蓝图/i,
      /可扩展|可维护/i
    ];

    // 高效搭档模式 - 快速实现、日常开发
    const partnerPatterns = [
      /实现|写代码|开发/i,
      /快速|简单/i,
      /帮我.*一下/i,
      /bug|问题|错误/i
    ];

    // 按优先级检测
    if (this.matchAny(message, explorerPatterns)) return 'explorer';
    if (this.matchAny(message, mentorPatterns)) return 'professional-mentor';
    if (this.matchAny(message, architectPatterns)) return 'architect';
    if (this.matchAny(message, partnerPatterns)) return 'efficient-partner';

    return null;
  }

  /**
   * 检测是否应该保存记忆
   */
  private shouldSaveMemory(message: string): boolean {
    const savePatterns = [
      /记住|保存|记录/i,
      /以后.*这样|下次/i,
      /重要|关键/i,
      /决定|选择/i
    ];

    return this.matchAny(message, savePatterns);
  }

  /**
   * 检测需要的工具
   */
  private detectRequiredTools(message: string): string[] {
    const tools: string[] = [];

    if (/代码|编程|实现/i.test(message)) tools.push('programming');
    if (/分析|思考|推理/i.test(message)) tools.push('reasoning');
    if (/搜索|查找|文档/i.test(message)) tools.push('search');
    if (/文件|读写/i.test(message)) tools.push('file-operations');

    return tools;
  }

  /**
   * 匹配任意模式
   */
  private matchAny(text: string, patterns: RegExp[]): boolean {
    return patterns.some(pattern => pattern.test(text));
  }

  /**
   * 更新配置
   */
  updateConfig(config: Partial<AutoCallConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * 获取当前配置
   */
  getConfig(): AutoCallConfig {
    return { ...this.config };
  }

  /**
   * 生成分析报告
   */
  generateAnalysisReport(analysis: InputAnalysis): string {
    const lines: string[] = [];

    lines.push('## 输入分析报告');
    lines.push('');
    lines.push(`- 复杂度: ${analysis.complexityLevel}/5`);
    lines.push(`- 需要深度思考: ${analysis.needsDeepThinking ? '是' : '否'}`);
    lines.push(`- 需要人格切换: ${analysis.needsPersonaSwitch ? '是' : '否'}`);
    if (analysis.recommendedPersona) {
      lines.push(`- 推荐人格: ${analysis.recommendedPersona}`);
    }
    lines.push(`- 情绪强度: ${analysis.emotionIntensity}`);
    lines.push(`- 需要保存记忆: ${analysis.needsMemorySave ? '是' : '否'}`);
    if (analysis.requiredTools.length > 0) {
      lines.push(`- 需要的工具: ${analysis.requiredTools.join(', ')}`);
    }

    return lines.join('\n');
  }
}
