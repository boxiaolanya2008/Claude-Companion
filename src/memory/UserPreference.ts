import { FileSystemStorage } from './storage/StorageAdapter';
import type {
  UserPreferences,
  CommunicationPreferences,
  PersonaPreferences,
  TechnicalPreferences,
  WorkHabits
} from '../types/index.js';

/**
 * 用户偏好管理器
 * 负责管理和存储用户偏好设置
 */
export class UserPreference {
  private storage: FileSystemStorage;
  private preferences: UserPreferences | null = null;

  constructor(storage: FileSystemStorage) {
    this.storage = storage;
  }

  /**
   * 加载用户偏好
   */
  async load(userId: string): Promise<UserPreferences> {
    const filename = `user_profile/user_preferences.json`;

    if (await this.storage.exists(filename)) {
      const content = await this.storage.read(filename);
      this.preferences = JSON.parse(content) as UserPreferences;
      return this.preferences;
    }

    // 创建默认偏好
    this.preferences = this.createDefaultPreferences(userId);
    await this.save();
    return this.preferences;
  }

  /**
   * 保存用户偏好
   */
  async save(): Promise<void> {
    if (!this.preferences) {
      throw new Error('No preferences to save');
    }

    this.preferences.lastUpdated = new Date().toISOString();
    const filename = `user_profile/user_preferences.json`;
    await this.storage.write(filename, JSON.stringify(this.preferences, null, 2));
  }

  /**
   * 更新沟通偏好
   */
  async updateCommunication(prefs: Partial<CommunicationPreferences>): Promise<void> {
    if (!this.preferences) {
      throw new Error('Preferences not loaded');
    }

    this.preferences.preferences.communication = {
      ...this.preferences.preferences.communication,
      ...prefs
    };
    await this.save();
  }

  /**
   * 更新人格偏好
   */
  async updatePersona(prefs: Partial<PersonaPreferences>): Promise<void> {
    if (!this.preferences) {
      throw new Error('Preferences not loaded');
    }

    this.preferences.preferences.persona = {
      ...this.preferences.preferences.persona,
      ...prefs
    };
    await this.save();
  }

  /**
   * 更新技术偏好
   */
  async updateTechnical(prefs: Partial<TechnicalPreferences>): Promise<void> {
    if (!this.preferences) {
      throw new Error('Preferences not loaded');
    }

    this.preferences.preferences.technical = {
      ...this.preferences.preferences.technical,
      ...prefs
    };
    await this.save();
  }

  /**
   * 更新工作习惯
   */
  async updateWorkHabits(prefs: Partial<WorkHabits>): Promise<void> {
    if (!this.preferences) {
      throw new Error('Preferences not loaded');
    }

    this.preferences.preferences.workHabits = {
      ...this.preferences.preferences.workHabits,
      ...prefs
    };
    await this.save();
  }

  /**
   * 增加会话计数
   */
  async incrementSessionCount(): Promise<void> {
    if (!this.preferences) {
      throw new Error('Preferences not loaded');
    }

    this.preferences.interactionHistory.totalSessions++;
    this.preferences.interactionHistory.lastSessionDate = new Date().toISOString();
    await this.save();
  }

  /**
   * 记录常见任务
   */
  async recordCommonTask(task: string): Promise<void> {
    if (!this.preferences) {
      throw new Error('Preferences not loaded');
    }

    const tasks = this.preferences.interactionHistory.commonTasks;
    if (!tasks.includes(task)) {
      tasks.push(task);
      await this.save();
    }
  }

  /**
   * 获取当前偏好
   */
  getPreferences(): UserPreferences | null {
    return this.preferences;
  }

  /**
   * 获取默认人格模式
   */
  getDefaultPersona(): string {
    return this.preferences?.preferences.persona.defaultMode || 'efficient-partner';
  }

  /**
   * 创建默认用户偏好
   */
  private createDefaultPreferences(userId: string): UserPreferences {
    return {
      userId,
      lastUpdated: new Date().toISOString(),
      preferences: {
        communication: {
          detailLevel: 'balanced',
          responseFormat: 'markdown',
          codeComments: 'normal',
          explanationStyle: 'step-by-step'
        },
        persona: {
          defaultMode: 'efficient-partner',
          preferredModes: ['efficient-partner', 'professional-mentor'],
          modeSwitchTriggers: {
            learning: 'professional-mentor',
            quick_task: 'efficient-partner',
            design: 'architect',
            exploration: 'explorer'
          }
        },
        technical: {
          preferredLanguages: ['typescript', 'python'],
          preferredFrameworks: ['react', 'fastapi'],
          codeStyle: 'idiomatic',
          documentationRequirement: 'normal'
        },
        workHabits: {
          workingHours: '09:00-18:00',
          checkInFrequency: 'milestone',
          feedbackStyle: 'direct'
        }
      },
      interactionHistory: {
        totalSessions: 0,
        lastSessionDate: new Date().toISOString(),
        commonTasks: [],
        expertiseAreas: []
      }
    };
  }
}
