import type { ReflectionReport } from '../types/index.js';

/**
 * 反思优化层
 * 负责任务完成后的反思和改进
 */
export class ReflectionOptimizer {
  private sessionHistory: Map<string, ReflectionReport> = new Map();

  /**
   * 生成反思报告
   */
  generateReflection(
    context: {
      task: string;
      outcome: string;
      steps: string[];
      challenges: string[];
      discoveries: string[];
    }
  ): ReflectionReport {
    const taskCompletion = this.assessCompletion(context);
    const processEvaluation = this.evaluateProcess(context);
    const improvements = this.identifyImprovements(context);
    const learned = this.extractLearning(context);
    const memoryUpdates = this.planMemoryUpdates(context);

    const report: ReflectionReport = {
      taskCompletion,
      processEvaluation,
      improvements,
      learned,
      memoryUpdates
    };

    return report;
  }

  /**
   * 评估任务完成度
   */
  private assessCompletion(context: {
    task: string;
    outcome: string;
    steps: string[];
    challenges: string[];
    discoveries: string[];
  }): ReflectionReport['taskCompletion'] {
    // 基于多个因素评估完成度
    const hasSteps = context.steps.length > 0;
    const hasOutcome = context.outcome.length > 0;
    const hasChallenges = context.challenges.length > 0;

    if (hasOutcome && context.outcome.toLowerCase().includes('成功')) {
      return '100%';
    } else if (hasSteps && hasOutcome) {
      return 'partial';
    } else if (hasChallenges && context.challenges.length > 2) {
      return 'follow-up-required';
    }

    return 'partial';
  }

  /**
   * 评估过程
   */
  private evaluateProcess(context: {
    task: string;
    outcome: string;
    steps: string[];
    challenges: string[];
    discoveries: string[];
  }): ReflectionReport['processEvaluation'] {
    const smooth: string[] = [];
    const challenging: string[] = [];
    const discoveries: string[] = [];

    // 分析顺利的环节
    if (context.steps.length > 3) {
      smooth.push('按计划执行了多个步骤');
    }

    // 分析挑战
    for (const challenge of context.challenges) {
      challenging.push(challenge);
    }

    if (context.challenges.length === 0) {
      challenging.push('无明显挑战，任务执行顺利');
    }

    // 分析发现
    for (const discovery of context.discoveries) {
      discoveries.push(discovery);
    }

    if (discoveries.length === 0) {
      discoveries.push('按预期执行，无特殊发现');
    }

    return { smooth, challenging, discoveries };
  }

  /**
   * 识别改进空间
   */
  private identifyImprovements(context: {
    task: string;
    outcome: string;
    steps: string[];
    challenges: string[];
    discoveries: string[];
  }): ReflectionReport['improvements'] {
    const thinking: string[] = [];
    const communication: string[] = [];
    const technical: string[] = [];

    // 思考方式改进
    if (context.challenges.length > 0) {
      thinking.push('遇到挑战时可以考虑更多替代方案');
    }

    if (context.steps.length > 10) {
      thinking.push('任务较长，可以更早地分解和规划');
    }

    // 沟通方式改进
    if (!context.outcome || context.outcome.length < 50) {
      communication.push('可以提供更详细的解释和说明');
    }

    // 技术方案改进
    if (context.challenges.some(c => c.includes('错误') || c.includes('bug'))) {
      technical.push('可以增加测试覆盖率，预防类似问题');
    }

    if (context.steps.some(s => s.includes('临时') || s.includes('quick'))) {
      technical.push('存在临时方案，后续可以优化为更稳健的实现');
    }

    return { thinking, communication, technical };
  }

  /**
   * 提取学习内容
   */
  private extractLearning(context: {
    task: string;
    outcome: string;
    steps: string[];
    challenges: string[];
    discoveries: string[];
  }): ReflectionReport['learned'] {
    const newKnowledge: string[] = [];
    const reusablePatterns: string[] = [];
    const areasToLearn: string[] = [];

    // 从发现中提取新知识
    for (const discovery of context.discoveries) {
      newKnowledge.push(discovery);
    }

    // 从步骤中提取可复用模式
    if (context.steps.some(s => s.includes('测试'))) {
      reusablePatterns.push('测试驱动开发的模式');
    }

    if (context.steps.some(s => s.includes('重构') || s.includes('优化'))) {
      reusablePatterns.push('迭代优化的模式');
    }

    // 识别需要学习的领域
    if (context.challenges.some(c => c.includes('不熟悉') || c.includes('不确定'))) {
      areasToLearn.push('加深对相关技术领域的了解');
    }

    if (context.challenges.some(c => c.includes('性能'))) {
      areasToLearn.push('性能优化技巧');
    }

    return { newKnowledge, reusablePatterns, areasToLearn };
  }

