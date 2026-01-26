import type { Skill, SkillCategory, SkillLoadResult } from '../types/index.js';

/**
 * 技能加载器
 * 动态加载和管理技能包
 */
export class SkillLoader {
  private loadedSkills: Map<string, Skill> = new Map();
  private skillRegistry: SkillRegistry;

  constructor(registry: SkillRegistry) {
    this.skillRegistry = registry;
  }

  /**
   * 加载技能
   */
  async load(skillIds: string[]): Promise<SkillLoadResult> {
    const result: SkillLoadResult = {
      success: true,
      loadedSkills: [],
      failedSkills: []
    };

    for (const skillId of skillIds) {
      try {
        // 检查依赖
        const skill = this.skillRegistry.get(skillId);
        if (!skill) {
          result.failedSkills.push(skillId);
          continue;
        }

        // 加载依赖
        if (skill.dependencies.length > 0) {
          const depResult = await this.load(skill.dependencies);
          if (depResult.failedSkills.length > 0) {
            result.failedSkills.push(skillId);
            continue;
          }
        }

        // 加载技能
        const loaded = await this.loadSkill(skill);
        if (loaded) {
          this.loadedSkills.set(skillId, loaded);
          result.loadedSkills.push(skillId);
        } else {
          result.failedSkills.push(skillId);
        }
      } catch (error) {
        result.failedSkills.push(skillId);
        console.error(`Failed to load skill ${skillId}:`, error);
      }
    }

    result.success = result.failedSkills.length === 0;
    return result;
  }

  /**
   * 卸载技能
   */
  async unload(skillId: string): Promise<boolean> {
    const skill = this.loadedSkills.get(skillId);
    if (!skill) {
      return false;
    }

    // 检查是否有其他技能依赖此技能
    for (const [id, s] of this.loadedSkills) {
      if (id !== skillId && s.dependencies.includes(skillId)) {
        throw new Error(`Cannot unload ${skillId}: ${id} depends on it`);
      }
    }

    this.loadedSkills.delete(skillId);
    return true;
  }

  /**
   * 重新加载技能
   */
  async reload(skillId: string): Promise<boolean> {
    if (!this.loadedSkills.has(skillId)) {
      return false;
    }

    await this.unload(skillId);
    const result = await this.load([skillId]);
    return result.loadedSkills.includes(skillId);
  }

  /**
   * 加载技能（内部实现）
   */
  private async loadSkill(skill: Skill): Promise<Skill | null> {
    // 这里是模拟加载，实际会根据技能类型进行不同的加载
    return {
      ...skill,
      loaded: true
    };
  }

  /**
   * 获取已加载的技能
   */
  getLoadedSkills(): Skill[] {
    return Array.from(this.loadedSkills.values());
  }

  /**
   * 检查技能是否已加载
   */
  isLoaded(skillId: string): boolean {
    return this.loadedSkills.has(skillId);
  }

  /**
   * 获取技能
   */
  getSkill(skillId: string): Skill | undefined {
    return this.loadedSkills.get(skillId);
  }

  /**
   * 按类别获取已加载的技能
   */
  getSkillsByCategory(category: SkillCategory): Skill[] {
    return Array.from(this.loadedSkills.values()).filter(s => s.category === category);
  }

  /**
   * 清空所有已加载的技能
   */
  async unloadAll(): Promise<void> {
    // 按依赖顺序逆序卸载
    const sorted = Array.from(this.loadedSkills.values()).sort((a, b) => {
      return b.dependencies.length - a.dependencies.length;
    });

    for (const skill of sorted) {
      await this.unload(skill.id);
    }
  }

  /**
   * 获取加载统计
   */
  getLoadStats(): {
    totalLoaded: number;
    byCategory: Record<SkillCategory, number>;
  } {
    const byCategory: Record<SkillCategory, number> = {
      core: 0,
      domain: 0,
      specialized: 0
    };

    for (const skill of this.loadedSkills.values()) {
      byCategory[skill.category]++;
    }

    return {
      totalLoaded: this.loadedSkills.size,
      byCategory
    };
  }
}

/**
 * 技能注册表
 */
export class SkillRegistry {
  private skills: Map<string, Skill> = new Map();

  /**
   * 注册技能
   */
  register(skill: Skill): void {
    this.skills.set(skill.id, skill);
  }

