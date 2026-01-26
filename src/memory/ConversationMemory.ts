import { v4 as uuidv4 } from 'uuid';
import { FileSystemStorage } from './storage/StorageAdapter';
import type {
  ConversationRecord,
  ConversationMetadata,
  DecisionRecord,
  ProblemSolution,
  TodoItem
} from '../types/index.js';

/**
 * 对话记忆管理器
 * 负责管理和存储对话历史记录
 */
export class ConversationMemory {
  private storage: FileSystemStorage;

  constructor(storage: FileSystemStorage) {
    this.storage = storage;
  }

  /**
   * 创建新的对话记录
   */
  async createConversation(
    title: string,
    userName: string,
    project: string
  ): Promise<string> {
    const conversationId = `conv_${Date.now()}_${uuidv4().slice(0, 8)}`;
    const now = new Date().toISOString();

    const metadata: ConversationMetadata = {
      conversationId,
      title,
      startTime: now,
      endTime: '',
      userName,
      project,
      summary: ''
    };

    const record: ConversationRecord = {
      metadata,
      summary: '',
      keyDecisions: [],
      problemsAndSolutions: [],
      technicalDetails: {
        usedTechnologies: [],
        keyCodes: []
      },
      todos: [],
      relatedMemories: []
    };

    await this.saveConversation(conversationId, record);
    return conversationId;
  }

  /**
   * 保存对话记录
   */
  async saveConversation(
    conversationId: string,
    record: ConversationRecord
  ): Promise<void> {
    const filename = `conversations/${this.formatDate(new Date())}_${conversationId}_${record.metadata.title.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '_')}.md`;
    const content = this.formatConversationMarkdown(record);
    await this.storage.write(filename, content);
  }

  /**
   * 加载对话记录
   */
  async loadConversation(conversationId: string): Promise<ConversationRecord | null> {
    const files = await this.storage.list('conversations');
    const matchingFile = files.find(f => f.includes(conversationId));

    if (!matchingFile) {
      return null;
    }

    const content = await this.storage.read(`conversations/${matchingFile}`);
    return this.parseConversationMarkdown(content);
  }

  /**
   * 添加决策记录
   */
  async addDecision(
    conversationId: string,
    decisionPoint: string,
    decision: string,
    reason: string
  ): Promise<void> {
    const record = await this.loadConversation(conversationId);
    if (!record) {
      throw new Error(`Conversation ${conversationId} not found`);
    }

    const decisionRecord: DecisionRecord = {
      decisionPoint,
      decision,
      reason
    };

    record.keyDecisions.push(decisionRecord);
    await this.saveConversation(conversationId, record);
  }

  /**
   * 添加问题解决方案
   */
  async addProblemSolution(
    conversationId: string,
    problem: string,
    solution: string,
    result: string
  ): Promise<void> {
    const record = await this.loadConversation(conversationId);
    if (!record) {
      throw new Error(`Conversation ${conversationId} not found`);
    }

    const ps: ProblemSolution = {
      problem,
      solution,
      result
    };

    record.problemsAndSolutions.push(ps);
    await this.saveConversation(conversationId, record);
  }

  /**
   * 添加待办事项
   */
  async addTodo(
    conversationId: string,
    task: string,
    priority: 'low' | 'medium' | 'high' = 'medium'
  ): Promise<void> {
    const record = await this.loadConversation(conversationId);
    if (!record) {
      throw new Error(`Conversation ${conversationId} not found`);
    }

    const todo: TodoItem = {
      id: uuidv4(),
      task,
      completed: false,
      priority
    };

    record.todos.push(todo);
    await this.saveConversation(conversationId, record);
  }

  /**
   * 更新对话摘要
   */
  async updateSummary(
    conversationId: string,
    summary: string
  ): Promise<void> {
    const record = await this.loadConversation(conversationId);
    if (!record) {
      throw new Error(`Conversation ${conversationId} not found`);
    }

    record.summary = summary;
    record.metadata.summary = summary;
    await this.saveConversation(conversationId, record);
  }

  /**
   * 结束对话
   */
  async endConversation(conversationId: string): Promise<void> {
    const record = await this.loadConversation(conversationId);
    if (!record) {
      throw new Error(`Conversation ${conversationId} not found`);
    }

    record.metadata.endTime = new Date().toISOString();
    await this.saveConversation(conversationId, record);
  }

  /**
   * 获取最近的对话记录
   */
  async getRecentConversations(limit: number = 10): Promise<ConversationRecord[]> {
    const files = await this.storage.list('conversations');
    const sortedFiles = files.sort().reverse().slice(0, limit);

    const records: ConversationRecord[] = [];
    for (const file of sortedFiles) {
      const content = await this.storage.read(`conversations/${file}`);
      const record = this.parseConversationMarkdown(content);
      if (record) {
        records.push(record);
      }
    }

    return records;
  }

