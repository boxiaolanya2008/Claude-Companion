import { ProfessionalMentor } from './personas/ProfessionalMentor.js';
import { EfficientPartner } from './personas/EfficientPartner.js';
import { Architect } from './personas/Architect.js';
import { Explorer } from './personas/Explorer.js';
import type { Persona, PersonaType, PersonaSwitchContext } from '../types/index.js';

/**
 * 人格管理器
 * 管理所有人格定义和人格切换逻辑
 */
export class PersonaManager {
  private personas: Map<PersonaType, Persona>;
  private currentPersona: PersonaType;
  private switchHistory: Array<{ from: PersonaType; to: PersonaType; timestamp: string; reason: string }> = [];

  constructor(defaultPersona: PersonaType = 'efficient-partner') {
    // 注册所有人格
    this.personas = new Map([
      ['professional-mentor', ProfessionalMentor],
      ['efficient-partner', EfficientPartner],
      ['architect', Architect],
      ['explorer', Explorer]
    ]);

    this.currentPersona = defaultPersona;
  }

  /**
   * 获取当前人格
   */
  getCurrentPersona(): Persona {
    return this.personas.get(this.currentPersona) || EfficientPartner;
  }

  /**
   * 切换人格
   */
  switchPersona(personaType: PersonaType, reason: string = 'manual'): Persona {
    const persona = this.personas.get(personaType);

    if (!persona) {
      throw new Error(`Unknown persona type: ${personaType}`);
    }

    const previous = this.currentPersona;
    this.currentPersona = personaType;

    // 记录切换历史
    this.switchHistory.push({
      from: previous,
      to: personaType,
      timestamp: new Date().toISOString(),
      reason
    });

    return persona;
  }

  /**
   * 自动检测并切换人格
   */
  autoDetectAndSwitch(context: PersonaSwitchContext): Persona | null {
    const detected = this.detectPersona(context);

    if (detected && detected !== this.currentPersona) {
      return this.switchPersona(detected, 'auto-detect');
    }

    return null;
  }

  /**
   * 检测应该使用的人格
   */
  private detectPersona(context: PersonaSwitchContext): PersonaType | null {
    if (!context.taskType && !context.userRequest) {
      return null;
    }

    const request = (context.userRequest || '').toLowerCase();
    const taskType = context.taskType?.toLowerCase() || '';

    // 学习相关 -> 专业导师
    const learningKeywords = ['学习', '解释', '说明', '理解', '如何', '怎么', 'learn', 'explain', 'understand', 'how to'];
    if (learningKeywords.some(kw => request.includes(kw)) || taskType.includes('learning')) {
      return 'professional-mentor';
    }

    // 设计架构 -> 架构师
    const designKeywords = ['设计', '架构', '系统', '规划', 'design', 'architecture', 'system', 'plan'];
    if (designKeywords.some(kw => request.includes(kw)) || taskType.includes('design')) {
      return 'architect';
    }

    // 探索创新 -> 探索者
    const exploreKeywords = ['探索', '尝试', '新', '创新', '可能', 'explore', 'try', 'new', 'innovative'];
    if (exploreKeywords.some(kw => request.includes(kw)) || taskType.includes('exploration')) {
      return 'explorer';
    }

    // 快速任务 -> 高效搭档
    const quickKeywords = ['修复', '实现', '添加', 'fix', 'implement', 'add', 'quick'];
    if (quickKeywords.some(kw => request.includes(kw)) || taskType.includes('quick-task')) {
      return 'efficient-partner';
    }

    // 根据复杂度决定
    if (context.complexity && context.complexity >= 4) {
      return 'architect';
    }

    return null;
  }

  /**
   * 获取人格
   */
  getPersona(personaType: PersonaType): Persona | undefined {
    return this.personas.get(personaType);
  }

  /**
   * 获取所有人格
   */
  getAllPersonas(): Persona[] {
    return Array.from(this.personas.values());
  }

