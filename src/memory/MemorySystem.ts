import * as path from 'path';
import { FileSystemStorage } from './storage/StorageAdapter.js';
import { ConversationMemory } from './ConversationMemory.js';
import { UserPreference } from './UserPreference.js';
import { ProjectContext } from './ProjectContext.js';
import { SemanticIndex } from './SemanticIndex.js';
import type { MemorySystemConfig, MemoryRetrievalResult } from '../types/index.js';

/**
 * 记忆系统核心
 * 协调所有记忆组件的工作
 */
export class MemorySystem {
  private storage: FileSystemStorage;
  private conversationMemory: ConversationMemory;
  private userPreference: UserPreference;
  private projectContext: ProjectContext;
  private semanticIndex: SemanticIndex;
  private config: MemorySystemConfig;

  constructor(config: MemorySystemConfig) {
    this.config = config;
    this.storage = new FileSystemStorage(config.storagePath);
    this.conversationMemory = new ConversationMemory(this.storage);
    this.userPreference = new UserPreference(this.storage);
    this.projectContext = new ProjectContext(this.storage);
    this.semanticIndex = new SemanticIndex(this.storage);
  }

  /**
   * 初始化记忆系统
   */
  async initialize(userId: string, project: string): Promise<void> {
    // 初始化存储结构
    await this.storage.initializeStructure();

    // 加载索引
    if (this.config.semanticIndex) {
      await this.semanticIndex.load();
    }

    // 加载用户偏好
    if (this.config.autoLoad) {
      await this.userPreference.load(userId);
      await this.projectContext.load(project);
    }
  }

  /**
   * 检索相关记忆
   */
  async retrieveMemories(query: string, limit: number = 10): Promise<MemoryRetrievalResult> {
    const results: MemoryRetrievalResult = {
      conversations: [],
      userPreferences: this.userPreference.getPreferences() || undefined,
      projectContext: this.projectContext.getContext() || undefined,
      relevanceScore: 0
    };

    if (!this.config.semanticIndex) {
      return results;
    }

    // 使用语义索引搜索
    const relatedIds = await this.semanticIndex.getRelatedConversationIds(query, limit);

    // 加载相关对话
    for (const id of relatedIds) {
      const conversation = await this.conversationMemory.loadConversation(id);
      if (conversation) {
        results.conversations.push(conversation);
      }
    }

    // 计算相关性分数（简化版）
    results.relevanceScore = relatedIds.length > 0 ? 0.8 : 0;

    return results;
  }

  /**
   * 获取最近的对话
   */
  async getRecentConversations(limit: number = 10) {
    return await this.conversationMemory.getRecentConversations(limit);
  }

  /**
   * 创建新对话
   */
  async createConversation(title: string, userName: string, project: string): Promise<string> {
    const conversationId = await this.conversationMemory.createConversation(title, userName, project);

    // 增加会话计数
    await this.userPreference.incrementSessionCount();

    return conversationId;
  }

  /**
   * 添加决策记录（自动保存）
   */
  async addDecision(
    conversationId: string,
    decisionPoint: string,
    decision: string,
    reason: string
  ): Promise<void> {
    await this.conversationMemory.addDecision(conversationId, decisionPoint, decision, reason);

    // 重新索引对话
    const conversation = await this.conversationMemory.loadConversation(conversationId);
    if (conversation && this.config.semanticIndex) {
      await this.semanticIndex.indexConversation(conversation);
    }

    // 自动保存
    if (this.config.autoSave) {
      await this.autoSave();
    }
  }

  /**
   * 添加问题解决方案（自动保存）
   */
  async addProblemSolution(
    conversationId: string,
    problem: string,
    solution: string,
    result: string
  ): Promise<void> {
    await this.conversationMemory.addProblemSolution(conversationId, problem, solution, result);

    // 重新索引对话
    const conversation = await this.conversationMemory.loadConversation(conversationId);
    if (conversation && this.config.semanticIndex) {
      await this.semanticIndex.indexConversation(conversation);
    }

    if (this.config.autoSave) {
      await this.autoSave();
    }
  }

  /**
   * 更新对话摘要（自动保存）
   */
  async updateSummary(conversationId: string, summary: string): Promise<void> {
    await this.conversationMemory.updateSummary(conversationId, summary);

    // 重新索引对话
    const conversation = await this.conversationMemory.loadConversation(conversationId);
    if (conversation && this.config.semanticIndex) {
      await this.semanticIndex.indexConversation(conversation);
    }

    if (this.config.autoSave) {
      await this.autoSave();
    }
  }

  /**
   * 结束对话
   */
  async endConversation(conversationId: string): Promise<void> {
    await this.conversationMemory.endConversation(conversationId);

    // 重新索引对话
    const conversation = await this.conversationMemory.loadConversation(conversationId);
    if (conversation && this.config.semanticIndex) {
      await this.semanticIndex.indexConversation(conversation);
    }
  }

  /**
   * 更新用户偏好（自动保存）
   */
  async updateCommunicationPreferences(
    detailLevel?: 'concise' | 'balanced' | 'comprehensive',
    explanationStyle?: 'direct' | 'step-by-step' | 'analogy'
  ): Promise<void> {
    const prefs: Record<string, unknown> = {};
    if (detailLevel) prefs.detailLevel = detailLevel;
    if (explanationStyle) prefs.explanationStyle = explanationStyle;

    await this.userPreference.updateCommunication(prefs);

    if (this.config.autoSave) {
      await this.autoSave();
    }
  }

