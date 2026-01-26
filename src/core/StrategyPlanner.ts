import type { ProblemParseResult, StrategyPlan } from '../types/index.js';

/**
 * 策略规划层
 * 负责制定详细的行动计划
 */
export class StrategyPlanner {
  /**
   * 制定策略计划
   */
  plan(problemParse: ProblemParseResult, knowledge: {
    bestPractices: string[];
    similarProblems: string[];
    suggestedApproaches: string[];
  }): StrategyPlan {
    const requirementsBreakdown = this.breakdownRequirements(problemParse);
    const technologySelection = this.selectTechnologies(problemParse);
    const architectureDesign = this.designArchitecture(problemParse, knowledge);
    const riskAssessment = this.assessRisks(problemParse);
    const milestones = this.defineMilestones(problemParse, requirementsBreakdown);

    return {
      requirementsBreakdown,
      technologySelection,
      architectureDesign,
      riskAssessment,
      milestones
    };
  }

  /**
   * 分解需求
   */
  private breakdownRequirements(problemParse: ProblemParseResult): StrategyPlan['requirementsBreakdown'] {
    const requirements: StrategyPlan['requirementsBreakdown'] = [];
    const intent = problemParse.coreIntent;
    const request = problemParse.originalRequest;

    // 根据意图类型生成需求
    if (intent.includes('implement') || intent.includes('add')) {
      requirements.push({
        id: 'REQ-001',
        description: '实现核心功能',
        input: request,
        output: '可工作的代码实现',
        acceptanceCriteria: [
          '代码能够运行',
          '符合指定的编程语言和框架',
          '遵循最佳实践'
        ]
      });
    }

    if (intent.includes('refactor') || intent.includes('optimize')) {
      requirements.push({
        id: 'REQ-001',
        description: '重构现有代码',
        input: '待重构的代码',
        output: '改进后的代码',
        acceptanceCriteria: [
          '保持原有功能',
          '提高代码质量',
          '添加必要的测试'
        ]
      });
    }

    if (intent.includes('fix') || intent.includes('solve')) {
      requirements.push({
        id: 'REQ-001',
        description: '解决问题',
        input: '问题描述或错误信息',
        output: '问题解决方案',
        acceptanceCriteria: [
          '问题得到解决',
          '理解问题原因',
          '防止类似问题再次发生'
        ]
      });
    }

    // 添加测试需求
    if (problemParse.complexityRating.level >= 3) {
      requirements.push({
        id: 'REQ-002',
        description: '添加测试',
        input: '实现的功能',
        output: '测试代码',
        acceptanceCriteria: [
          '覆盖主要功能',
          '包含边界情况',
          '测试可重复运行'
        ]
      });
    }

    // 添加文档需求
    if (problemParse.complexityRating.level >= 4) {
      requirements.push({
        id: 'REQ-003',
        description: '编写文档',
        input: '实现的代码',
        output: '使用文档',
        acceptanceCriteria: [
          '说明如何使用',
          '包含示例代码',
          '说明配置要求'
        ]
      });
    }

    return requirements;
  }

  /**
   * 选择技术方案
   */
  private selectTechnologies(problemParse: ProblemParseResult): StrategyPlan['technologySelection'] {
    const options: StrategyPlan['technologySelection'] = [];
    const hardConstraints = problemParse.keyConstraints.hardConstraints;

    // 解析硬性约束中的技术要求
    let requiredLanguage: string | null = null;
    let requiredFramework: string | null = null;

    for (const constraint of hardConstraints) {
      if (constraint.includes('使用语言:')) {
        requiredLanguage = constraint.split(':')[1]?.trim();
      }
      if (constraint.includes('使用框架:')) {
        requiredFramework = constraint.split(':')[1]?.trim();
      }
    }

    // 语言选择
    if (requiredLanguage) {
      options.push({
        name: `使用 ${requiredLanguage}`,
        pros: ['符合要求', '用户指定'],
        cons: [],
        recommendation: true
      });
    } else {
      options.push({
        name: '使用 TypeScript',
        pros: ['类型安全', '良好的 IDE 支持', '广泛的生态系统'],
        cons: ['需要编译步骤'],
        recommendation: true
      });
      options.push({
        name: '使用 Python',
        pros: ['简洁易读', '丰富的库', '快速开发'],
        cons: ['运行时类型检查'],
        recommendation: false
      });
    }

    // 框架选择（如果适用）
    if (requiredFramework) {
      options.push({
        name: `使用 ${requiredFramework}`,
        pros: ['符合要求', '用户指定'],
        cons: [],
        recommendation: true
      });
    }

    return options;
  }

