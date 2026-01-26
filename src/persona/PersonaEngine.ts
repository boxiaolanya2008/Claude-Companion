import { PersonaManager } from './PersonaManager.js';
import { MemorySystem } from '../memory/MemorySystem.js';
import { generateCodeStylePrompt } from '../config/CodeStyleGuide.js';
import { AestheticsEngine } from '../config/AestheticsEngine.js';
import type { Persona, PersonaType, PersonaSwitchContext, CompanionOutput, CodeStyleConfig, AestheticsConfig } from '../types/index.js';

/**
 * 人格引擎
 * 协调人格切换和人格化响应生成
 */
export class PersonaEngine {
  private personaManager: PersonaManager;
  private memory: MemorySystem;
  private codeStyleConfig: CodeStyleConfig;
  private codeStylePrompt: string;
  private aestheticsEngine: AestheticsEngine | null = null;

  constructor(memory: MemorySystem, defaultPersona: PersonaType = 'efficient-partner', codeStyleConfig?: CodeStyleConfig, aestheticsConfig?: AestheticsConfig) {
    this.memory = memory;
    this.personaManager = new PersonaManager(defaultPersona);
    this.codeStyleConfig = codeStyleConfig || {
      usePlainLanguage: true,
      showCallRelations: true,
      showDataFlow: true,
      explainWhy: true,
      includeUsageExamples: true,
      descriptiveNames: true,
      avoidAbbreviations: true,
      contextualNaming: true,
      includeErrorHandling: true,
      includeBoundaryChecks: true,
      includeLogging: true
    };
    this.codeStylePrompt = generateCodeStylePrompt();

    // 初始化美化引擎
    if (aestheticsConfig) {
      this.aestheticsEngine = new AestheticsEngine(aestheticsConfig);
    }
  }

  /**
   * 初始化
   */
  async initialize(): Promise<void> {
    // 加载用户偏好的人格设置
    const prefs = this.memory.getUserPreferences();
    if (prefs?.preferences.persona.defaultMode) {
      this.personaManager.switchPersona(prefs.preferences.persona.defaultMode, 'user-preference');
    }
  }

  /**
   * 处理请求并生成人格化响应
   */
  async processRequest(request: string, context?: {
    taskType?: string;
    complexity?: number;
    userMood?: string;
    forcePersona?: PersonaType;
  }): Promise<{
    persona: Persona;
    response: string;
    switched: boolean;
    previousPersona?: PersonaType;
  }> {
    const previousPersona = this.personaManager.getCurrentPersona().type;
    let switched = false;

    // 如果强制指定人格
    if (context?.forcePersona) {
      this.personaManager.switchPersona(context.forcePersona, 'forced');
      switched = true;
    } else {
      // 自动检测人格
      const switchContext: PersonaSwitchContext = {
        taskType: context?.taskType,
        userRequest: request,
        currentMood: context?.userMood,
        complexity: context?.complexity
      };

      const detected = this.personaManager.autoDetectAndSwitch(switchContext);
      if (detected) {
        switched = true;
      }
    }

    const currentPersona = this.personaManager.getCurrentPersona();

    // 生成人格化响应
    const response = this.generatePersonalizedResponse(request, currentPersona);

    return {
      persona: currentPersona,
      response,
      switched,
      previousPersona: switched ? previousPersona : undefined
    };
  }

  /**
   * 生成人格化响应
   */
  private generatePersonalizedResponse(request: string, persona: Persona): string {
    // 根据人格类型调整响应风格
    const lines: string[] = [];

    // 添加人格特质
    switch (persona.type) {
      case 'professional-mentor':
        lines.push(this.generateMentorResponse(request));
        break;

      case 'efficient-partner':
        lines.push(this.generatePartnerResponse(request));
        break;

      case 'architect':
        lines.push(this.generateArchitectResponse(request));
        break;

      case 'explorer':
        lines.push(this.generateExplorerResponse(request));
        break;
    }

    return lines.join('\n');
  }

  /**
   * 生成导师风格响应
   */
  private generateMentorResponse(request: string): string {
    return `让我来帮助你理解这个问题。

首先，让我们明确一下你想要解决的核心问题是什么。

然后，我会用简单易懂的方式解释相关的概念。

接着，我们可以看一些实际的例子来加深理解。

最后，我鼓励你自己尝试解决类似的问题，这样能更好地掌握知识。

在这个过程中，如果遇到任何不理解的地方，随时问我！`;
  }

  /**
   * 生成搭档风格响应
   */
  private generatePartnerResponse(request: string): string {
    return `明白了，我来处理这个任务。

核心方案：
- 分析需求
- 实现解决方案
- 验证结果

让我们直接开始。需要我详细说明哪个部分吗？`;
  }

  /**
   * 生成架构师风格响应
   */
  private generateArchitectResponse(request: string): string {
    return `让我们从架构层面来分析这个问题。

**系统边界分析**
首先明确问题的范围和约束条件。

**核心需求识别**
识别关键功能点和非功能性需求。

**方案设计**
- 模块划分
- 接口定义
- 数据流设计

**权衡考量**
从可扩展性、可维护性、性能等方面评估。

**演进路径**
考虑未来的发展方向。

这个方案可以满足当前需求，同时为未来演进留有空间。`;
  }

  /**
   * 生成探索者风格响应
   */
  private generateExplorerResponse(request: string): string {
    return `这是个有趣的问题，让我们一起来探索！

我发现了几个值得尝试的方向：

**方向一**
让我们先看看这个可能性...

**方向二**
或者，我们可以尝试另一种方式...

**实验验证**
最好的方式是实际尝试一下，看看结果如何！

**从结果中学习**
无论结果如何，我们都能获得新的见解。

让我们开始探索吧！`;
  }

