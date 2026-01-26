/**
 * Claude Companion - 主入口
 * 基于 CLAUDE.md 设计的 AI 助手扩展架构
 */

export { MemorySystem } from './memory/MemorySystem.js';
export { ConversationMemory } from './memory/ConversationMemory.js';
export { UserPreference } from './memory/UserPreference.js';
export { ProjectContext } from './memory/ProjectContext.js';
export { SemanticIndex } from './memory/SemanticIndex.js';
export { FileSystemStorage } from './memory/storage/StorageAdapter.js';

export { DeepThinkingEngine } from './core/DeepThinkingEngine.js';
export { ProblemParser } from './core/ProblemParser.js';
export { KnowledgeRetriever } from './core/KnowledgeRetriever.js';
export { StrategyPlanner } from './core/StrategyPlanner.js';
export { ExecutionReasoner } from './core/ExecutionReasoner.js';
export { ReflectionOptimizer } from './core/ReflectionOptimizer.js';

export { PersonaEngine } from './persona/PersonaEngine.js';
export { PersonaManager } from './persona/PersonaManager.js';
export { ProfessionalMentor } from './persona/personas/ProfessionalMentor.js';
export { EfficientPartner } from './persona/personas/EfficientPartner.js';
export { Architect } from './persona/personas/Architect.js';
export { Explorer } from './persona/personas/Explorer.js';

export { EmotionalIntelligence } from './emotion/EmotionalIntelligence.js';
export { EmotionDetector } from './emotion/EmotionDetector.js';
export { ResponseGenerator } from './emotion/ResponseGenerator.js';

export { MCPClient } from './mcp/MCPClient.js';
export { ToolManager } from './mcp/ToolManager.js';
export { ToolRegistry, createDefaultRegistry } from './mcp/tools.js';
export { CompanionMCPServer, createMCPServer } from './mcp/server.js';
export { runMCPServer } from './mcp/run-server.js';

export { SkillLoader, SkillRegistry, createDefaultSkillRegistry } from './skills/SkillLoader.js';

export { defaultConfig, loadConfig, mergeConfig, validateConfig } from './config/default.js';

export * from './types/index.js';

// 导出主要类
export { default as Companion, createCompanion } from './Companion.js';