  /**
   * 规划记忆更新
   */
  private planMemoryUpdates(context: {
    task: string;
    outcome: string;
    steps: string[];
    challenges: string[];
    discoveries: string[];
  }): string[] {
    const updates: string[] = [];

    // 更新用户偏好
    if (context.challenges.some(c => c.includes('详细'))) {
      updates.push('用户偏好详细解释，应更新沟通偏好设置');
    }

    if (context.steps.some(s => s.includes('TypeScript'))) {
      updates.push('用户使用 TypeScript，应更新技术偏好');
    }

    // 更新项目上下文
    if (context.discoveries.some(d => d.includes('架构') || d.includes('模块'))) {
      updates.push('发现了项目架构信息，应更新项目上下文');
    }

    // 记录关键决策
    if (context.challenges.length > 0) {
      updates.push('记录遇到的问题和解决方案');
    }

    // 记录可复用经验
    if (context.outcome.includes('成功')) {
      updates.push('记录成功的解决方案作为可复用经验');
    }

    return updates;
  }

  /**
   * 保存反思报告
   */
  saveReflection(sessionId: string, report: ReflectionReport): void {
    this.sessionHistory.set(sessionId, report);
  }

  /**
   * 获取历史反思
   */
  getReflection(sessionId: string): ReflectionReport | undefined {
    return this.sessionHistory.get(sessionId);
  }

  /**
   * 获取所有反思
   */
  getAllReflections(): Map<string, ReflectionReport> {
    return this.sessionHistory;
  }

  /**
   * 分析历史表现
   */
  analyzeHistoricalPerformance(): {
    totalSessions: number;
    completionRate: number;
    commonChallenges: string[];
    commonLearnings: string[];
  } {
    const reports = Array.from(this.sessionHistory.values());

    const totalSessions = reports.length;
    let completedSessions = 0;

    const challengeFrequency = new Map<string, number>();
    const learningFrequency = new Map<string, number>();

    for (const report of reports) {
      if (report.taskCompletion === '100%') {
        completedSessions++;
      }

      for (const challenge of report.processEvaluation.challenging) {
        const key = challenge.slice(0, 50);
        challengeFrequency.set(key, (challengeFrequency.get(key) || 0) + 1);
      }

      for (const learning of report.learned.newKnowledge) {
        const key = learning.slice(0, 50);
        learningFrequency.set(key, (learningFrequency.get(key) || 0) + 1);
      }
    }

    const commonChallenges = Array.from(challengeFrequency.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(e => e[0]);

    const commonLearnings = Array.from(learningFrequency.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(e => e[0]);

    return {
      totalSessions,
      completionRate: totalSessions > 0 ? completedSessions / totalSessions : 0,
      commonChallenges,
      commonLearnings
    };
  }

  /**
   * 生成反思报告文本
   */
  generateReflectionText(report: ReflectionReport): string {
    const lines: string[] = [];

    lines.push('## 反思报告');
    lines.push('');

    // 任务完成度
    lines.push(`**任务完成度**: ${report.taskCompletion}`);
    lines.push('');

    // 过程评估
    lines.push('### 过程评估');
    lines.push('');

    if (report.processEvaluation.smooth.length > 0) {
      lines.push('**顺利环节**:');
      for (const item of report.processEvaluation.smooth) {
        lines.push(`- ${item}`);
      }
      lines.push('');
    }

    if (report.processEvaluation.challenging.length > 0) {
      lines.push('**困难环节**:');
      for (const item of report.processEvaluation.challenging) {
        lines.push(`- ${item}`);
      }
      lines.push('');
    }

    if (report.processEvaluation.discoveries.length > 0) {
      lines.push('**意外发现**:');
      for (const item of report.processEvaluation.discoveries) {
        lines.push(`- ${item}`);
      }
      lines.push('');
    }

    // 改进空间
    lines.push('### 改进空间');
    lines.push('');

    if (report.improvements.thinking.length > 0) {
      lines.push('**思考方式**:');
      for (const item of report.improvements.thinking) {
        lines.push(`- ${item}`);
      }
      lines.push('');
    }

    if (report.improvements.communication.length > 0) {
      lines.push('**沟通方式**:');
      for (const item of report.improvements.communication) {
        lines.push(`- ${item}`);
      }
      lines.push('');
    }

    if (report.improvements.technical.length > 0) {
      lines.push('**技术方案**:');
      for (const item of report.improvements.technical) {
        lines.push(`- ${item}`);
      }
      lines.push('');
    }

    // 经验积累
    lines.push('### 经验积累');
    lines.push('');

    if (report.learned.newKnowledge.length > 0) {
      lines.push('**新学到的知识**:');
      for (const item of report.learned.newKnowledge) {
        lines.push(`- ${item}`);
      }
      lines.push('');
    }

    if (report.learned.reusablePatterns.length > 0) {
      lines.push('**可复用的模式**:');
      for (const item of report.learned.reusablePatterns) {
        lines.push(`- ${item}`);
      }
      lines.push('');
    }

    if (report.learned.areasToLearn.length > 0) {
      lines.push('**需要深入学习的领域**:');
      for (const item of report.learned.areasToLearn) {
        lines.push(`- ${item}`);
      }
      lines.push('');
    }

    // 记忆更新
    if (report.memoryUpdates.length > 0) {
      lines.push('### 记忆更新');
      lines.push('');
      for (const item of report.memoryUpdates) {
        lines.push(`- ${item}`);
      }
    }

    return lines.join('\n');
  }

  /**
   * 清除历史记录
   */
  clearHistory(): void {
    this.sessionHistory.clear();
  }
}
