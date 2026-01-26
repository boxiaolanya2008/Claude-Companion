import { EmotionDetector } from './EmotionDetector.js';
import { ResponseGenerator } from './ResponseGenerator.js';
import { MemorySystem } from '../memory/MemorySystem.js';
import type { EmotionType, EmotionDetectionResult, EmotionalResponse } from '../types/index.js';

/**
 * 情感智能模块
 * 整合情绪检测和响应生成
 */
export class EmotionalIntelligence {
  private detector: EmotionDetector;
  private generator: ResponseGenerator;
  private memory: MemorySystem;
  private emotionHistory: Array<{ emotion: EmotionType; timestamp: string; confidence: number }> = [];

  constructor(memory: MemorySystem) {
    this.detector = new EmotionDetector();
    this.generator = new ResponseGenerator();
    this.memory = memory;
  }

  /**
   * 处理消息并生成情感化响应
   */
  async processMessage(message: string, context?: {
    taskProgress?: number;
    currentPersona?: string;
  }): Promise<{
    detection: EmotionDetectionResult;
    response: EmotionalResponse;
    trend?: {
      trend: 'improving' | 'declining' | 'stable' | 'fluctuating';
      analysis: string;
    };
  }> {
    // 检测情绪
    const detection = this.detector.detectEmotion(message);

    // 记录情绪历史
    this.emotionHistory.push({
      emotion: detection.emotion,
      timestamp: new Date().toISOString(),
      confidence: detection.confidence
    });

    // 分析情绪趋势
    const recentEmotions = this.emotionHistory.slice(-10).map(e => e.emotion);
    const trend = this.detector.detectEmotionTrend(recentEmotions);

    // 生成情感响应
    const response = this.generator.generateResponse(detection.emotion, {
      userMessage: message,
      taskProgress: context?.taskProgress,
      previousEmotion: recentEmotions[recentEmotions.length - 2]
    });

    return {
      detection,
      response,
      trend
    };
  }

  /**
   * 只检测情绪
   */
  detectEmotion(message: string): EmotionDetectionResult {
    return this.detector.detectEmotion(message);
  }

  /**
   * 生成情感响应
   */
  generateResponse(emotion: EmotionType, context?: {
    userMessage?: string;
    taskProgress?: number;
    previousEmotion?: EmotionType;
  }): EmotionalResponse {
    return this.generator.generateResponse(emotion, context);
  }

  /**
   * 组合情感响应与实际内容
   */
  combineWithContent(emotionalResponse: EmotionalResponse, actualContent: string): string {
    return this.generator.combineWithContent(emotionalResponse, actualContent);
  }

  /**
   * 生成庆祝消息
   */
  celebrate(achievement: string): string {
    return this.generator.generateCelebrationMessage(achievement);
  }

  /**
   * 生成安慰消息
   */
  comfort(issue: string): string {
    return this.generator.generateComfortMessage(issue);
  }

  /**
   * 生成鼓励消息
   */
  encourage(situation: string): string {
    return this.generator.generateEncouragementMessage(situation);
  }

  /**
   * 获取情绪历史
   */
  getEmotionHistory(): Array<{ emotion: EmotionType; timestamp: string; confidence: number }> {
    return [...this.emotionHistory];
  }

  /**
   * 获取情绪统计
   */
  getEmotionStats() {
    const emotions = this.emotionHistory.map(e => e.emotion);
    return this.detector.getEmotionStats(emotions);
  }

  /**
   * 清除情绪历史
   */
  clearHistory(): void {
    this.emotionHistory = [];
  }

  /**
   * 检查是否需要关怀介入
   */
  needsCareIntervention(): boolean {
    if (this.emotionHistory.length < 3) {
      return false;
    }

    const recent = this.emotionHistory.slice(-5);
    const negativeCount = recent.filter(e => e.emotion === 'negative' || e.emotion === 'frustrated').length;

    // 连续3条负面情绪或最近5条中3条以上负面
    if (negativeCount >= 3) {
      return true;
    }

    // 检查是否有强烈的挫折情绪
    const hasStrongFrustration = recent.some(e =>
      e.emotion === 'frustrated' && e.confidence > 0.7
    );

    return hasStrongFrustration;
  }

  /**
   * 生成关怀消息
   */
  generateCareMessage(): string {
    const messages = [
      '我注意到你最近似乎遇到了一些困难。如果你想聊聊，我在这里。',
      '有些问题确实让人困扰。别担心，我们可以一起慢慢解决。',
      '休息一下也许会有帮助。当你准备好时，我们继续。',
      '每个人的进展速度不同，按照自己的节奏来就好。'
    ];

    return messages[Math.floor(Math.random() * messages.length)];
  }

