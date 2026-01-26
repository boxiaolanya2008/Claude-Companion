import { FileSystemStorage } from './storage/StorageAdapter';
import type { ConversationRecord } from '../types/index.js';

/**
 * 语义索引项
 */
interface IndexEntry {
  id: string;
  type: 'conversation' | 'decision' | 'problem' | 'todo';
  keywords: string[];
  timestamp: string;
  conversationId: string;
  relevanceScore: number;
}

/**
 * 语义索引管理器
 * 提供基于关键词的记忆检索功能
 */
export class SemanticIndex {
  private storage: FileSystemStorage;
  private index: Map<string, IndexEntry[]> = new Map();
  private indexFilename = 'semantic_index/index.json';

  constructor(storage: FileSystemStorage) {
    this.storage = storage;
  }

  /**
   * 加载索引
   */
  async load(): Promise<void> {
    if (await this.storage.exists(this.indexFilename)) {
      const content = await this.storage.read(this.indexFilename);
      const data = JSON.parse(content) as Record<string, IndexEntry[]>;

      this.index = new Map();
      for (const [key, entries] of Object.entries(data)) {
        this.index.set(key, entries);
      }
    }
  }

  /**
   * 保存索引
   */
  async save(): Promise<void> {
    const data = Object.fromEntries(this.index);
    await this.storage.write(this.indexFilename, JSON.stringify(data, null, 2));
  }

  /**
   * 索引对话记录
   */
  async indexConversation(conversation: ConversationRecord): Promise<void> {
    const keywords = this.extractKeywords(conversation);

    const entry: IndexEntry = {
      id: conversation.metadata.conversationId,
      type: 'conversation',
      keywords,
      timestamp: conversation.metadata.startTime,
      conversationId: conversation.metadata.conversationId,
      relevanceScore: 1.0
    };

    // 为每个关键词添加索引
    for (const keyword of keywords) {
      if (!this.index.has(keyword)) {
        this.index.set(keyword, []);
      }
      this.index.get(keyword)?.push(entry);
    }

    // 索引决策
    for (const decision of conversation.keyDecisions) {
      const decisionKeywords = this.extractKeywordsFromString(decision.decision);
      decisionKeywords.push(...this.extractKeywordsFromString(decision.reason));

      const decisionEntry: IndexEntry = {
        id: `${conversation.metadata.conversationId}_decision_${decision.decisionPoint}`,
        type: 'decision',
        keywords: decisionKeywords,
        timestamp: conversation.metadata.startTime,
        conversationId: conversation.metadata.conversationId,
        relevanceScore: 0.9
      };

      for (const kw of decisionKeywords) {
        if (!this.index.has(kw)) {
          this.index.set(kw, []);
        }
        this.index.get(kw)?.push(decisionEntry);
      }
    }

    // 索引问题和解决方案
    for (const ps of conversation.problemsAndSolutions) {
      const psKeywords = this.extractKeywordsFromString(ps.problem);
      psKeywords.push(...this.extractKeywordsFromString(ps.solution));

      const psEntry: IndexEntry = {
        id: `${conversation.metadata.conversationId}_problem_${ps.problem.slice(0, 20)}`,
        type: 'problem',
        keywords: psKeywords,
        timestamp: conversation.metadata.startTime,
        conversationId: conversation.metadata.conversationId,
        relevanceScore: 0.95
      };

      for (const kw of psKeywords) {
        if (!this.index.has(kw)) {
          this.index.set(kw, []);
        }
        this.index.get(kw)?.push(psEntry);
      }
    }

    await this.save();
  }

  /**
   * 搜索相关记忆
   */
  async search(query: string, limit: number = 10): Promise<IndexEntry[]> {
    const queryKeywords = this.extractKeywordsFromString(query);
    const scores = new Map<string, number>();

    // 计算每个条目的相关性分数
    for (const keyword of queryKeywords) {
      const entries = this.index.get(keyword);
      if (entries) {
        for (const entry of entries) {
          const currentScore = scores.get(entry.id) || 0;
          scores.set(entry.id, currentScore + entry.relevanceScore);
        }
      }
    }

    // 按分数排序并返回前 N 个
    const sortedEntries = Array.from(scores.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit);

    // 获取完整的条目信息
    const results: IndexEntry[] = [];
    const seenIds = new Set<string>();

    for (const [entryId, score] of sortedEntries) {
      for (const entries of this.index.values()) {
        for (const entry of entries) {
          if (entry.id === entryId && !seenIds.has(entryId)) {
            results.push({ ...entry, relevanceScore: score });
            seenIds.add(entryId);
            break;
          }
        }
      }
    }

    return results;
  }

  /**
   * 获取相关对话 ID
   */
  async getRelatedConversationIds(query: string, limit: number = 5): Promise<string[]> {
    const results = await this.search(query, limit);
    const ids = new Set<string>();

    for (const result of results) {
      ids.add(result.conversationId);
    }

    return Array.from(ids);
  }

  /**
   * 清除过期索引
   */
  async clearOldEntries(daysToKeep: number = 365): Promise<void> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    for (const [keyword, entries] of this.index.entries()) {
      const filteredEntries = entries.filter(
        entry => new Date(entry.timestamp) > cutoffDate
      );

      if (filteredEntries.length === 0) {
        this.index.delete(keyword);
      } else {
        this.index.set(keyword, filteredEntries);
      }
    }

    await this.save();
  }

  /**
   * 从对话记录中提取关键词
   */
  private extractKeywords(conversation: ConversationRecord): string[] {
    const keywords: string[] = [];

    // 从标题提取
    keywords.push(...this.extractKeywordsFromString(conversation.metadata.title));

    // 从摘要提取
    keywords.push(...this.extractKeywordsFromString(conversation.summary));

    // 从项目名称提取
    keywords.push(...this.extractKeywordsFromString(conversation.metadata.project));

    // 从技术栈提取
    for (const tech of conversation.technicalDetails.usedTechnologies) {
      keywords.push(tech.name.toLowerCase());
    }

    return [...new Set(keywords)]; // 去重
  }

  /**
   * 从文本中提取关键词
   */
  private extractKeywordsFromString(text: string): string[] {
    if (!text) return [];

    // 简单的关键词提取
    const words = text
      .toLowerCase()
      .replace(/[^\u4e00-\u9fa5a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 1);

    // 过滤常见停用词
    const stopWords = new Set([
      'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
      'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
      'should', 'may', 'might', 'must', 'shall', 'can', 'need', 'dare',
      '的', '了', '是', '在', '和', '有', '我', '你', '他', '她', '它'
    ]);

    return words.filter(word => !stopWords.has(word));
  }

  /**
   * 获取索引统计信息
   */
  getStats(): { totalKeywords: number; totalEntries: number } {
    let totalEntries = 0;
    for (const entries of this.index.values()) {
      totalEntries += entries.length;
    }

    return {
      totalKeywords: this.index.size,
      totalEntries
    };
  }
}