  /**
   * 搜索对话记录
   */
  async searchConversations(query: string): Promise<ConversationRecord[]> {
    const files = await this.storage.list('conversations');
    const results: ConversationRecord[] = [];

    for (const file of files) {
      const content = await this.storage.read(`conversations/${file}`);
      if (content.toLowerCase().includes(query.toLowerCase())) {
        const record = this.parseConversationMarkdown(content);
        if (record) {
          results.push(record);
        }
      }
    }

    return results;
  }

  /**
   * 格式化对话记录为 Markdown
   */
  private formatConversationMarkdown(record: ConversationRecord): string {
    const lines: string[] = [];

    // 元数据
    lines.push('---');
    lines.push(`conversation_id: ${record.metadata.conversationId}`);
    lines.push(`title: ${record.metadata.title}`);
    lines.push(`start_time: ${record.metadata.startTime}`);
    lines.push(`end_time: ${record.metadata.endTime || '进行中'}`);
    lines.push(`user_name: ${record.metadata.userName}`);
    lines.push(`project: ${record.metadata.project}`);
    lines.push(`summary: ${record.metadata.summary}`);
    lines.push('---');
    lines.push('');

    // 摘要
    lines.push('## 对话摘要');
    lines.push('');
    lines.push(record.summary || '暂无摘要');
    lines.push('');

    // 关键决策
    if (record.keyDecisions.length > 0) {
      lines.push('## 关键决策');
      lines.push('');
      lines.push('| 决策点 | 决策内容 | 决策理由 |');
      lines.push('|--------|----------|----------|');
      for (const decision of record.keyDecisions) {
        lines.push(`| ${decision.decisionPoint} | ${decision.decision} | ${decision.reason} |`);
      }
      lines.push('');
    }

    // 问题与解决方案
    if (record.problemsAndSolutions.length > 0) {
      lines.push('## 问题与解决方案');
      lines.push('');
      lines.push('| 问题 | 解决方案 | 结果 |');
      lines.push('|------|----------|------|');
      for (const ps of record.problemsAndSolutions) {
        lines.push(`| ${ps.problem} | ${ps.solution} | ${ps.result} |`);
      }
      lines.push('');
    }

    // 技术细节
    if (record.technicalDetails.usedTechnologies.length > 0) {
      lines.push('## 技术细节');
      lines.push('');
      lines.push('### 使用的技术');
      for (const tech of record.technicalDetails.usedTechnologies) {
        lines.push(`- ${tech.name}: ${tech.purpose}`);
      }
      lines.push('');
    }

    // 待办事项
    if (record.todos.length > 0) {
      lines.push('## 待办事项');
      lines.push('');
      for (const todo of record.todos) {
        const status = todo.completed ? '[x]' : '[ ]';
        const priority = todo.priority === 'high' ? '!' : todo.priority === 'medium' ? '?' : '';
        lines.push(`- ${status} ${priority} ${todo.task}`);
      }
      lines.push('');
    }

    // 用户反馈
    if (record.userFeedback) {
      lines.push('## 用户反馈');
      lines.push('');
      lines.push(record.userFeedback);
      lines.push('');
    }

    return lines.join('\n');
  }

  /**
   * 从 Markdown 解析对话记录
   */
  private parseConversationMarkdown(content: string): ConversationRecord | null {
    try {
      const lines = content.split('\n');
      const metadata: Record<string, string> = {};
      let inMetadata = false;
      let summary = '';
      const keyDecisions: DecisionRecord[] = [];
      const problemsAndSolutions: ProblemSolution[] = [];
      const todos: TodoItem[] = [];

      // 解析元数据
      for (const line of lines) {
        if (line === '---') {
          inMetadata = !inMetadata;
          continue;
        }
        if (inMetadata && line.includes(':')) {
          const [key, value] = line.split(':').map(s => s.trim());
          metadata[key] = value;
        }
        if (!inMetadata && line.startsWith('##')) {
          break;
        }
      }

      // 简化版解析 - 实际应该更完整
      const record: ConversationRecord = {
        metadata: {
          conversationId: metadata.conversation_id || '',
          title: metadata.title || '',
          startTime: metadata.start_time || '',
          endTime: metadata.end_time || '',
          userName: metadata.user_name || '',
          project: metadata.project || '',
          summary: metadata.summary || ''
        },
        summary,
        keyDecisions,
        problemsAndSolutions,
        technicalDetails: {
          usedTechnologies: [],
          keyCodes: []
        },
        todos,
        relatedMemories: []
      };

      return record;
    } catch (error) {
      console.error('Failed to parse conversation:', error);
      return null;
    }
  }

  /**
   * 格式化日期
   */
  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }
}
