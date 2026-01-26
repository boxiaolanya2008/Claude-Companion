// ============================================================================
// 核心类型定义
// ============================================================================

// ============================================================================
// 记忆系统类型
// ============================================================================

export interface ConversationMetadata {
  conversationId: string;
  title: string;
  startTime: string;
  endTime: string;
  userName: string;
  project: string;
  summary: string;
}

export interface ConversationRecord {
  metadata: ConversationMetadata;
  summary: string;
  keyDecisions: DecisionRecord[];
  problemsAndSolutions: ProblemSolution[];
  technicalDetails: TechnicalDetails;
  todos: TodoItem[];
  userFeedback?: string;
  relatedMemories: string[];
}

export interface DecisionRecord {
  decisionPoint: string;
  decision: string;
  reason: string;
}

export interface ProblemSolution {
  problem: string;
  solution: string;
  result: string;
}

export interface TechnicalDetails {
  usedTechnologies: Technology[];
  keyCodes: string[];
}

export interface Technology {
  name: string;
  purpose: string;
}

export interface TodoItem {
  id: string;
  task: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
}

// 用户偏好类型
export interface UserPreferences {
  userId: string;
  lastUpdated: string;
  preferences: {
    communication: CommunicationPreferences;
    persona: PersonaPreferences;
    technical: TechnicalPreferences;
    workHabits: WorkHabits;
  };
  interactionHistory: InteractionHistory;
}

export interface CommunicationPreferences {
  detailLevel: 'concise' | 'balanced' | 'comprehensive';
  responseFormat: 'markdown' | 'text' | 'json';
  codeComments: 'minimal' | 'normal' | 'verbose';
  explanationStyle: 'direct' | 'step-by-step' | 'analogy';
}

export interface PersonaPreferences {
  defaultMode: PersonaType;
  preferredModes: PersonaType[];
  modeSwitchTriggers: Record<string, PersonaType>;
}

export interface TechnicalPreferences {
  preferredLanguages: string[];
  preferredFrameworks: string[];
  codeStyle: string;
  documentationRequirement: 'minimal' | 'normal' | 'comprehensive';
}

export interface WorkHabits {
  workingHours: string;
  checkInFrequency: 'continuous' | 'milestone' | 'completion';
  feedbackStyle: 'direct' | 'gentle' | 'encouraging';
}

export interface InteractionHistory {
  totalSessions: number;
  lastSessionDate: string;
  commonTasks: string[];
  expertiseAreas: string[];
}

// 项目上下文类型
export interface ProjectContext {
  projectInfo: ProjectInfo;
  projectOverview: string;
  techStack: TechStackItem[];
  architectureOverview: string;
  moduleStructure: ModuleInfo[];
  codeStandards: CodeStandards;
  knownIssues: KnownIssue[];
  developmentStatus: DevelopmentStatus;
}

export interface ProjectInfo {
  projectName: string;
  createdTime: string;
  lastUpdated: string;
  projectType: string;
}

export interface TechStackItem {
  category: string;
  technology: string;
  version: string;
  purpose: string;
}

export interface ModuleInfo {
  name: string;
  description: string;
  responsibilities: string[];
}

export interface CodeStandards {
  namingConvention: string;
  documentationRequirement: string;
  testingRequirement: string;
}

export interface KnownIssue {
  issueId: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: string;
}

export interface DevelopmentStatus {
  currentVersion: string;
  pendingFeatures: string[];
  inProgressTasks: string[];
  technicalDebt: string[];
}

// 记忆检索结果
export interface MemoryRetrievalResult {
  conversations: ConversationRecord[];
  userPreferences?: UserPreferences;
  projectContext?: ProjectContext;
  relevanceScore: number;
}

// ============================================================================
// 深度思考引擎类型
// ============================================================================

