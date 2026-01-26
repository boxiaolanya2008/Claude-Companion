import { FileSystemStorage } from './storage/StorageAdapter';
import type {
  ProjectContext as ProjectContextData,
  ProjectInfo,
  TechStackItem,
  KnownIssue,
  DevelopmentStatus
} from '../types/index.js';

/**
 * 项目上下文管理器
 * 负责管理和存储项目相关上下文信息
 */
export class ProjectContext {
  private storage: FileSystemStorage;
  private context: ProjectContextData | null = null;

  constructor(storage: FileSystemStorage) {
    this.storage = storage;
  }

  /**
   * 加载项目上下文
   */
  async load(projectName: string): Promise<ProjectContextData> {
    const filename = `project_context/project_overview.md`;

    if (await this.storage.exists(filename)) {
      const content = await this.storage.read(filename);
      this.context = this.parseProjectMarkdown(content);
      return this.context;
    }

    // 创建默认上下文
    this.context = this.createDefaultContext(projectName);
    await this.save();
    return this.context;
  }

  /**
   * 保存项目上下文
   */
  async save(): Promise<void> {
    if (!this.context) {
      throw new Error('No context to save');
    }

    this.context.projectInfo.lastUpdated = new Date().toISOString();
    const filename = `project_context/project_overview.md`;
    const content = this.formatProjectMarkdown(this.context);
    await this.storage.write(filename, content);
  }

  /**
   * 更新项目概述
   */
  async updateOverview(overview: string): Promise<void> {
    if (!this.context) {
      throw new Error('Context not loaded');
    }
    this.context.projectOverview = overview;
    await this.save();
  }

  /**
   * 添加技术栈项
   */
  async addTechStackItem(item: TechStackItem): Promise<void> {
    if (!this.context) {
      throw new Error('Context not loaded');
    }

    // 检查是否已存在
    const existingIndex = this.context.techStack.findIndex(
      t => t.category === item.category && t.technology === item.technology
    );

    if (existingIndex >= 0) {
      this.context.techStack[existingIndex] = item;
    } else {
      this.context.techStack.push(item);
    }

    await this.save();
  }

  /**
   * 添加已知问题
   */
  async addKnownIssue(issue: KnownIssue): Promise<void> {
    if (!this.context) {
      throw new Error('Context not loaded');
    }

    // 检查是否已存在
    const existingIndex = this.context.knownIssues.findIndex(i => i.issueId === issue.issueId);

    if (existingIndex >= 0) {
      this.context.knownIssues[existingIndex] = issue;
    } else {
      this.context.knownIssues.push(issue);
    }

    await this.save();
  }

  /**
   * 更新开发状态
   */
  async updateDevelopmentStatus(status: Partial<DevelopmentStatus>): Promise<void> {
    if (!this.context) {
      throw new Error('Context not loaded');
    }

    this.context.developmentStatus = {
      ...this.context.developmentStatus,
      ...status
    };
    await this.save();
  }

  /**
   * 添加待实现功能
   */
  async addPendingFeature(feature: string): Promise<void> {
    if (!this.context) {
      throw new Error('Context not loaded');
    }

    if (!this.context.developmentStatus.pendingFeatures.includes(feature)) {
      this.context.developmentStatus.pendingFeatures.push(feature);
      await this.save();
    }
  }

  /**
   * 添加进行中任务
   */
  async addInProgressTask(task: string): Promise<void> {
    if (!this.context) {
      throw new Error('Context not loaded');
    }

    if (!this.context.developmentStatus.inProgressTasks.includes(task)) {
      this.context.developmentStatus.inProgressTasks.push(task);
      await this.save();
    }
  }

  /**
   * 获取当前上下文
   */
  getContext(): ProjectContextData | null {
    return this.context;
  }

  /**
   * 创建默认项目上下文
   */
  private createDefaultContext(projectName: string): ProjectContextData {
    const now = new Date().toISOString();

    return {
      projectInfo: {
        projectName,
        createdTime: now,
        lastUpdated: now,
        projectType: 'unknown'
      },
      projectOverview: '项目概述待填写',
      techStack: [],
      architectureOverview: '架构概览待填写',
      moduleStructure: [],
      codeStandards: {
        namingConvention: '待定义',
        documentationRequirement: '待定义',
        testingRequirement: '待定义'
      },
      knownIssues: [],
      developmentStatus: {
        currentVersion: '0.1.0',
        pendingFeatures: [],
        inProgressTasks: [],
        technicalDebt: []
      }
    };
  }

