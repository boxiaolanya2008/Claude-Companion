import type { EmotionType, EmotionDetectionResult } from '../types/index.js';

/**
 * 情绪检测器
 * 从用户消息中检测情绪状态
 */
export class EmotionDetector {
  // 情绪关键词模式
  private readonly emotionPatterns: Record<EmotionType, RegExp[]> = {
    positive: [
      /很棒|太好了|成功了|完美|excellent|great|awesome|perfect|success/i,
      /终于|做到了|解决了|不错|good|did it|solved/i
    ],
    negative: [
      /不行|没用|失败|错误|错了|wrong|fail|error|not work/i,
      /讨厌|烦人|糟糕|糟糕|bad|awful|terrible|hate/i,
      /怎么.*不行|为什么.*不|why.*not|how.*not/i
    ],
    excited: [
      /！！！|!!!|太.*了|简直|amazing|incredible|wow/i,
      /耶|太棒了|终于|成功了！|yay|finally/i
    ],
    frustrated: [
      /.*还是不行|.*又错了|.*又失败|still.*not|again.*wrong|again.*fail/i,
      /烦死了|搞什么|什么鬼|烦|wtf|ugh|annoying/i
    ],
    confused: [
      /不懂|不明白|什么意思|为什么|怎么|don't understand|confused|what do|how do/i,
      /不太懂|没懂|不太明白|not sure|don't get|unclear/i
    ],
    confident: [
      /我知道|我明白|没问题|当然|i know|i understand|sure|of course/i,
      /清楚|明白|懂了|got it|clear|understood/i
    ],
    neutral: [
      /./ // 默认匹配
    ]
  };

  /**
   * 检测消息中的情绪
   */
  detectEmotion(message: string): EmotionDetectionResult {
    const indicators: string[] = [];
    let detectedEmotion: EmotionType = 'neutral';
    let maxConfidence = 0;

    // 检查每种情绪模式
    for (const [emotion, patterns] of Object.entries(this.emotionPatterns)) {
      if (emotion === 'neutral') continue;

      for (const pattern of patterns) {
        if (pattern.test(message)) {
          const match = message.match(pattern);
          if (match) {
            indicators.push(`匹配模式: ${match[0]}`);
          }

          // 计算置信度（基于匹配次数和位置）
          const matches = message.match(new RegExp(pattern.source, 'gi'));
          const confidence = matches ? Math.min(matches.length * 0.3, 1) : 0.3;

          if (confidence > maxConfidence) {
            maxConfidence = confidence;
            detectedEmotion = emotion as EmotionType;
          }
        }
      }
    }

    // 如果没有检测到特定情绪，返回 neutral
    if (detectedEmotion === 'neutral' && indicators.length === 0) {
      return {
        emotion: 'neutral',
        confidence: 0.5,
        indicators: ['无明确情绪指示'],
        suggestedResponse: 'neutral'
      };
    }

    return {
      emotion: detectedEmotion,
      confidence: maxConfidence,
      indicators,
      suggestedResponse: this.suggestResponseForEmotion(detectedEmotion)
    };
  }

  /**
   * 建议针对情绪的响应方式
   */
  private suggestResponseForEmotion(emotion: EmotionType): string {
    const responseSuggestions: Record<EmotionType, string> = {
      positive: '分享喜悦，给予肯定',
      negative: '表达理解，提供支持',
      excited: '分享兴奋，热情回应',
      frustrated: '表达理解，引导回到问题解决',
      confused: '耐心解释，提供更多细节',
      confident: '确认理解，继续推进',
      neutral: '专业高效地处理请求'
    };

    return responseSuggestions[emotion];
  }

