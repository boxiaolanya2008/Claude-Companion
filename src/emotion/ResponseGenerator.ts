import type { EmotionType, EmotionalResponse } from '../types/index.js';

/**
 * 情感响应生成器
 * 根据检测到的情绪生成适当的情感化响应
 */
export class ResponseGenerator {
  // 情感响应模板
  private readonly responseTemplates: Record<EmotionType, {
    openings: string[];
    encouragements: string[];
    empathies: string[];
    closings: string[];
  }> = {
    positive: {
      openings: [
        '太棒了！',
        '做得好！',
        '恭喜你！',
        '这真是个好消息！'
      ],
      encouragements: [
        '继续保持！',
        '你做得很好！',
        '这个进步很棒！',
        '你的努力得到了回报！'
      ],
      empathies: [],
      closings: [
        '期待你的下一个成就！',
        '让我们继续前进！'
      ]
    },
    negative: {
      openings: [
        '我能理解你的感受。',
        '遇到困难是很正常的。',
        '让我们来看看问题出在哪里。'
      ],
      encouragements: [
        '你已经尝试了很多方法，这很好。',
        '每个问题都是学习的机会。',
        '我们一起慢慢解决。'
      ],
      empathies: [
        '这种情况确实让人沮丧。',
        '我能感受到你的困扰。',
        '别担心，我们一起想办法。'
      ],
      closings: [
        '一步一步来，会解决的。',
        '你并不孤单，我们一起面对。'
      ]
    },
    excited: {
      openings: [
        '哇！太棒了！',
        '我能感受到你的兴奋！',
        '这真是个突破！'
      ],
      encouragements: [
        '你的热情很有感染力！',
        '继续保持这种状态！',
        '让我们一起庆祝这个时刻！'
      ],
      empathies: [],
      closings: [
        '让我们趁热打铁！',
        '期待更多精彩！'
      ]
    },
    frustrated: {
      openings: [
        '我理解你的挫败感。',
        '这确实很令人烦恼。',
        '让我们换个角度看看。'
      ],
      encouragements: [
        '你已经坚持了很久，这不容易。',
        '也许我们需要换个方法试试。',
        '每次挫折都让我们更接近答案。'
      ],
      empathies: [
        '遇到这种问题确实很困扰。',
        '你的感受很正常。',
        '这种情况下我也会感到沮丧。'
      ],
      closings: [
        '让我们看看还有什么其他方法。',
        '我们一起找到解决方案。'
      ]
    },
    confused: {
      openings: [
        '没关系的，我来解释。',
        '这确实是个复杂的概念。',
        '让我们从头开始理解。'
      ],
      encouragements: [
        '提出问题说明你在思考。',
        '理解需要时间，慢慢来。',
        '我会用更简单的方式解释。'
      ],
      empathies: [
        '有些概念确实不容易理解。',
        '我也曾经对这个感到困惑。'
      ],
      closings: [
        '如果还有不明白的，随时问我。',
        '我们慢慢来，不着急。'
      ]
    },
    confident: {
      openings: [
        '很好！',
        '你已经理解了。',
        '让我们继续。'
      ],
      encouragements: [
        '保持这种状态！',
        '你的理解很到位。',
        '我们可以进入下一步了。'
      ],
      empathies: [],
      closings: [
        '还有什么其他问题吗？',
        '让我们继续推进。'
      ]
    },
    neutral: {
      openings: [
        '明白了。',
        '好的。',
        '收到。'
      ],
      encouragements: [],
      empathies: [],
      closings: [
        '还有什么需要帮助的吗？',
        '随时告诉我你的需求。'
      ]
    }
  };

  /**
   * 生成情感响应
   */
  generateResponse(
    emotion: EmotionType,
    context?: {
      userMessage?: string;
      taskProgress?: number;
      previousEmotion?: EmotionType;
    }
  ): EmotionalResponse {
    const templates = this.responseTemplates[emotion];

    // 根据情绪选择语气
    const tone = this.selectTone(emotion, context);

    // 生成消息
    const message = this.buildMessage(emotion, context);

    // 添加共情（针对负面情绪）
    const empathy = this.selectEmpathy(emotion, templates);

    // 添加鼓励（针对需要支持的情况）
    const encouragement = this.selectEncouragement(emotion, context, templates);

    return {
      message,
      empathy: empathy || undefined,
      encouragement: encouragement || undefined,
      tone
    };
  }

  /**
   * 选择语气
   */
  private selectTone(
    emotion: EmotionType,
    context?: {
      userMessage?: string;
      taskProgress?: number;
      previousEmotion?: EmotionType;
    }
  ): EmotionalResponse['tone'] {
    // 根据情绪选择基础语气
    const toneMap: Record<EmotionType, EmotionalResponse['tone']> = {
      positive: 'warm',
      negative: 'supportive',
      excited: 'enthusiastic',
      frustrated: 'supportive',
      confused: 'warm',
      confident: 'professional',
      neutral: 'professional'
    };

    let tone = toneMap[emotion];

    // 根据上下文调整语气
    if (context?.taskProgress !== undefined) {
      if (context.taskProgress < 0.3 && emotion === 'confused') {
        tone = 'warm'; // 需要更多耐心
      } else if (context.taskProgress > 0.8 && emotion === 'confident') {
        tone = 'enthusiastic'; // 接近完成，可以更热情
      }
    }

    // 检查情绪变化
    if (context?.previousEmotion) {
      if (context.previousEmotion === 'frustrated' && emotion === 'positive') {
        tone = 'enthusiastic'; // 从挫折到成功，要热烈庆祝
      }
    }

    return tone;
  }