  /**
   * 更新人格偏好（自动保存）
   */
  async updatePersonaPreference(
    defaultMode: string,
    preferredModes: string[]
  ): Promise<void> {
    await this.userPreference.updatePersona({
      defaultMode: defaultMode as any,
      preferredModes: preferredModes as any
    });

    if (this.config.autoSave) {
      await this.autoSave();
    }
  }

  /**
   * 更新项目上下文（自动保存）
   */
  async updateProjectContext(
    overview?: string,
    techStack?: { category: string; technology: string; version: string; purpose: string }[]
  ): Promise<void> {
    if (overview) {
      await this.projectContext.updateOverview(overview);
    }

    if (techStack) {
      for (const item of techStack) {
        await this.projectContext.addTechStackItem(item);
      }
    }

    if (this.config.autoSave) {
      await this.autoSave();
    }
  }

  /**
   * 添加待办事项（自动保存）
   */
  async addTodo(
    conversationId: string,
    task: string,
    priority: 'low' | 'medium' | 'high' = 'medium'
  ): Promise<void> {
    await this.conversationMemory.addTodo(conversationId, task, priority);

    if (this.config.autoSave) {
      await this.autoSave();
    }
  }

  /**
   * 记录常见任务（自动保存）
   */
  async recordCommonTask(task: string): Promise<void> {
    await this.userPreference.recordCommonTask(task);

    if (this.config.autoSave) {
      await this.autoSave();
    }
  }

  /**
   * 获取用户偏好
   */
  getUserPreferences() {
    return this.userPreference.getPreferences();
  }

  /**
   * 获取项目上下文
   */
  getProjectContext() {
    return this.projectContext.getContext();
  }

  /**
   * 获取存储路径
   */
  getStoragePath(): string {
    return this.storage.getBasePath();
  }

  /**
   * 获取索引统计
   */
  getIndexStats() {
    return this.semanticIndex.getStats();
  }

  /**
   * 清理旧记忆
   */
  async cleanupOldMemories(daysToKeep: number = this.config.retentionDays || 365): Promise<void> {
    if (this.config.semanticIndex) {
      await this.semanticIndex.clearOldEntries(daysToKeep);
    }
  }

  /**
   * 保存所有状态
   */
  async saveAll(): Promise<void> {
    await this.userPreference.save();
    await this.projectContext.save();
    if (this.config.semanticIndex) {
      await this.semanticIndex.save();
    }
  }

  /**
   * 获取记忆摘要
   */
  async getMemorySummary(): Promise<string> {
    const prefs = this.userPreference.getPreferences();
    const context = this.projectContext.getContext();
    const recent = await this.conversationMemory.getRecentConversations(3);
    const indexStats = this.semanticIndex.getStats();

    const lines: string[] = [];

    lines.push('## 记忆摘要');
    lines.push('');

    // 最近对话
    if (recent.length > 0) {
      lines.push('### 最近对话');
      lines.push('');
      for (const conv of recent) {
        lines.push(`- **${conv.metadata.title}** (${conv.metadata.startTime.split('T')[0]})`);
        if (conv.summary) {
          lines.push(`  ${conv.summary.slice(0, 100)}...`);
        }
      }
      lines.push('');
    }

    // 用户偏好
    if (prefs) {
      lines.push('### 用户偏好');
      lines.push('');
      lines.push(`- 默认人格: ${prefs.preferences.persona.defaultMode}`);
      lines.push(`- 沟通风格: ${prefs.preferences.communication.detailLevel}`);
      lines.push(`- 解释方式: ${prefs.preferences.communication.explanationStyle}`);
      lines.push(`- 会话总数: ${prefs.interactionHistory.totalSessions}`);
      lines.push('');
    }

    // 项目状态
    if (context) {
      lines.push('### 项目状态');
      lines.push('');
      lines.push(`- 项目: ${context.projectInfo.projectName}`);
      lines.push(`- 当前版本: ${context.developmentStatus.currentVersion}`);
      lines.push(`- 进行中任务: ${context.developmentStatus.inProgressTasks.length}`);
      lines.push(`- 待发布功能: ${context.developmentStatus.pendingFeatures.length}`);
      lines.push('');
    }

    // 索引统计
    lines.push('### 索引统计');
    lines.push('');
    lines.push(`- 关键词数: ${indexStats.totalKeywords}`);
    lines.push(`- 索引条目: ${indexStats.totalEntries}`);
    lines.push('');

    return lines.join('\n');
  }

  /**
   * 自动保存（用于全局访问）
   */
  private async autoSave(): Promise<void> {
    try {
      await this.userPreference.save();
      await this.projectContext.save();
      if (this.config.semanticIndex) {
        await this.semanticIndex.save();
      }
    } catch (error) {
      // 静默失败，避免影响主要功能
      console.error('[MemorySystem] Auto-save failed:', error);
    }
  }

  /**
   * 全局访问：获取全局记忆路径
   */
  getGlobalMemoryPath(): string {
    return this.config.globalAccess
      ? path.resolve(this.config.storagePath)
      : path.resolve(process.cwd(), this.config.storagePath);
  }
}