  /**
   * 分析情绪强度
   */
  analyzeEmotionIntensity(message: string): {
    level: 'low' | 'medium' | 'high';
    indicators: string[];
  } {
    const intensityIndicators = {
      high: [
        /！{2,}|!{2,}|！！！|!!!|非常|超级|特别|really|very|super|extremely/i,
        /！{1,}|!{1,}|太|很|so|too/i
      ],
      medium: [
        /有点|一些|somewhat|a bit|a little/i
      ],
      low: [
        /稍微|略|slightly|a bit/i
      ]
    };

    let level: 'low' | 'medium' | 'high' = 'low';
    const indicators: string[] = [];

    // 检查高强度
    for (const pattern of intensityIndicators.high) {
      if (pattern.test(message)) {
        level = 'high';
        const match = message.match(pattern);
        if (match) indicators.push(match[0]);
      }
    }

    // 检查中等强度
    if (level === 'low') {
      for (const pattern of intensityIndicators.medium) {
        if (pattern.test(message)) {
          level = 'medium';
          const match = message.match(pattern);
          if (match) indicators.push(match[0]);
        }
      }
    }

    return { level, indicators };
  }

  /**
   * 检测情绪变化趋势
   */
  detectEmotionTrend(
    previousEmotions: EmotionType[]
  ): {
    trend: 'improving' | 'declining' | 'stable' | 'fluctuating';
    analysis: string;
  } {
    if (previousEmotions.length < 2) {
      return {
        trend: 'stable',
        analysis: '数据不足，无法判断趋势'
      };
    }

    const recent = previousEmotions.slice(-5);
    const negativeCount = recent.filter(e => e === 'negative' || e === 'frustrated').length;
    const positiveCount = recent.filter(e => e === 'positive' || e === 'excited' || e === 'confident').length;

    if (negativeCount >= 3) {
      return {
        trend: 'declining',
        analysis: '检测到持续的负面情绪，用户可能遇到困难'
      };
    }

    if (positiveCount >= 3) {
      return {
        trend: 'improving',
        analysis: '检测到持续的正向情绪，用户进展顺利'
      };
    }

    // 检查波动
    const uniqueEmotions = new Set(recent);
    if (uniqueEmotions.size >= 4) {
      return {
        trend: 'fluctuating',
        analysis: '情绪波动较大，建议关注用户状态'
      };
    }

    return {
      trend: 'stable',
      analysis: '情绪状态相对稳定'
    };
  }

  /**
   * 生成情绪报告
   */
  generateEmotionReport(message: string): string {
    const detection = this.detectEmotion(message);
    const intensity = this.analyzeEmotionIntensity(message);

    const lines: string[] = [];

    lines.push('## 情绪检测报告');
    lines.push('');
    lines.push(`**检测到的情绪**: ${detection.emotion}`);
    lines.push(`**置信度**: ${Math.round(detection.confidence * 100)}%`);
    lines.push(`**强度**: ${intensity.level}`);
    lines.push('');
    lines.push('**指示器**:');
    for (const indicator of detection.indicators) {
      lines.push(`- ${indicator}`);
    }
    lines.push('');
    lines.push(`**建议响应**: ${detection.suggestedResponse}`);
    lines.push('');

    return lines.join('\n');
  }

  /**
   * 批量检测情绪
   */
  detectBatch(messages: string[]): EmotionDetectionResult[] {
    return messages.map(msg => this.detectEmotion(msg));
  }

  /**
   * 获取情绪统计
   */
  getEmotionStats(emotions: EmotionType[]): {
    distribution: Record<EmotionType, number>;
    dominant: EmotionType;
    sentiment: 'positive' | 'negative' | 'neutral';
  } {
    const distribution: Record<EmotionType, number> = {
      positive: 0,
      negative: 0,
      excited: 0,
      frustrated: 0,
      confused: 0,
      confident: 0,
      neutral: 0
    };

    for (const emotion of emotions) {
      distribution[emotion]++;
    }

    // 找出主导情绪
    let dominant: EmotionType = 'neutral';
    let maxCount = 0;
    for (const [emotion, count] of Object.entries(distribution)) {
      if (count > maxCount) {
        maxCount = count;
        dominant = emotion as EmotionType;
      }
    }

    // 确定整体情感倾向
    const positiveTotal = distribution.positive + distribution.excited + distribution.confident;
    const negativeTotal = distribution.negative + distribution.frustrated;

    let sentiment: 'positive' | 'negative' | 'neutral' = 'neutral';
    if (positiveTotal > negativeTotal * 1.5) {
      sentiment = 'positive';
    } else if (negativeTotal > positiveTotal * 1.5) {
      sentiment = 'negative';
    }

    return {
      distribution,
      dominant,
      sentiment
    };
  }
}