  /**
   * 手动切换人格
   */
  switchPersona(personaType: PersonaType, reason: string = 'manual'): Persona {
    return this.personaManager.switchPersona(personaType, reason);
  }

  /**
   * 获取当前人格
   */
  getCurrentPersona(): Persona {
    return this.personaManager.getCurrentPersona();
  }

  /**
   * 获取所有可用人格
   */
  getAvailablePersonas(): Persona[] {
    return this.personaManager.getAllPersonas();
  }

  /**
   * 获取人格统计
   */
  getPersonaStats() {
    return this.personaManager.getPersonaStats();
  }

  /**
   * 获取切换历史
   */
  getSwitchHistory() {
    return this.personaManager.getSwitchHistory();
  }

  /**
   * 处理用户反馈并调整人格
   */
  processFeedback(feedback: {
    positive?: boolean;
    detail?: 'too-much' | 'too-little' | 'just-right';
    tone?: 'too-formal' | 'too-casual' | 'just-right';
  }): PersonaType | null {
    const result = this.personaManager.adjustPersonaBasedOnFeedback(feedback);

    // 如果有切换，更新用户偏好
    if (result) {
      // 更新记忆中的用户偏好
      // 这里可以添加逻辑来持久化用户的偏好变化
    }

    return result;
  }

  /**
   * 格式化响应为完整输出
   */
  formatOutput(content: string, persona?: Persona): CompanionOutput {
    const activePersona = persona || this.getCurrentPersona();

    return {
      response: this.personaManager.generatePersonalizedResponse(content, activePersona),
      persona: activePersona.type,
      emotions: [], // 情感系统可以添加
      toolsUsed: [],
      memoryUpdates: [],
      followUpSuggestions: this.generateFollowUpSuggestions(activePersona)
    };
  }

  /**
   * 生成后续建议
   */
  private generateFollowUpSuggestions(persona: Persona): string[] {
    const suggestions: string[] = [];

    switch (persona.type) {
      case 'professional-mentor':
        suggestions.push('尝试自己解决类似问题');
        suggestions.push('深入了解相关概念');
        break;

      case 'efficient-partner':
        suggestions.push('开始实施');
        suggestions.push('运行测试验证');
        break;

      case 'architect':
        suggestions.push('详细设计模块');
        suggestions.push('评估技术选型');
        break;

      case 'explorer':
        suggestions.push('尝试其他可能性');
        suggestions.push('记录探索结果');
        break;
    }

    return suggestions;
  }

  /**
   * 获取人格管理器
   */
  getPersonaManager(): PersonaManager {
    return this.personaManager;
  }

  /**
   * 获取代码风格提示词
   * 在需要生成代码时调用此方法获取完整的代码风格指南
   */
  getCodeStylePrompt(): string {
    return this.codeStylePrompt;
  }

  /**
   * 更新代码风格配置
   */
  updateCodeStyle(config: Partial<CodeStyleConfig>): void {
    this.codeStyleConfig = { ...this.codeStyleConfig, ...config };
    this.codeStylePrompt = generateCodeStylePrompt();
  }

  /**
   * 获取当前代码风格配置
   */
  getCodeStyleConfig(): CodeStyleConfig {
    return { ...this.codeStyleConfig };
  }

  /**
   * 检测请求是否包含代码生成需求
   */
  isCodeRelatedRequest(request: string): boolean {
    const codePatterns = [
      /写.*代码|实现|编程|开发/i,
      /函数|方法|类|接口/i,
      /bug|调试|错误/i,
      /优化|重构/i,
      /算法|数据结构/i,
      /API|接口/i,
      /前端|后端|全栈/i,
      /JavaScript|TypeScript|Python|Java|Go|Rust/i,
      /React|Vue|Angular|Node/i
    ];

    return codePatterns.some(pattern => pattern.test(request));
  }

  /**
   * 为代码相关请求添加风格指南
   */
  enhanceRequestWithCodeStyle(request: string): string {
    if (this.isCodeRelatedRequest(request)) {
      return `${request}\n\n${this.getCodeStylePrompt()}`;
    }
    return request;
  }

  /**
   * 为UI相关请求添加美化指南
   */
  enhanceRequestWithAesthetics(request: string): string {
    if (!this.aestheticsEngine) {
      return request;
    }

    return this.aestheticsEngine.enhanceRequestWithAesthetics(request);
  }

  /**
   * 检测请求是否是UI相关
   */
  isUIRelatedRequest(request: string): boolean {
    if (!this.aestheticsEngine) {
      return false;
    }

    const analysis = this.aestheticsEngine.analyzeRequest(request);
    return analysis.isUIRelated;
  }

  /**
   * 获取美化引擎
   */
  getAestheticsEngine(): AestheticsEngine | null {
    return this.aestheticsEngine;
  }

  /**
   * 获取美化建议
   */
  getAestheticsSuggestions(request: string): string[] {
    if (!this.aestheticsEngine) {
      return [];
    }

    return this.aestheticsEngine.generateSuggestions(request);
  }

  /**
   * 增强请求（应用所有相关的指南）
   */
  enhanceRequest(request: string): string {
    let enhanced = request;

    // 代码风格增强
    if (this.isCodeRelatedRequest(request)) {
      enhanced = this.enhanceRequestWithCodeStyle(enhanced);
    }

    // 美化增强
    if (this.isUIRelatedRequest(enhanced)) {
      enhanced = this.enhanceRequestWithAesthetics(enhanced);
    }

    return enhanced;
  }
}
