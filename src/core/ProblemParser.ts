import { MemorySystem } from '../memory/MemorySystem.js';
import type { ProblemParseResult, MemoryRetrievalResult } from '../types/index.js';

/**
 * 问题解析层
 * 负责解析用户请求，识别意图和复杂度
 */
export class ProblemParser {
  private memory: MemorySystem;

  constructor(memory: MemorySystem) {
    this.memory = memory;
  }

  /**
   * 解析用户请求
   */
  async parse(userRequest: string, context?: string): Promise<ProblemParseResult> {
    const coreIntent = this.identifyIntent(userRequest);
    const complexityRating = this.assessComplexity(userRequest, coreIntent);
    const keyConstraints = this.identifyConstraints(userRequest, context);
    const strategy = this.determineStrategy(userRequest, complexityRating.level);

    // 从记忆系统检索相关信息
    const relatedMemories = await this.memory.retrieveMemories(userRequest);

    const needConfirmation = this.identifyAmbiguities(userRequest, context);

    return {
      originalRequest: userRequest,
      coreIntent,
      complexityRating,
      keyConstraints,
      strategy,
      needConfirmation,
      relatedMemories
    };
  }

  /**
   * 识别核心意图
   */
  private identifyIntent(request: string): string {
    const lowerRequest = request.toLowerCase();

    // 问题类型检测
    const patterns = {
      question: ['什么', '如何', '怎么', '为什么', 'what', 'how', 'why', 'explain'],
      fix: ['修复', '解决', 'bug', '错误', 'fix', 'solve', 'error'],
      implement: ['实现', '添加', '创建', 'implement', 'add', 'create', 'build'],
      refactor: ['重构', '优化', '改进', 'refactor', 'optimize', 'improve'],
      review: ['审查', '检查', 'review', 'check', 'analyze'],
      explain: ['解释', '说明', 'explain', 'describe'],
      compare: ['比较', '区别', 'compare', 'difference']
    };

    for (const [type, keywords] of Object.entries(patterns)) {
      for (const keyword of keywords) {
        if (lowerRequest.includes(keyword)) {
          return `${type}: ${request}`;
        }
      }
    }

    return `general: ${request}`;
  }

  /**
   * 评估复杂度
   */
  private assessComplexity(request: string, intent: string): ProblemParseResult['complexityRating'] {
    let level = 1;
    let estimatedTime: 'quick' | 'medium' | 'long' | 'multi-session' = 'quick';
    const requiredResources: string[] = [];

    // 基于关键词的复杂度评估
    const complexityIndicators = {
      high: ['系统', '架构', '重构', '设计', 'system', 'architecture', 'refactor', 'design'],
      medium: ['功能', '模块', '组件', 'feature', 'module', 'component'],
      low: ['问题', '错误', 'bug', 'error', 'fix']
    };

    for (const [levelName, keywords] of Object.entries(complexityIndicators)) {
      for (const keyword of keywords) {
        if (request.toLowerCase().includes(keyword)) {
          if (levelName === 'high') level = Math.max(level, 4);
          else if (levelName === 'medium') level = Math.max(level, 3);
          else level = Math.max(level, 2);
        }
      }
    }

    // 基于请求长度的复杂度调整
    if (request.length > 200) level = Math.max(level, 3);
    if (request.length > 500) level = Math.max(level, 4);

    // 确定时间估计
    if (level <= 2) estimatedTime = 'quick';
    else if (level === 3) estimatedTime = 'medium';
    else if (level === 4) estimatedTime = 'long';
    else estimatedTime = 'multi-session';

    // 确定所需资源
    if (intent.includes('implement') || intent.includes('refactor')) {
      requiredResources.push('编程');
    }
    if (intent.includes('review') || intent.includes('explain')) {
      requiredResources.push('分析');
    }
    if (intent.includes('design') || intent.includes('architecture')) {
      requiredResources.push('设计');
    }
    if (requiredResources.length === 0) {
      requiredResources.push('解答');
    }

    return { level: level as 1 | 2 | 3 | 4 | 5, estimatedTime, requiredResources };
  }

