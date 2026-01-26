import type { StrategyPlan } from '../types/index.js';

/**
 * 执行推理层
 * 负责逐步推导和验证
 */
export class ExecutionReasoner {
  private executionLog: string[] = [];
  private verificationResults: Map<string, boolean> = new Map();

  /**
   * 执行推理
   */
  async execute(
    plan: StrategyPlan,
    context: {
      language?: string;
      framework?: string;
      userPreferences?: Record<string, unknown>;
    }
  ): Promise<{
    steps: string[];
    reasoning: string[];
    verifications: Array<{ step: string; passed: boolean; notes: string }>;
    adjustments: string[];
  }> {
    const steps: string[] = [];
    const reasoning: string[] = [];
    const verifications: Array<{ step: string; passed: boolean; notes: string }> = [];
    const adjustments: string[] = [];

    this.executionLog = [];

    // 按里程碑执行
    for (const milestone of plan.milestones) {
      this.executionLog.push(`开始: ${milestone.name}`);

      // 确定执行步骤
      const milestoneSteps = this.planMilestoneSteps(milestone, plan);
      steps.push(...milestoneSteps);

      // 推理过程
      const milestoneReasoning = this.reasonAboutSteps(milestoneSteps, context);
      reasoning.push(...milestoneReasoning);

      // 验证关键点
      const verification = await this.verifyMilestone(milestone, plan);
      verifications.push(verification);

      if (!verification.passed) {
        const adjustment = this.planAdjustment(verification);
        adjustments.push(adjustment);
      }
    }

    return {
      steps: this.executionLog.concat(steps),
      reasoning,
      verifications,
      adjustments
    };
  }

  /**
   * 规划里程碑的执行步骤
   */
  private planMilestoneSteps(
    milestone: StrategyPlan['milestones'][0],
    plan: StrategyPlan
  ): string[] {
    const steps: string[] = [];

    switch (milestone.name) {
      case '需求确认':
        steps.push('1. 分析原始请求');
        steps.push('2. 识别关键需求');
        steps.push('3. 确认技术约束');
        steps.push('4. 验证需求完整性');
        break;

      case '方案设计':
        steps.push('1. 分析技术选项');
        steps.push('2. 设计模块结构');
        steps.push('3. 定义接口');
        steps.push('4. 规划数据流');
        break;

      case '核心实现':
        for (const req of plan.requirementsBreakdown) {
          steps.push(`实现: ${req.description}`);
        }
        break;

      case '验证测试':
        steps.push('1. 单元测试');
        steps.push('2. 集成测试');
        steps.push('3. 边界情况测试');
        steps.push('4. 性能测试');
        break;

      default:
        steps.push(`执行 ${milestone.name} 的相关步骤`);
    }

    return steps;
  }

  /**
   * 对步骤进行推理
   */
  private reasonAboutSteps(
    steps: string[],
    context: {
      language?: string;
      framework?: string;
      userPreferences?: Record<string, unknown>;
    }
  ): string[] {
    const reasoning: string[] = [];

    for (const step of steps) {
      // 为什么选择这个步骤
      reasoning.push(`**${step}**: 这是完成目标的必要步骤`);

      // 可能出现的结果
      if (step.includes('实现')) {
        reasoning.push(`  - 预期: 生成可工作的代码`);
        reasoning.push(`  - 风险: 可能遇到语法或逻辑错误`);
      } else if (step.includes('测试')) {
        reasoning.push(`  - 预期: 发现潜在问题`);
        reasoning.push(`  - 风险: 测试可能不全面`);
      } else if (step.includes('设计')) {
        reasoning.push(`  - 预期: 清晰的架构`);
        reasoning.push(`  - 风险: 可能需要迭代优化`);
      }

      // 应对意外
      reasoning.push(`  - 应对: 如果失败，分析原因并调整方法`);
    }

    return reasoning;
  }

  /**
   * 验证里程碑
   */
  private async verifyMilestone(
    milestone: StrategyPlan['milestones'][0],
    plan: StrategyPlan
  ): Promise<{ step: string; passed: boolean; notes: string }> {
    const verification = {
      step: milestone.name,
      passed: true,
      notes: ''
    };

    // 根据里程碑类型进行验证
    switch (milestone.name) {
      case '需求确认':
        verification.passed = plan.requirementsBreakdown.length > 0;
        verification.notes = verification.passed
          ? '需求已明确定义'
          : '需求不够清晰，需要进一步确认';
        break;

      case '方案设计':
        verification.passed = plan.architectureDesign.modules.length > 0;
        verification.notes = verification.passed
          ? '架构设计已完成'
          : '架构设计不够完整';
        break;

      case '核心实现':
        // 实际实现时需要检查代码是否生成
        verification.passed = true; // 占位
        verification.notes = '需要在实际实现时验证';
        break;

      case '验证测试':
        // 实际实现时需要运行测试
        verification.passed = true; // 占位
        verification.notes = '需要在实际运行时验证';
        break;

      default:
        verification.passed = milestone.criteria.length > 0;
        verification.notes = '里程碑定义完整';
    }

    this.verificationResults.set(milestone.id, verification.passed);

    return verification;
  }

  /**
   * 规划调整
   */
  private planAdjustment(verification: { step: string; passed: boolean; notes: string }): string {
    if (verification.passed) {
      return '';
    }

    return `调整 ${verification.step}: ${verification.notes}。建议: 回顾之前的步骤，重新评估方法。`;
  }