  /**
   * 获取人格列表
   */
  getPersonaTypes(): PersonaType[] {
    return Array.from(this.personas.keys());
  }

  /**
   * 生成人格化的响应
   */
  generatePersonalizedResponse(content: string, persona?: Persona): string {
    const activePersona = persona || this.getCurrentPersona();

    let response = '';

    // 添加开场白
    if (activePersona.responseTemplate.opening) {
      response += activePersona.responseTemplate.opening + '\n\n';
    }

    // 添加主体内容
    response += content;

    // 添加结束语
    if (activePersona.responseTemplate.closing) {
      response += '\n\n' + activePersona.responseTemplate.closing;
    }

    return response;
  }

  /**
   * 获取切换历史
   */
  getSwitchHistory(): Array<{ from: PersonaType; to: PersonaType; timestamp: string; reason: string }> {
    return [...this.switchHistory];
  }

  /**
   * 清除切换历史
   */
  clearSwitchHistory(): void {
    this.switchHistory = [];
  }

  /**
   * 获取人格统计
   */
  getPersonaStats(): {
    current: PersonaType;
    usageCount: Record<PersonaType, number>;
    switchCount: number;
  } {
    const usageCount: Record<PersonaType, number> = {
      'professional-mentor': 0,
      'efficient-partner': 0,
      'architect': 0,
      'explorer': 0
    };

    // 统计当前人格使用次数（实际上是切换到该人格的次数）
    for (const entry of this.switchHistory) {
      usageCount[entry.to]++;
    }

    return {
      current: this.currentPersona,
      usageCount,
      switchCount: this.switchHistory.length
    };
  }

  /**
   * 人格混合（结合多人格特质）
   */
  blendPersonas(primary: PersonaType, secondary: PersonaType[]): Partial<Persona> {
    const primaryPersona = this.personas.get(primary);
    if (!primaryPersona) {
      throw new Error(`Unknown primary persona: ${primary}`);
    }

    const blended: Partial<Persona> = {
      type: primary,
      name: `${primaryPersona.name} (混合)`,
      description: `主要使用${primaryPersona.name}特质，融合其他人格的优点`,
      communicationStyle: { ...primaryPersona.communicationStyle },
      thinkingCharacteristics: { ...primaryPersona.thinkingCharacteristics },
      responseTemplate: { ...primaryPersona.responseTemplate },
      suitableFor: [...(primaryPersona.suitableFor || [])]
    };

    // 融合次要人格特质
    for (const secType of secondary) {
      const secPersona = this.personas.get(secType);
      if (secPersona) {
        // 融合适用场景
        if (secPersona.suitableFor) {
          blended.suitableFor = [...(blended.suitableFor || []), ...secPersona.suitableFor];
        }
      }
    }

    // 去重
    if (blended.suitableFor) {
      blended.suitableFor = [...new Set(blended.suitableFor)];
    }

    return blended;
  }

  /**
   * 根据用户反馈调整人格
   */
  adjustPersonaBasedOnFeedback(feedback: {
    positive?: boolean;
    detail?: 'too-much' | 'too-little' | 'just-right';
    tone?: 'too-formal' | 'too-casual' | 'just-right';
  }): PersonaType | null {
    // 如果反馈说太详细，切换到高效搭档
    if (feedback.detail === 'too-much') {
      this.switchPersona('efficient-partner', 'feedback: too much detail');
      return 'efficient-partner';
    }

    // 如果反馈说太简略，切换到专业导师
    if (feedback.detail === 'too-little') {
      this.switchPersona('professional-mentor', 'feedback: too little detail');
      return 'professional-mentor';
    }

    // 如果反馈说太正式
    if (feedback.tone === 'too-formal') {
      this.switchPersona('efficient-partner', 'feedback: too formal');
      return 'efficient-partner';
    }

    // 如果反馈说太随意
    if (feedback.tone === 'too-casual') {
      this.switchPersona('architect', 'feedback: too casual');
      return 'architect';
    }

    return null;
  }
}