  /**
   * 设计架构
   */
  private designArchitecture(
    problemParse: ProblemParseResult,
    knowledge: { bestPractices: string[]; suggestedApproaches: string[] }
  ): StrategyPlan['architectureDesign'] {
    const complexity = problemParse.complexityRating.level;
    const modules: StrategyPlan['architectureDesign']['modules'] = [];

    // 根据复杂度设计模块
    if (complexity <= 2) {
      // 简单任务：单模块
      modules.push({
        name: '主模块',
        purpose: '实现核心功能',
        dependencies: []
      });
    } else if (complexity === 3) {
      // 中等复杂：核心 + 辅助
      modules.push({
        name: '核心模块',
        purpose: '实现主要功能',
        dependencies: []
      });
      modules.push({
        name: '辅助模块',
        purpose: '提供工具函数',
        dependencies: ['核心模块']
      });
    } else {
      // 高复杂：多模块架构
      modules.push({
        name: '入口模块',
        purpose: '处理用户输入和输出',
        dependencies: ['业务逻辑模块']
      });
      modules.push({
        name: '业务逻辑模块',
        purpose: '实现核心业务逻辑',
        dependencies: ['数据访问模块']
      });
      modules.push({
        name: '数据访问模块',
        purpose: '处理数据存储和检索',
        dependencies: []
      });
      modules.push({
        name: '工具模块',
        purpose: '提供通用工具函数',
        dependencies: []
      });
    }

    return {
      modules,
      dataFlow: this.designDataFlow(modules),
      interfaces: this.defineInterfaces(modules),
      extensibility: knowledge.suggestedApproaches
    };
  }

  /**
   * 设计数据流
   */
  private designDataFlow(modules: StrategyPlan['architectureDesign']['modules']): string {
    if (modules.length === 1) {
      return '输入 → 处理 → 输出';
    }

    const flow = modules.map(m => m.name).join(' → ');
    return `用户输入 → ${flow} → 结果输出`;
  }

  /**
   * 定义接口
   */
  private defineInterfaces(modules: StrategyPlan['architectureDesign']['modules']): StrategyPlan['architectureDesign']['interfaces'] {
    const interfaces: StrategyPlan['architectureDesign']['interfaces'] = [];

    for (const module of modules) {
      for (const dep of module.dependencies) {
        interfaces.push({
          name: `${module.name} → ${dep}`,
          input: `${module.name} 的请求`,
          output: `${dep} 的响应`
        });
      }
    }

    return interfaces;
  }

  /**
   * 评估风险
   */
  private assessRisks(problemParse: ProblemParseResult): StrategyPlan['riskAssessment'] {
    const risks: StrategyPlan['riskAssessment'] = [];
    const complexity = problemParse.complexityRating.level;

    // 复杂度相关风险
    if (complexity >= 4) {
      risks.push({
        id: 'RISK-001',
        description: '实现复杂度可能超出预期',
        probability: 'medium',
        impact: 'medium',
        mitigation: '分阶段实现，定期验证'
      });
    }

    // 策略中的潜在风险
    for (let i = 0; i < problemParse.strategy.potentialRisks.length; i++) {
      risks.push({
        id: `RISK-${String(i + 1).padStart(3, '0')}`,
        description: problemParse.strategy.potentialRisks[i],
        probability: 'medium',
        impact: 'low',
        mitigation: '持续沟通，及时调整'
      });
    }

    // 通用风险
    if (problemParse.keyConstraints.hardConstraints.length === 0) {
      risks.push({
        id: 'RISK-GEN-001',
        description: '需求理解可能有偏差',
        probability: 'low',
        impact: 'medium',
        mitigation: '实现前确认需求细节'
      });
    }

    return risks;
  }

