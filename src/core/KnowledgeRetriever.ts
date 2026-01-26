import { MemorySystem } from '../memory/MemorySystem.js';
import type { MemoryRetrievalResult, ProblemParseResult } from '../types/index.js';

/**
 * 知识检索层
 * 从记忆系统和知识库中检索相关信息
 */
export class KnowledgeRetriever {
  private memory: MemorySystem;
  private knowledgeCache: Map<string, unknown>;

  constructor(memory: MemorySystem) {
    this.memory = memory;
    this.knowledgeCache = new Map();
  }

  /**
   * 检索知识
   */
  async retrieve(problemParse: ProblemParseResult): Promise<{
    memories: MemoryRetrievalResult;
    bestPractices: string[];
    similarProblems: string[];
    suggestedApproaches: string[];
  }> {
    const query = problemParse.coreIntent;
    const complexity = problemParse.complexityRating.level;

    // 从记忆系统检索
    const memories = await this.memory.retrieveMemories(query, 10);

    // 检索最佳实践
    const bestPractices = this.retrieveBestPractices(query, complexity);

    // 检索相似问题
    const similarProblems = this.retrieveSimilarProblems(query, memories);

    // 获取建议方法
    const suggestedApproaches = this.suggestApproaches(query, complexity);

    return {
      memories,
      bestPractices,
      similarProblems,
      suggestedApproaches
    };
  }

  /**
   * 检索最佳实践
   */
  private retrieveBestPractices(query: string, complexity: number): string[] {
    const practices: string[] = [];

    // 基于查询类型推荐最佳实践
    const practicePatterns: Record<string, string[]> = {
      'implement': [
        '先编写测试用例',
        '遵循 SOLID 原则',
        '使用有意义的命名',
        '保持函数简短单一职责'
      ],
      'refactor': [
        '先确保有测试覆盖',
        '小步重构，频繁验证',
        '保持功能不变',
        '改进代码结构'
      ],
      'fix': [
        '先复现问题',
        '定位根本原因',
        '修复后添加测试防止回归',
        '检查是否有类似问题'
      ],
      'design': [
        '从简单设计开始',
        '考虑未来扩展性',
        '明确模块边界',
        '文档化关键决策'
      ],
      'default': [
        '明确问题边界',
        '考虑边缘情况',
        '编写清晰代码',
        '添加必要注释'
      ]
    };

    let category = 'default';
    for (const key of Object.keys(practicePatterns)) {
      if (query.toLowerCase().includes(key)) {
        category = key;
        break;
      }
    }

    return practicePatterns[category] || practicePatterns.default;
  }

  /**
   * 检索相似问题
   */
  private retrieveSimilarProblems(query: string, memories: MemoryRetrievalResult): string[] {
    const problems: string[] = [];

    // 从记忆中提取相似问题
    for (const conversation of memories.conversations) {
      for (const ps of conversation.problemsAndSolutions) {
        if (this.isSimilarProblem(query, ps.problem)) {
          problems.push(`之前遇到: ${ps.problem}`);
          problems.push(`解决方案: ${ps.solution}`);
          break;
        }
      }
    }

    return problems;
  }

  /**
   * 判断问题是否相似
   */
  private isSimilarProblem(query: string, problem: string): boolean {
    const queryWords = new Set(query.toLowerCase().split(/\s+/));
    const problemWords = new Set(problem.toLowerCase().split(/\s+/));

    let intersection = 0;
    for (const word of queryWords) {
      if (problemWords.has(word) && word.length > 2) {
        intersection++;
      }
    }

    return intersection >= 2;
  }

  /**
   * 建议方法
   */
  private suggestApproaches(query: string, complexity: number): string[] {
    const approaches: string[] = [];

    // 基于复杂度的建议
    if (complexity <= 2) {
      approaches.push('直接实现，保持简单');
    } else if (complexity === 3) {
      approaches.push('分解为多个步骤');
      approaches.push('考虑使用设计模式');
    } else if (complexity >= 4) {
      approaches.push('先进行架构设计');
      approaches.push('考虑可扩展性和可维护性');
      approaches.push('可能需要原型验证');
    }

    // 基于查询类型的建议
    if (/性能|优化|performance|optimize/i.test(query)) {
      approaches.push('先进行 profiling 分析');
      approaches.push('识别性能瓶颈');
    }

    if (/安全|security|安全性/i.test(query)) {
      approaches.push('遵循安全最佳实践');
      approaches.push('进行安全审查');
    }

    if (/测试|test|验证/i.test(query)) {
      approaches.push('编写单元测试');
      approaches.push('考虑集成测试');
    }

    return approaches;
  }

  /**
   * 缓存知识
   */
  cacheKnowledge(key: string, value: unknown): void {
    this.knowledgeCache.set(key, value);
  }

  /**
   * 获取缓存的知识
   */
  getCachedKnowledge(key: string): unknown | undefined {
    return this.knowledgeCache.get(key);
  }

  /**
   * 生成检索摘要
   */
  generateRetrievalSummary(retrieval: {
    memories: MemoryRetrievalResult;
    bestPractices: string[];
    similarProblems: string[];
    suggestedApproaches: string[];
  }): string {
    const lines: string[] = [];

    lines.push('## 知识检索结果');
    lines.push('');

    // 相关记忆
    if (retrieval.memories.conversations.length > 0) {
      lines.push('### 相关记忆');
      lines.push('');
      for (const conv of retrieval.memories.conversations.slice(0, 3)) {
        lines.push(`- ${conv.metadata.title} (${conv.metadata.startTime.split('T')[0]})`);
      }
      lines.push('');
    }

    // 最佳实践
    if (retrieval.bestPractices.length > 0) {
      lines.push('### 最佳实践');
      lines.push('');
      for (const practice of retrieval.bestPractices) {
        lines.push(`- ${practice}`);
      }
      lines.push('');
    }

    // 相似问题
    if (retrieval.similarProblems.length > 0) {
      lines.push('### 相似问题');
      lines.push('');
      for (const problem of retrieval.similarProblems) {
        lines.push(`- ${problem}`);
      }
      lines.push('');
    }

    // 建议方法
    if (retrieval.suggestedApproaches.length > 0) {
      lines.push('### 建议方法');
      lines.push('');
      for (const approach of retrieval.suggestedApproaches) {
        lines.push(`- ${approach}`);
      }
      lines.push('');
    }

    return lines.join('\n');
  }
}