  /**
   * 识别约束条件
   */
  private identifyConstraints(request: string, context?: string): ProblemParseResult['keyConstraints'] {
    const hardConstraints: string[] = [];
    const softConstraints: string[] = [];

    // 检测明确的语言约束
    const languagePatterns = [
      { pattern: /使用?\s*([a-z+#]+)/i, type: 'hard' },
      { pattern: /用?\s*([a-z+#]+)/i, type: 'hard' },
      { pattern: /in\s+([a-z+#]+)/i, type: 'hard' }
    ];

    for (const { pattern, type } of languagePatterns) {
      const match = request.match(pattern);
      if (match) {
        const constraint = `使用语言: ${match[1]}`;
        if (type === 'hard') hardConstraints.push(constraint);
        else softConstraints.push(constraint);
      }
    }

    // 检测框架约束
    const frameworkPatterns = [
      /react|vue|angular/i,
      /express|fastapi|django/i,
      /tensorflow|pytorch/i
    ];

    for (const pattern of frameworkPatterns) {
      const match = request.match(pattern);
      if (match) {
        hardConstraints.push(`使用框架: ${match[0]}`);
      }
    }

    // 检测质量约束
    if (/高性能|性能要求|performance/i.test(request)) {
      softConstraints.push('考虑性能优化');
    }

    if (/安全|安全性|security/i.test(request)) {
      hardConstraints.push('确保安全性');
    }

    if (/可维护|maintainable/i.test(request)) {
      softConstraints.push('注重可维护性');
    }

    return { hardConstraints, softConstraints };
  }

  /**
   * 确定解决策略
   */
  private determineStrategy(request: string, complexityLevel: number): ProblemParseResult['strategy'] {
    let strategyType: 'direct-answer' | 'guided' | 'collaborative' | 'research' = 'direct-answer';
    const mainSteps: string[] = [];
    const potentialRisks: string[] = [];

    // 根据复杂度确定策略类型
    if (complexityLevel <= 2) {
      strategyType = 'direct-answer';
      mainSteps.push('分析请求', '提供解决方案');
    } else if (complexityLevel === 3) {
      strategyType = 'guided';
      mainSteps.push('理解需求', '制定方案', '实施验证');
    } else if (complexityLevel === 4) {
      strategyType = 'collaborative';
      mainSteps.push('需求分析', '方案设计', '分步实施', '测试验证');
    } else {
      strategyType = 'research';
      mainSteps.push('深入研究', '方案评估', '原型验证', '迭代优化');
    }

    // 识别潜在风险
    if (/新|新功能|不熟悉|unknown/i.test(request)) {
      potentialRisks.push('需求理解可能有偏差');
    }

    if (/复杂|系统|架构|complex|system/i.test(request)) {
      potentialRisks.push('实现复杂度可能超出预期');
      potentialRisks.push('可能需要分多次完成');
    }

    if (/性能|优化|performance|optimize/i.test(request)) {
      potentialRisks.push('优化效果可能需要 profiling 验证');
    }

    return { strategyType, mainSteps, potentialRisks };
  }

  /**
   * 识别需要确认的歧义
   */
  private identifyAmbiguities(request: string, context?: string): string[] {
    const ambiguities: string[] = [];

    // 检测模糊的要求
    if (!/\b(?:using|with|in|用|使用)\s+\w+/.test(request)) {
      ambiguities.push('需要明确使用的技术/语言');
    }

    if (/它|这个|this|it/i.test(request) && !context) {
      ambiguities.push('缺少上下文，不清楚"它/这个"指代什么');
    }

    if (/(?:好|最好|better|best)/i.test(request)) {
      ambiguities.push('需要明确"好"的评价标准（性能？可读性？维护性？）');
    }

    if (/简单|easy|quick/i.test(request)) {
      ambiguities.push('需要确认是追求简单实现还是简单维护');
    }

    return ambiguities;
  }

  /**
   * 生成解析结果摘要
   */
  generateSummary(parseResult: ProblemParseResult): string {
    const lines: string[] = [];

    lines.push('## 问题解析结果');
    lines.push('');
    lines.push(`**原始请求**: ${parseResult.originalRequest}`);
    lines.push('');
    lines.push(`**核心意图**: ${parseResult.coreIntent}`);
    lines.push('');
    lines.push('**复杂度评级**:');
    lines.push(`- 复杂度等级: ${'★'.repeat(parseResult.complexityRating.level)}${'☆'.repeat(5 - parseResult.complexityRating.level)}`);
    lines.push(`- 预估耗时: ${parseResult.complexityRating.estimatedTime}`);
    lines.push(`- 需要资源: ${parseResult.complexityRating.requiredResources.join(', ')}`);
    lines.push('');
    lines.push('**关键约束**:');
    lines.push(`- 硬性约束: ${parseResult.keyConstraints.hardConstraints.join(', ') || '无'}`);
    lines.push(`- 软性约束: ${parseResult.keyConstraints.softConstraints.join(', ') || '无'}`);
    lines.push('');
    lines.push('**解决策略**:');
    lines.push(`- 策略类型: ${parseResult.strategy.strategyType}`);
    lines.push(`- 主要步骤: ${parseResult.strategy.mainSteps.join(' → ')}`);
    lines.push('');

    if (parseResult.needConfirmation.length > 0) {
      lines.push('**需要确认**:');
      for (const item of parseResult.needConfirmation) {
        lines.push(`- ${item}`);
      }
      lines.push('');
    }

    return lines.join('\n');
  }
}
