import { MemorySystem } from '../memory/MemorySystem.js';
import { ProblemParser } from './ProblemParser.js';
import { KnowledgeRetriever } from './KnowledgeRetriever.js';
import { StrategyPlanner } from './StrategyPlanner.js';
import { ExecutionReasoner } from './ExecutionReasoner.js';
import { ReflectionOptimizer } from './ReflectionOptimizer.js';
import type { ProblemParseResult, StrategyPlan, ReflectionReport } from '../types/index.js';

/**
 * 深度思考引擎
 * 整合五个推理层级，提供完整的思考能力
 */
export class DeepThinkingEngine {
  private memory: MemorySystem;
  private problemParser: ProblemParser;
  private knowledgeRetriever: KnowledgeRetriever;
  private strategyPlanner: StrategyPlanner;
  private executionReasoner: ExecutionReasoner;
  private reflectionOptimizer: ReflectionOptimizer;

  constructor(memory: MemorySystem) {
    this.memory = memory;
    this.problemParser = new ProblemParser(memory);
    this.knowledgeRetriever = new KnowledgeRetriever(memory);
    this.strategyPlanner = new StrategyPlanner();
    this.executionReasoner = new ExecutionReasoner();
    this.reflectionOptimizer = new ReflectionOptimizer();
  }

  /**
   * 处理请求 - 完整的深度思考流程
   */
  async process(request: string, context?: {
    language?: string;
    framework?: string;
    conversationId?: string;
  }): Promise<{
    parseResult: ProblemParseResult;
    retrieval: any;
    plan: StrategyPlan;
    execution: any;
    reflection?: ReflectionReport;
  }> {
    // 模块一：问题解析
    const parseResult = await this.problemParser.parse(request, context?.conversationId);

    // 模块二：知识检索
    const retrieval = await this.knowledgeRetriever.retrieve(parseResult);

    // 模块三：策略规划
    const plan = this.strategyPlanner.plan(parseResult, retrieval);

    // 模块四：执行推理
    const execution = await this.executionReasoner.execute(plan, {
      language: context?.language,
      framework: context?.framework
    });

    // 模块五：反思优化（在任务完成后调用）
    // 这里不自动生成反思，因为需要实际任务结果

    return {
      parseResult,
      retrieval,
      plan,
      execution,
      reflection: undefined
    };
  }

  /**
   * 生成思考报告
   */
  async generateThinkingReport(request: string, context?: {
    language?: string;
    framework?: string;
  }): Promise<string> {
    const result = await this.process(request, context);

    const lines: string[] = [];

    // 问题解析
    lines.push(this.problemParser.generateSummary(result.parseResult));
    lines.push('');

    // 知识检索
    lines.push(this.knowledgeRetriever.generateRetrievalSummary(result.retrieval));
    lines.push('');

    // 策略计划
    lines.push(this.strategyPlanner.generatePlanSummary(result.plan));
    lines.push('');

    // 执行推理
    lines.push(this.executionReasoner.generateExecutionReport(result.execution));
    lines.push('');

    return lines.join('\n');
  }

  /**
   * 完成后的反思
   */
  reflect(taskContext: {
    task: string;
    outcome: string;
    steps: string[];
    challenges: string[];
    discoveries: string[];
  }): ReflectionReport {
    const report = this.reflectionOptimizer.generateReflection(taskContext);
    this.reflectionOptimizer.saveReflection(
      Date.now().toString(),
      report
    );
    return report;
  }

  /**
   * 获取历史表现分析
   */
  getHistoricalAnalysis() {
    return this.reflectionOptimizer.analyzeHistoricalPerformance();
  }

  /**
   * 代码分析
   */
  analyzeCode(code: string, language?: string) {
    return this.executionReasoner.reasonAboutCode(code, language);
  }

  /**
   * 边界情况分析
   */
  analyzeEdgeCases(context: string) {
    return this.executionReasoner.considerEdgeCases(context);
  }

  /**
   * 性能考量分析
   */
  analyzePerformance(context: string) {
    return this.executionReasoner.considerPerformance(context);
  }

  /**
   * 安全审查
   */
  performSecurityReview(code: string) {
    return this.executionReasoner.securityReview(code);
  }

  /**
   * 获取问题解析器
   */
  getProblemParser(): ProblemParser {
    return this.problemParser;
  }

  /**
   * 获取知识检索器
   */
  getKnowledgeRetriever(): KnowledgeRetriever {
    return this.knowledgeRetriever;
  }

  /**
   * 获取策略规划器
   */
  getStrategyPlanner(): StrategyPlanner {
    return this.strategyPlanner;
  }

  /**
   * 获取执行推理器
   */
  getExecutionReasoner(): ExecutionReasoner {
    return this.executionReasoner;
  }

  /**
   * 获取反思优化器
   */
  getReflectionOptimizer(): ReflectionOptimizer {
    return this.reflectionOptimizer;
  }

  /**
   * 获取记忆系统
   */
  getMemorySystem(): MemorySystem {
    return this.memory;
  }
}