  /**
   * 批量注册
   */
  registerAll(skills: Skill[]): void {
    for (const skill of skills) {
      this.register(skill);
    }
  }

  /**
   * 获取技能
   */
  get(id: string): Skill | undefined {
    return this.skills.get(id);
  }

  /**
   * 检查技能是否存在
   */
  has(id: string): boolean {
    return this.skills.has(id);
  }

  /**
   * 列出所有技能
   */
  list(): Skill[] {
    return Array.from(this.skills.values());
  }

  /**
   * 按类别列出技能
   */
  listByCategory(category: SkillCategory): Skill[] {
    return Array.from(this.skills.values()).filter(s => s.category === category);
  }

  /**
   * 搜索技能
   */
  search(query: string): Skill[] {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.skills.values()).filter(s =>
      s.id.toLowerCase().includes(lowerQuery) ||
      s.name.toLowerCase().includes(lowerQuery) ||
      s.description.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * 清空注册表
   */
  clear(): void {
    this.skills.clear();
  }

  /**
   * 获取技能数量
   */
  size(): number {
    return this.skills.size;
  }
}

/**
 * 核心技能定义
 */
export const coreSkills: Skill[] = [
  {
    id: 'core.reasoning',
    name: '基础推理',
    category: 'core',
    description: '基本的逻辑推理能力',
    capabilities: ['逻辑分析', '问题分解', '模式识别'],
    loaded: false,
    dependencies: []
  },
  {
    id: 'core.programming',
    name: '基础编程',
    category: 'core',
    description: '基本编程能力',
    capabilities: ['代码理解', '代码生成', '调试'],
    loaded: false,
    dependencies: ['core.reasoning']
  },
  {
    id: 'core.communication',
    name: '基础沟通',
    category: 'core',
    description: '基本的沟通协作能力',
    capabilities: ['表达清晰', '理解意图', '反馈'],
    loaded: false,
    dependencies: []
  }
];

/**
 * Web 开发技能
 */
export const webSkills: Skill[] = [
  {
    id: 'web.frontend',
    name: '前端开发',
    category: 'domain',
    description: 'Web 前端开发技能',
    capabilities: ['React', 'Vue', 'TypeScript', 'CSS'],
    loaded: false,
    dependencies: ['core.programming']
  },
  {
    id: 'web.backend',
    name: '后端开发',
    category: 'domain',
    description: 'Web 后端开发技能',
    capabilities: ['Node.js', 'Python', 'API 设计', '数据库'],
    loaded: false,
    dependencies: ['core.programming']
  },
  {
    id: 'web.fullstack',
    name: '全栈开发',
    category: 'domain',
    description: 'Web 全栈开发技能',
    capabilities: ['前后端集成', '部署', 'DevOps'],
    loaded: false,
    dependencies: ['web.frontend', 'web.backend']
  }
];

/**
 * 专项技能
 */
export const specializedSkills: Skill[] = [
  {
    id: 'specialized.refactoring',
    name: '代码重构',
    category: 'specialized',
    description: '代码重构专项技能',
    capabilities: ['代码分析', '重构策略', '测试保护'],
    loaded: false,
    dependencies: ['core.programming']
  },
  {
    id: 'specialized.performance',
    name: '性能优化',
    category: 'specialized',
    description: '性能优化专项技能',
    capabilities: ['性能分析', '瓶颈识别', '优化策略'],
    loaded: false,
    dependencies: ['core.programming']
  },
  {
    id: 'specialized.security',
    name: '安全审计',
    category: 'specialized',
    description: '安全审计专项技能',
    capabilities: ['漏洞检测', '安全分析', '防护建议'],
    loaded: false,
    dependencies: ['core.programming']
  },
  {
    id: 'specialized.architecture',
    name: '架构设计',
    category: 'specialized',
    description: '架构设计专项技能',
    capabilities: ['系统设计', '模式选择', '可扩展性'],
    loaded: false,
    dependencies: ['core.reasoning']
  }
];

/**
 * 创建默认技能注册表
 */
export function createDefaultSkillRegistry(): SkillRegistry {
  const registry = new SkillRegistry();
  registry.registerAll(coreSkills);
  registry.registerAll(webSkills);
  registry.registerAll(specializedSkills);
  return registry;
}