  /**
   * 生成情绪报告
   */
  generateEmotionReport(message?: string): string {
    const lines: string[] = [];

    lines.push('## 情感状态报告');
    lines.push('');

    // 如果提供了消息，分析该消息
    if (message) {
      lines.push(this.detector.generateEmotionReport(message));
    }

    // 情绪统计
    const stats = this.getEmotionStats();
    if (this.emotionHistory.length > 0) {
      lines.push('### 情绪统计');
      lines.push('');
      lines.push(`**主导情绪**: ${stats.dominant}`);
      lines.push(`**情感倾向**: ${stats.sentiment}`);
      lines.push('');
      lines.push('**分布**:');
      for (const [emotion, count] of Object.entries(stats.distribution)) {
        if (count > 0) {
          lines.push(`- ${emotion}: ${count}`);
        }
      }
      lines.push('');
    }

    // 情绪趋势
    if (this.emotionHistory.length >= 2) {
      const recentEmotions = this.emotionHistory.slice(-10).map(e => e.emotion);
      const trend = this.detector.detectEmotionTrend(recentEmotions);

      lines.push('### 情绪趋势');
      lines.push('');
      lines.push(`**趋势**: ${trend.trend}`);
      lines.push(`**分析**: ${trend.analysis}`);
      lines.push('');
    }

    // 关怀建议
    if (this.needsCareIntervention()) {
      lines.push('### 关怀建议');
      lines.push('');
      lines.push('检测到持续的负面情绪，建议：');
      lines.push('- 表达理解和支持');
      lines.push('- 引导用户休息');
      lines.push('- 提供更详细的解释');
      lines.push('- 降低任务难度');
      lines.push('');
    }

    return lines.join('\n');
  }

  /**
   * 获取情感建议
   */
  getEmotionalAdvice(emotion: EmotionType): {
    responseStyle: string;
    interactionApproach: string;
    thingsToAvoid: string[];
  } {
    const advice: Record<EmotionType, {
      responseStyle: string;
      interactionApproach: string;
      thingsToAvoid: string[];
    }> = {
      positive: {
        responseStyle: '热情、肯定',
        interactionApproach: '分享成功，鼓励继续',
        thingsToAvoid: ['冷淡回应', '忽视成就']
      },
      negative: {
        responseStyle: '理解、支持',
        interactionApproach: '表达共情，提供帮助',
        thingsToAvoid: ['轻视问题', '过度乐观', '急于解决']
      },
      excited: {
        responseStyle: '热情、分享',
        interactionApproach: '共同庆祝，保持势头',
        thingsToAvoid: ['泼冷水', '转移话题']
      },
      frustrated: {
        responseStyle: '耐心、支持',
        interactionApproach: '确认感受，引导解决',
        thingsToAvoid: ['催促', '指责', '简单说"不难"']
      },
      confused: {
        responseStyle: '耐心、详细',
        interactionApproach: '循序渐进，多举例子',
        thingsToAvoid: ['使用术语', '跳跃式讲解', '显得不耐烦']
      },
      confident: {
        responseStyle: '专业、高效',
        interactionApproach: '确认理解，推进任务',
        thingsToAvoid: ['过度解释', '质疑能力']
      },
      neutral: {
        responseStyle: '专业、高效',
        interactionApproach: '直接处理请求',
        thingsToAvoid: ['过度寒暄', '不必要的情感表达']
      }
    };

    return advice[emotion];
  }

  /**
   * 获取情绪检测器
   */
  getDetector(): EmotionDetector {
    return this.detector;
  }

  /**
   * 获取响应生成器
   */
  getGenerator(): ResponseGenerator {
    return this.generator;
  }

  /**
   * 设置情感响应强度
   */
  setIntensity(intensity: 'low' | 'medium' | 'high'): void {
    // 这里可以添加逻辑来调整整体情感响应强度
    // 当前通过 ResponseGenerator.adjustIntensity 实现
  }

  /**
   * 获取建议的响应语气
   */
  getRecommendedTone(emotion: EmotionType): 'warm' | 'professional' | 'enthusiastic' | 'supportive' {
    const toneMap: Record<EmotionType, 'warm' | 'professional' | 'enthusiastic' | 'supportive'> = {
      positive: 'warm',
      negative: 'supportive',
      excited: 'enthusiastic',
      frustrated: 'supportive',
      confused: 'warm',
      confident: 'professional',
      neutral: 'professional'
    };

    return toneMap[emotion];
  }
}