  /**
   * 模拟代码执行推理
   */
  reasonAboutCode(code: string, language?: string): {
    analysis: string;
    potentialIssues: string[];
    suggestions: string[];
  } {
    const analysis: string[] = [];
    const potentialIssues: string[] = [];
    const suggestions: string[] = [];

    // 基础分析
    const lineCount = code.split('\n').length;
    analysis.push(`代码行数: ${lineCount}`);

    if (lineCount > 100) {
      potentialIssues.push('代码较长，建议拆分为更小的函数');
    }

    // 检查常见模式
    if (/console\.log/.test(code)) {
      potentialIssues.push('包含调试日志，建议在生产环境中移除');
    }

    if (/any/.test(code) && language === 'typescript') {
      potentialIssues.push('使用了 any 类型，建议使用更具体的类型');
    }

    if (!/return/.test(code) && !/void/.test(code)) {
      suggestions.push('考虑函数的返回值');
    }

    // 建议改进
    if (code.includes('TODO') || code.includes('FIXME')) {
      suggestions.push('代码包含待办项，建议完成后再提交');
    }

    suggestions.push('考虑添加错误处理');
    suggestions.push('考虑添加单元测试');

    return {
      analysis: analysis.join('\n'),
      potentialIssues,
      suggestions
    };
  }

  /**
   * 边界情况思考
   */
  considerEdgeCases(context: string): string[] {
    const edgeCases: string[] = [];

    // 通用边界情况
    edgeCases.push('输入为空或 null 的情况');
    edgeCases.push('输入格式不正确的情况');
    edgeCases.push('并发访问的情况');
    edgeCases.push('资源耗尽的情况');

    // 基于上下文的边界情况
    if (/文件|file/i.test(context)) {
      edgeCases.push('文件不存在的情况');
      edgeCases.push('文件权限不足的情况');
      edgeCases.push('文件被占用的情况');
    }

    if (/网络|network|http|api/i.test(context)) {
      edgeCases.push('网络超时的情况');
      edgeCases.push('服务不可用的情况');
      edgeCases.push('响应格式异常的情况');
    }

    if (/数据库|database|db/i.test(context)) {
      edgeCases.push('数据库连接失败');
      edgeCases.push('查询结果为空');
      edgeCases.push('数据冲突');
    }

    return edgeCases;
  }

  /**
   * 性能考量
   */
  considerPerformance(context: string): string[] {
    const considerations: string[] = [];

    // 通用性能考量
    considerations.push('时间复杂度是否合理');
    considerations.push('空间复杂度是否可接受');
    considerations.push('是否有不必要的循环嵌套');
    considerations.push('是否可以进行缓存优化');

    // 基于上下文的性能考量
    if (/循环|loop/i.test(context)) {
      considerations.push('循环内部是否有重复计算');
      considerations.push('是否可以提前退出循环');
    }

    if (/数组|array|list/i.test(context)) {
      considerations.push('数组大小是否可控');
      considerations.push('是否使用了合适的数据结构');
    }

    if (/递归|recursive/i.test(context)) {
      considerations.push('递归深度是否可控');
      considerations.push('是否可以考虑迭代实现');
    }

    return considerations;
  }

  /**
   * 安全审查
   */
  securityReview(code: string): string[] {
    const concerns: string[] = [];

    // 检查常见安全问题
    if (/eval\(/.test(code)) {
      concerns.push('使用了 eval，可能存在代码注入风险');
    }

    if (/innerHTML\s*=/.test(code)) {
      concerns.push('直接设置 innerHTML，可能存在 XSS 风险');
    }

    if (/password|secret|token|key/i.test(code)) {
      concerns.push('代码包含敏感信息相关变量，确保不会泄露');
    }

    if (/\$\{.*\}/.test(code) && /sql|SQL|query/.test(code)) {
      concerns.push('可能存在 SQL 注入风险，建议使用参数化查询');
    }

    return concerns;
  }

  /**
   * 生成执行报告
   */
  generateExecutionReport(result: {
    steps: string[];
    reasoning: string[];
    verifications: Array<{ step: string; passed: boolean; notes: string }>;
    adjustments: string[];
  }): string {
    const lines: string[] = [];

    lines.push('## 执行推理报告');
    lines.push('');

    // 执行步骤
    lines.push('### 执行步骤');
    lines.push('');
    for (const step of result.steps) {
      lines.push(`- ${step}`);
    }
    lines.push('');

    // 推理过程
    lines.push('### 推理过程');
    lines.push('');
    for (const reasoning of result.reasoning) {
      lines.push(reasoning);
    }
    lines.push('');

    // 验证结果
    lines.push('### 验证结果');
    lines.push('');
    for (const v of result.verifications) {
      const status = v.passed ? '✓ 通过' : '✗ 未通过';
      lines.push(`- **${v.step}**: ${status}`);
      if (v.notes) {
        lines.push(`  - ${v.notes}`);
      }
    }
    lines.push('');

    // 调整建议
    const validAdjustments = result.adjustments.filter(a => a.length > 0);
    if (validAdjustments.length > 0) {
      lines.push('### 调整建议');
      lines.push('');
      for (const adj of validAdjustments) {
        lines.push(`- ${adj}`);
      }
    }

    return lines.join('\n');
  }
}