  /**
   * 定义里程碑
   */
  private defineMilestones(
    problemParse: ProblemParseResult,
    requirements: StrategyPlan['requirementsBreakdown']
  ): StrategyPlan['milestones'] {
    const milestones: StrategyPlan['milestones'] = [];
    const complexity = problemParse.complexityRating.level;

    // 基础里程碑
    milestones.push({
      id: 'MS-001',
      name: '需求确认',
      description: '明确所有需求细节',
      criteria: problemParse.needConfirmation.length > 0
        ? ['所有待确认问题得到解答']
        : ['需求清晰明确']
    });

    // 方案里程碑
    if (complexity >= 3) {
      milestones.push({
        id: 'MS-002',
        name: '方案设计',
        description: '完成详细的技术方案设计',
        criteria: ['技术选型确定', '架构设计完成', '接口定义明确']
      });
    }

    // 实现里程碑
    milestones.push({
      id: `MS-${String(milestones.length + 1).padStart(3, '0')}`,
      name: '核心实现',
      description: '完成主要功能实现',
      criteria: requirements.map(r => r.description + '完成')
    });

    // 验证里程碑
    milestones.push({
      id: `MS-${String(milestones.length + 1).padStart(3, '0')}`,
      name: '验证测试',
      description: '完成功能和性能验证',
      criteria: ['功能正常工作', '测试通过', '性能满足要求']
    });

    return milestones;
  }

  /**
   * 生成计划摘要
   */
  generatePlanSummary(plan: StrategyPlan): string {
    const lines: string[] = [];

    lines.push('## 策略计划');
    lines.push('');

    // 需求分解
    lines.push('### 需求分解');
    lines.push('');
    for (const req of plan.requirementsBreakdown) {
      lines.push(`- **${req.id}: ${req.description}**`);
      lines.push(`  - 输入: ${req.input}`);
      lines.push(`  - 输出: ${req.output}`);
      lines.push(`  - 验收标准:`);
      for (const criteria of req.acceptanceCriteria) {
        lines.push(`    - ${criteria}`);
      }
      lines.push('');
    }

    // 技术选择
    if (plan.technologySelection.length > 0) {
      lines.push('### 技术选择');
      lines.push('');
      for (const tech of plan.technologySelection) {
        const rec = tech.recommendation ? ' ✓' : '';
        lines.push(`- **${tech.name}${rec}**`);
        if (tech.pros.length > 0) {
          lines.push(`  - 优点: ${tech.pros.join(', ')}`);
        }
        if (tech.cons.length > 0) {
          lines.push(`  - 缺点: ${tech.cons.join(', ')}`);
        }
      }
      lines.push('');
    }

    // 架构设计
    lines.push('### 架构设计');
    lines.push('');
    lines.push('**模块结构:**');
    for (const module of plan.architectureDesign.modules) {
      lines.push(`- ${module.name}: ${module.purpose}`);
      if (module.dependencies.length > 0) {
        lines.push(`  - 依赖: ${module.dependencies.join(', ')}`);
      }
    }
    lines.push('');
    lines.push(`**数据流:** ${plan.architectureDesign.dataFlow}`);
    lines.push('');

    // 风险评估
    if (plan.riskAssessment.length > 0) {
      lines.push('### 风险评估');
      lines.push('');
      lines.push('| 风险 | 概率 | 影响 | 缓解措施 |');
      lines.push('|------|------|------|----------|');
      for (const risk of plan.riskAssessment) {
        lines.push(`| ${risk.description} | ${risk.probability} | ${risk.impact} | ${risk.mitigation} |`);
      }
      lines.push('');
    }

    // 里程碑
    lines.push('### 里程碑');
    lines.push('');
    for (const ms of plan.milestones) {
      lines.push(`- **${ms.name}** (${ms.id})`);
      lines.push(`  - ${ms.description}`);
      lines.push(`  - 标准:`);
      for (const criteria of ms.criteria) {
        lines.push(`    - ${criteria}`);
      }
      lines.push('');
    }

    return lines.join('\n');
  }
}
