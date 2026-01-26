import type { Skill, SkillCategory } from '../types/index.js';

/**
 * 技能注册表
 * 管理所有可用的技能
 */
export class SkillRegistry {
  private skills: Map<string, Skill> = new Map();
  private categoryIndex: Map<SkillCategory, Set<string>> = new Map();

  /**
   * 注册技能
   */
  register(skill: Skill): void {
    this.skills.set(skill.id, skill);

    if (!this.categoryIndex.has(skill.category)) {
      this.categoryIndex.set(skill.category, new Set());
    }
    this.categoryIndex.get(skill.category)?.add(skill.id);
  }

  /**
   * 注销技能
   */
  unregister(skillId: string): void {
    const skill = this.skills.get(skillId);
    if (skill) {
      this.categoryIndex.get(skill.category)?.delete(skillId);
      this.skills.delete(skillId);
    }
  }

  /**
   * 获取技能
   */
  get(skillId: string): Skill | undefined {
    return this.skills.get(skillId);
  }

  /**
   * 按类别获取技能
   */
  getByCategory(category: SkillCategory): Skill[] {
    const skillIds = this.categoryIndex.get(category);
    if (!skillIds) {
      return [];
    }

    return Array.from(skillIds)
      .map(id => this.skills.get(id))
      .filter((skill): skill is Skill => skill !== undefined);
  }

  /**
   * 获取所有技能
   */
  getAll(): Skill[] {
    return Array.from(this.skills.values());
  }

  /**
   * 获取已加载的技能
   */
  getLoaded(): Skill[] {
    return this.getAll().filter(skill => skill.loaded);
  }

  /**
   * 获取未加载的技能
   */
  getUnloaded(): Skill[] {
    return this.getAll().filter(skill => !skill.loaded);
  }

  /**
   * 搜索技能
   */
  search(query: string): Skill[] {
    const lowerQuery = query.toLowerCase();

    return this.getAll().filter(skill =>
      skill.id.toLowerCase().includes(lowerQuery) ||
      skill.name.toLowerCase().includes(lowerQuery) ||
      skill.description.toLowerCase().includes(lowerQuery) ||
      skill.capabilities.some(cap => cap.toLowerCase().includes(lowerQuery))
    );
  }

  /**
   * 获取所有类别
   */
  getCategories(): SkillCategory[] {
    return Array.from(this.categoryIndex.keys());
  }

  /**
   * 检查技能是否存在
   */
  has(skillId: string): boolean {
    return this.skills.has(skillId);
  }

  /**
   * 获取技能统计
   */
  getStats(): {
    total: number;
    loaded: number;
    byCategory: Record<SkillCategory, number>;
  } {
    const byCategory: Record<SkillCategory, number> = {
      core: 0,
      domain: 0,
      specialized: 0
    };

    for (const [category, ids] of this.categoryIndex) {
      byCategory[category] = ids.size;
    }

    return {
      total: this.skills.size,
      loaded: this.getLoaded().length,
      byCategory
    };
  }

  /**
   * 清空注册表
   */
  clear(): void {
    this.skills.clear();
    this.categoryIndex.clear();
  }

  /**
   * 获取技能依赖
   */
  getDependencies(skillId: string): Skill[] {
    const skill = this.get(skillId);
    if (!skill) {
      return [];
    }

    const dependencies: Skill[] = [];
    for (const depId of skill.dependencies) {
      const dep = this.get(depId);
      if (dep) {
        dependencies.push(dep);
      }
    }

    return dependencies;
  }

  /**
   * 获取依赖者
   */
  getDependents(skillId: string): Skill[] {
    const dependents: Skill[] = [];

    for (const skill of this.getAll()) {
      if (skill.dependencies.includes(skillId)) {
        dependents.push(skill);
      }
    }

    return dependents;
  }

  /**
   * 检查循环依赖
   */
  hasCircularDependency(skillId: string, visited = new Set<string>()): boolean {
    if (visited.has(skillId)) {
      return true;
    }

    visited.add(skillId);

    const skill = this.get(skillId);
    if (!skill) {
      return false;
    }

    for (const depId of skill.dependencies) {
      if (this.hasCircularDependency(depId, visited)) {
        return true;
      }
    }

    visited.delete(skillId);
    return false;
  }

  /**
   * 获取加载顺序
   */
  getLoadOrder(skillIds: string[]): string[] {
    const order: string[] = [];
    const visited = new Set<string>();
    const visiting = new Set<string>();

    const visit = (skillId: string) => {
      if (visited.has(skillId)) {
        return;
      }

      if (visiting.has(skillId)) {
        throw new Error(`Circular dependency detected: ${skillId}`);
      }

      visiting.add(skillId);

      const skill = this.get(skillId);
      if (skill) {
        for (const depId of skill.dependencies) {
          visit(depId);
        }
      }

      visiting.delete(skillId);
      visited.add(skillId);
      order.push(skillId);
    };

    for (const skillId of skillIds) {
      visit(skillId);
    }

    return order;
  }
}