export interface ProblemParseResult {
  originalRequest: string;
  coreIntent: string;
  complexityRating: {
    level: 1 | 2 | 3 | 4 | 5;
    estimatedTime: 'quick' | 'medium' | 'long' | 'multi-session';
    requiredResources: string[];
  };
  keyConstraints: {
    hardConstraints: string[];
    softConstraints: string[];
  };
  strategy: {
    strategyType: 'direct-answer' | 'guided' | 'collaborative' | 'research';
    mainSteps: string[];
    potentialRisks: string[];
  };
  needConfirmation: string[];
  relatedMemories: MemoryRetrievalResult;
}

export interface StrategyPlan {
  requirementsBreakdown: Requirement[];
  technologySelection: TechnologyOption[];
  architectureDesign: ArchitectureDesign;
  riskAssessment: Risk[];
  milestones: Milestone[];
}

export interface Requirement {
  id: string;
  description: string;
  input: string;
  output: string;
  acceptanceCriteria: string[];
}

export interface TechnologyOption {
  name: string;
  pros: string[];
  cons: string[];
  recommendation: boolean;
}

export interface ArchitectureDesign {
  modules: ModuleDesign[];
  dataFlow: string;
  interfaces: Interface[];
  extensibility: string[];
}

export interface ModuleDesign {
  name: string;
  purpose: string;
  dependencies: string[];
}

export interface Interface {
  name: string;
  input: string;
  output: string;
}

export interface Risk {
  id: string;
  description: string;
  probability: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
  mitigation: string;
}

export interface Milestone {
  id: string;
  name: string;
  description: string;
  criteria: string[];
}

export interface ReflectionReport {
  taskCompletion: '100%' | 'partial' | 'follow-up-required';
  processEvaluation: {
    smooth: string[];
    challenging: string[];
    discoveries: string[];
  };
  improvements: {
    thinking: string[];
    communication: string[];
    technical: string[];
  };
  learned: {
    newKnowledge: string[];
    reusablePatterns: string[];
    areasToLearn: string[];
  };
  memoryUpdates: string[];
}

// ============================================================================
// 人格系统类型
// ============================================================================

export type PersonaType = 'professional-mentor' | 'efficient-partner' | 'architect' | 'explorer';

export interface Persona {
  type: PersonaType;
  name: string;
  description: string;
  communicationStyle: CommunicationStyle;
  thinkingCharacteristics: ThinkingCharacteristics;
  responseTemplate: ResponseTemplate;
  suitableFor: string[];
}

export interface CommunicationStyle {
  languageTemperature: 'warm' | 'professional' | 'enthusiastic' | 'efficient';
  explanationDepth: 'step-by-step' | 'concise' | 'comprehensive' | 'exploratory';
  interactionMode: 'question-guided' | 'direct' | 'systematic' | 'brainstorming';
  feedbackStyle: 'encouraging' | 'focused' | 'analytical' | 'iterative';
}

export interface ThinkingCharacteristics {
  priorities: string[];
  approach: string;
  reasoning: string;
}

export interface ResponseTemplate {
  opening: string;
  body: string[];
  closing: string;
}

export interface PersonaSwitchContext {
  taskType?: string;
  userRequest?: string;
  currentMood?: string;
  complexity?: number;
}

// ============================================================================
// 情感智能类型
// ============================================================================

export type EmotionType = 'positive' | 'negative' | 'neutral' | 'excited' | 'frustrated' | 'confused' | 'confident';

export interface EmotionDetectionResult {
  emotion: EmotionType;
  confidence: number;
  indicators: string[];
  suggestedResponse: string;
}

export interface EmotionalResponse {
  message: string;
  empathy?: string;
  encouragement?: string;
  tone: 'warm' | 'professional' | 'enthusiastic' | 'supportive';
}

// ============================================================================
// MCP 类型
// ============================================================================

export interface MCPTool {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
  handler: (params: Record<string, unknown>) => Promise<MCPToolResult>;
}

export interface MCPToolResult {
  success: boolean;
  data?: unknown;
  error?: string;
}