  /**
   * 构建消息
   */
  private buildMessage(
    emotion: EmotionType,
    context?: {
      userMessage?: string;
      taskProgress?: number;
      previousEmotion?: EmotionType;
    }
  ): string {
    const templates = this.responseTemplates[emotion];
    const parts: string[] = [];

    // 开场白
    const opening = templates.openings[Math.floor(Math.random() * templates.openings.length)];
    parts.push(opening);

    // 根据情绪添加内容
    if (emotion === 'positive' || emotion === 'excited') {
      if (templates.encouragements.length > 0) {
        const encouragement = templates.encouragements[Math.floor(Math.random() * templates.encouragements.length)];
        parts.push(encouragement);
      }
    } else if (emotion === 'negative' || emotion === 'frustrated') {
      if (templates.empathies.length > 0) {
        const empathy = templates.empathies[Math.floor(Math.random() * templates.empathies.length)];
        parts.push(empathy);
      }
      if (templates.encouragements.length > 0) {
        const encouragement = templates.encouragements[Math.floor(Math.random() * templates.encouragements.length)];
        parts.push(encouragement);
      }
    } else if (emotion === 'confused') {
      parts.push('让我来帮你理解这个问题。');
    }

    // 结束语
    if (templates.closings.length > 0) {
      const closing = templates.closings[Math.floor(Math.random() * templates.closings.length)];
      parts.push(closing);
    }

    return parts.join(' ');
  }

  /**
   * 选择共情语句
   */
  private selectEmpathy(emotion: EmotionType, templates: { empathies: string[] }): string | null {
    if (templates.empathies.length === 0) {
      return null;
    }
    return templates.empathies[Math.floor(Math.random() * templates.empathies.length)];
  }

  /**
   * 选择鼓励语句
   */
  private selectEncouragement(
    emotion: EmotionType,
    context?: { taskProgress?: number },
    templates?: { encouragements: string[] }
  ): string | null {
    if (!templates || templates.encouragements.length === 0) {
      return null;
    }

    // 根据任务进度选择鼓励
    if (context?.taskProgress !== undefined) {
      if (context.taskProgress > 0.8) {
        return '你快要成功了，坚持住！';
      } else if (context.taskProgress < 0.3) {
        return '刚开始可能会有些困难，但你会掌握的。';
      }
    }

    return templates.encouragements[Math.floor(Math.random() * templates.encouragements.length)];
  }

  /**
   * 生成庆祝消息
   */
  generateCelebrationMessage(achievement: string): string {
    const celebrations = [
      `太棒了！${achievement}，这真是个里程碑！`,
      `恭喜你完成${achievement}！你的努力得到了回报！`,
      `太好了！${achievement}，你做得非常好！`,
      `成功了！${achievement}，为你感到骄傲！`
    ];

    return celebrations[Math.floor(Math.random() * celebrations.length)];
  }

  /**
   * 生成安慰消息
   */
  generateComfortMessage(issue: string): string {
    const comforts = [
      `遇到${issue}确实很困扰，但我们一起想办法解决。`,
      `这种情况下感到沮丧是正常的，让我们一步步来。`,
      `别担心，${issue}是可解的，我来帮助你。`,
      `深呼吸，我们一起面对${issue}。`
    ];

    return comforts[Math.floor(Math.random() * comforts.length)];
  }

  /**
   * 生成鼓励消息
   */
  generateEncouragementMessage(situation: string): string {
    const encouragements = [
      `关于${situation}，你已经做得很好了。继续加油！`,
      `${situation}虽然有挑战，但你有能力克服它。`,
      `相信你自己，${situation}难不倒你。`,
      `每一步都算数，${situation}也会解决的。`
    ];

    return encouragements[Math.floor(Math.random() * encouragements.length)];
  }

  /**
   * 组合情感响应与实际内容
   */
  combineWithContent(
    emotionalResponse: EmotionalResponse,
    actualContent: string
  ): string {
    const parts: string[] = [];

    // 情感开场
    if (emotionalResponse.message) {
      parts.push(emotionalResponse.message);
    }

    // 实际内容
    parts.push(actualContent);

    // 情感收尾
    if (emotionalResponse.encouragement) {
      parts.push(emotionalResponse.encouragement);
    }

    return parts.join('\n\n');
  }

  /**
   * 调整情感强度
   */
  adjustIntensity(response: EmotionalResponse, intensity: 'low' | 'medium' | 'high'): EmotionalResponse {
    const adjusted = { ...response };

    if (intensity === 'low') {
      // 降低情感表达
      adjusted.message = response.message.replace(/[！!]+/g, '。');
      if (adjusted.encouragement) {
        adjusted.encouragement = adjusted.encouragement.replace(/[！!]+/g, '。');
      }
    } else if (intensity === 'high') {
      // 增强情感表达
      adjusted.message = response.message + '！';
      if (adjusted.tone === 'warm') {
        adjusted.tone = 'enthusiastic';
      }
    }

    return adjusted;
  }

  /**
   * 生成情感上下文提示
   */
  generateEmotionalContextHint(emotion: EmotionType): string {
    const hints: Record<EmotionType, string> = {
      positive: '用户情绪积极，这是鼓励的好时机',
      negative: '用户情绪消极，需要更多的理解和支持',
      excited: '用户非常兴奋，可以分享这份喜悦',
      frustrated: '用户感到挫折，需要耐心引导',
      confused: '用户感到困惑，需要详细解释',
      confident: '用户充满信心，可以推进下一步',
      neutral: '用户情绪平稳，可以正常进行'
    };

    return hints[emotion];
  }
}