  /**
   * 格式化项目上下文为 Markdown
   */
  private formatProjectMarkdown(context: ProjectContextData): string {
    const lines: string[] = [];

    lines.push('# 项目上下文');
    lines.push('');

    // 项目信息
    lines.push('## 项目信息');
    lines.push('');
    lines.push(`- 项目名称: ${context.projectInfo.projectName}`);
    lines.push(`- 创建时间: ${context.projectInfo.createdTime}`);
    lines.push(`- 最后更新: ${context.projectInfo.lastUpdated}`);
    lines.push(`- 项目类型: ${context.projectInfo.projectType}`);
    lines.push('');

    // 项目概述
    lines.push('## 项目概述');
    lines.push('');
    lines.push(context.projectOverview);
    lines.push('');

    // 技术栈
    if (context.techStack.length > 0) {
      lines.push('## 技术栈');
      lines.push('');
      lines.push('| 类别 | 技术 | 版本 | 用途 |');
      lines.push('|------|------|------|------|');
      for (const item of context.techStack) {
        lines.push(`| ${item.category} | ${item.technology} | ${item.version} | ${item.purpose} |`);
      }
      lines.push('');
    }

    // 架构概览
    lines.push('## 架构概览');
    lines.push('');
    lines.push(context.architectureOverview);
    lines.push('');

    // 模块结构
    if (context.moduleStructure.length > 0) {
      lines.push('## 模块结构');
      lines.push('');
      for (const module of context.moduleStructure) {
        lines.push(`### ${module.name}`);
        lines.push('');
        lines.push(module.description);
        lines.push('');
        lines.push('**职责:**');
        for (const resp of module.responsibilities) {
          lines.push(`- ${resp}`);
        }
        lines.push('');
      }
    }

    // 代码规范
    lines.push('## 代码规范');
    lines.push('');
    lines.push(`- 命名规范: ${context.codeStandards.namingConvention}`);
    lines.push(`- 文档要求: ${context.codeStandards.documentationRequirement}`);
    lines.push(`- 测试要求: ${context.codeStandards.testingRequirement}`);
    lines.push('');

    // 已知问题
    if (context.knownIssues.length > 0) {
      lines.push('## 已知问题');
      lines.push('');
      lines.push('| 问题ID | 描述 | 严重程度 | 状态 |');
      lines.push('|--------|------|----------|------|');
      for (const issue of context.knownIssues) {
        lines.push(`| ${issue.issueId} | ${issue.description} | ${issue.severity} | ${issue.status} |`);
      }
      lines.push('');
    }

    // 开发状态
    lines.push('## 开发状态');
    lines.push('');
    lines.push(`- 当前版本: ${context.developmentStatus.currentVersion}`);
    lines.push('');

    if (context.developmentStatus.pendingFeatures.length > 0) {
      lines.push('**待发布功能:**');
      for (const feature of context.developmentStatus.pendingFeatures) {
        lines.push(`- ${feature}`);
      }
      lines.push('');
    }

    if (context.developmentStatus.inProgressTasks.length > 0) {
      lines.push('**进行中任务:**');
      for (const task of context.developmentStatus.inProgressTasks) {
        lines.push(`- ${task}`);
      }
      lines.push('');
    }

    if (context.developmentStatus.technicalDebt.length > 0) {
      lines.push('**技术债务:**');
      for (const debt of context.developmentStatus.technicalDebt) {
        lines.push(`- ${debt}`);
      }
    }

    return lines.join('\n');
  }

  /**
   * 从 Markdown 解析项目上下文
   */
  private parseProjectMarkdown(content: string): ProjectContextData {
    // 简化版解析
    const lines = content.split('\n');
    const context = this.createDefaultContext('unknown');

    // 简单解析 - 实际应该更完整
    for (const line of lines) {
      if (line.startsWith('- 项目名称:')) {
        context.projectInfo.projectName = line.split(':')[1]?.trim() || 'unknown';
      } else if (line.startsWith('- 当前版本:')) {
        context.developmentStatus.currentVersion = line.split(':')[1]?.trim() || '0.1.0';
      }
    }

    return context;
  }
}
