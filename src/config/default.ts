import type { CompanionConfig } from '../types/index.js';
import { generateCodeStylePrompt } from './CodeStyleGuide.js';
import { generateAestheticsPrompt, defaultAestheticsConfig } from './AestheticsGuide.js';

/**
 * 默认配置
 */
export const defaultConfig: CompanionConfig = {
  memorySystem: {
    enabled: true,
    storagePath: './ModelMem',
    autoSave: true,
    autoLoad: true,
    semanticIndex: true,
    retentionDays: 365,
    globalAccess: true
  },
  persona: {
    defaultMode: 'efficient-partner',
    autoSwitch: true,
    manualOverride: true
  },
  mcp: {
    enabled: true,
    tools: ['file-read', 'file-write', 'file-search', 'code-exec'],
    strategy: 'transparent'
  },
  emotion: {
    enabled: true,
    memory: true,
    intensity: 'medium'
  },
  codeStyle: {
    usePlainLanguage: true,
    showCallRelations: true,
    showDataFlow: true,
    explainWhy: true,
    includeUsageExamples: true,
    descriptiveNames: true,
    avoidAbbreviations: true,
    contextualNaming: true,
    includeErrorHandling: true,
    includeBoundaryChecks: true,
    includeLogging: true
  },
  aesthetics: defaultAestheticsConfig
};

/**
 * 加载配置
 */
export function loadConfig(configPath?: string): CompanionConfig {
  // 实际实现会从配置文件加载
  // 这里返回默认配置
  return { ...defaultConfig };
}

/**
 * 合并配置
 */
export function mergeConfig(base: CompanionConfig, override: Partial<CompanionConfig>): CompanionConfig {
  return {
    memorySystem: { ...base.memorySystem, ...override.memorySystem },
    persona: { ...base.persona, ...override.persona },
    mcp: { ...base.mcp, ...override.mcp },
    emotion: { ...base.emotion, ...override.emotion }
  };
}

/**
 * 验证配置
 */
export function validateConfig(config: CompanionConfig): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // 验证记忆系统配置
  if (!config.memorySystem.storagePath) {
    errors.push('memorySystem.storagePath is required');
  }

  // 验证人配置
  const validPersonas = ['professional-mentor', 'efficient-partner', 'architect', 'explorer'];
  if (!validPersonas.includes(config.persona.defaultMode)) {
    errors.push(`Invalid persona mode: ${config.persona.defaultMode}`);
  }

  // 验证 MCP 配置
  if (config.mcp.enabled && config.mcp.tools.length === 0) {
    errors.push('MCP is enabled but no tools specified');
  }

  // 验证情感配置
  const validIntensities = ['low', 'medium', 'high'];
  if (!validIntensities.includes(config.emotion.intensity)) {
    errors.push(`Invalid emotion intensity: ${config.emotion.intensity}`);
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