export interface MCPToolCallPlan {
  toolName: string;
  purpose: string;
  parameters: Record<string, unknown>;
  expectedResult: string;
  riskAssessment: {
    level: 'low' | 'medium' | 'high';
    potentialRisks: string[];
    mitigation: string[];
  };
  fallback?: string;
}

// ============================================================================
// 技能系统类型
// ============================================================================

export type SkillCategory = 'core' | 'domain' | 'specialized';

export interface Skill {
  id: string;
  name: string;
  category: SkillCategory;
  description: string;
  capabilities: string[];
  loaded: boolean;
  dependencies: string[];
}

export interface SkillLoadResult {
  success: boolean;
  loadedSkills: string[];
  failedSkills: string[];
}

// ============================================================================
// 配置类型
// ============================================================================

export interface CompanionConfig {
  memorySystem: MemorySystemConfig;
  persona: PersonaConfig;
  mcp: MCPConfig;
  emotion: EmotionConfig;
  codeStyle?: CodeStyleConfig;
  aesthetics?: AestheticsConfig;
}

export interface CodeStyleConfig {
  usePlainLanguage: boolean;
  showCallRelations: boolean;
  showDataFlow: boolean;
  explainWhy: boolean;
  includeUsageExamples: boolean;
  descriptiveNames: boolean;
  avoidAbbreviations: boolean;
  contextualNaming: boolean;
  includeErrorHandling: boolean;
  includeBoundaryChecks: boolean;
  includeLogging: boolean;
}

export interface AestheticsConfig {
  designPrinciples: {
    useMaterialDesign: boolean;
    useModernLayouts: boolean;
    responsiveDesign: boolean;
    microInteractions: boolean;
  };
  visualStyle: {
    colorScheme: 'light' | 'dark' | 'auto';
    borderRadius: 'sharp' | 'rounded' | 'circular';
    shadows: boolean;
    animations: boolean;
    spacing: 'compact' | 'comfortable' | 'spacious';
  };
  componentLibrary: {
    primary: 'bootstrap' | 'material-ui' | 'tailwind' | 'custom';
    icons: 'material-icons' | 'font-awesome' | 'heroicons' | 'emoji';
    typography: 'system' | 'google-fonts' | 'custom';
  };
  codeOrganization: {
    componentBased: boolean;
    separationOfConcerns: boolean;
    reusableComponents: boolean;
    folderStructure: 'feature-based' | 'type-based';
  };
  performanceOptimization: {
    lazyLoading: boolean;
    codeSplitting: boolean;
    treeShaking: boolean;
    imageOptimization: boolean;
  };
}

export interface MemorySystemConfig {
  enabled: boolean;
  storagePath: string;
  autoSave: boolean;
  autoLoad: boolean;
  semanticIndex: boolean;
  retentionDays?: number;
  globalAccess?: boolean;
}

export interface PersonaConfig {
  defaultMode: PersonaType;
  autoSwitch: boolean;
  manualOverride: boolean;
}

export interface MCPConfig {
  enabled: boolean;
  tools: string[];
  strategy: 'transparent' | 'auto' | 'conservative';
}

export interface EmotionConfig {
  enabled: boolean;
  memory: boolean;
  intensity: 'low' | 'medium' | 'high';
}

// ============================================================================
// 主系统类型
// ============================================================================

export interface CompanionInput {
  message: string;
  context?: {
    language?: string;
    framework?: string;
    conversationId?: string;
  };
  attachments?: string[];
}

export interface CompanionOutput {
  response: string;
  persona?: PersonaType;
  emotions?: EmotionType[];
  toolsUsed?: string[];
  memoryUpdates?: string[];
  followUpSuggestions?: string[];
}

export interface CompanionSession {
  sessionId: string;
  startTime: string;
  currentPersona: PersonaType;
  conversationHistory: ConversationMessage[];
  memoryLoaded: boolean;
}

export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  emotion?: EmotionType;
  persona?: PersonaType;
}
