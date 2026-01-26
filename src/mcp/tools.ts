/**
 * MCP 工具注册表
 * 提供工具的注册和查找功能
 */
export class ToolRegistry {
  private tools: Map<string, ToolDefinition> = new Map();

  /**
   * 注册工具
   */
  register(tool: ToolDefinition): void {
    this.tools.set(tool.name, tool);
  }

  /**
   * 注销工具
   */
  unregister(name: string): void {
    this.tools.delete(name);
  }

  /**
   * 获取工具
   */
  get(name: string): ToolDefinition | undefined {
    return this.tools.get(name);
  }

  /**
   * 检查工具是否存在
   */
  has(name: string): boolean {
    return this.tools.has(name);
  }

  /**
   * 列出所有工具
   */
  list(): ToolDefinition[] {
    return Array.from(this.tools.values());
  }

  /**
   * 按类别列出工具
   */
  listByCategory(category: string): ToolDefinition[] {
    return Array.from(this.tools.values()).filter(t => t.category === category);
  }

  /**
   * 搜索工具
   */
  search(query: string): ToolDefinition[] {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.tools.values()).filter(t =>
      t.name.toLowerCase().includes(lowerQuery) ||
      t.description.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * 清空注册表
   */
  clear(): void {
    this.tools.clear();
  }

  /**
   * 获取工具数量
   */
  size(): number {
    return this.tools.size;
  }
}

/**
 * 工具定义
 */
export interface ToolDefinition {
  name: string;
  description: string;
  category: string;
  parameters: ParameterSchema;
  handler: (params: Record<string, unknown>) => Promise<ToolResult>;
  dangerous?: boolean;
  riskLevel?: 'low' | 'medium' | 'high';
}

/**
 * 参数模式
 */
export interface ParameterSchema {
  type: 'object' | 'string' | 'number' | 'boolean' | 'array';
  properties?: Record<string, ParameterSchema>;
  required?: string[];
  description?: string;
  enum?: unknown[];
}

/**
 * 工具执行结果
 */
export interface ToolResult {
  success: boolean;
  data?: unknown;
  error?: string;
  metadata?: Record<string, unknown>;
}

/**
 * 默认工具集合
 */
export const defaultTools: ToolDefinition[] = [
  // 文件操作工具
  {
    name: 'read_file',
    description: '读取文件内容',
    category: 'filesystem',
    parameters: {
      type: 'object',
      properties: {
        path: { type: 'string', description: '文件路径' },
        encoding: { type: 'string', description: '文件编码', enum: ['utf-8', 'utf-16', 'ascii'] }
      },
      required: ['path']
    },
    handler: async (params) => {
      // 实际实现会使用文件系统 API
      return {
        success: true,
        data: { content: 'file content' }
      };
    },
    riskLevel: 'low'
  },
  {
    name: 'write_file',
    description: '写入文件内容',
    category: 'filesystem',
    parameters: {
      type: 'object',
      properties: {
        path: { type: 'string', description: '文件路径' },
        content: { type: 'string', description: '文件内容' },
        encoding: { type: 'string', description: '文件编码', enum: ['utf-8', 'utf-16', 'ascii'] }
      },
      required: ['path', 'content']
    },
    handler: async (params) => {
      return {
        success: true,
        data: { written: true }
      };
    },
    riskLevel: 'medium'
  },
  {
    name: 'delete_file',
    description: '删除文件',
    category: 'filesystem',
    parameters: {
      type: 'object',
      properties: {
        path: { type: 'string', description: '文件路径' }
      },
      required: ['path']
    },
    handler: async (params) => {
      return {
        success: true,
        data: { deleted: true }
      };
    },
    dangerous: true,
    riskLevel: 'high'
  },
  {
    name: 'list_directory',
    description: '列出目录内容',
    category: 'filesystem',
    parameters: {
      type: 'object',
      properties: {
        path: { type: 'string', description: '目录路径' },
        recursive: { type: 'boolean', description: '是否递归' }
      },
      required: ['path']
    },
    handler: async (params) => {
      return {
        success: true,
        data: { entries: [] }
      };
    },
    riskLevel: 'low'
  },
  // 搜索工具
  {
    name: 'search_files',
    description: '搜索文件',
    category: 'search',
    parameters: {
      type: 'object',
      properties: {
        pattern: { type: 'string', description: '搜索模式' },
        path: { type: 'string', description: '搜索路径' },
        filePattern: { type: 'string', description: '文件名模式' }
      },
      required: ['pattern']
    },
    handler: async (params) => {
      return {
        success: true,
        data: { matches: [] }
      };
    },
    riskLevel: 'low'
  },
  {
    name: 'search_content',
    description: '搜索文件内容',
    category: 'search',
    parameters: {
      type: 'object',
      properties: {
        pattern: { type: 'string', description: '搜索模式' },
        path: { type: 'string', description: '搜索路径' },
        filePattern: { type: 'string', description: '文件名模式' }
      },
      required: ['pattern', 'path']
    },
    handler: async (params) => {
      return {
        success: true,
        data: { matches: [] }
      };
    },
    riskLevel: 'low'
  },
  // 执行工具
  {
    name: 'execute_command',
    description: '执行 shell 命令',
    category: 'execution',
    parameters: {
      type: 'object',
      properties: {
        command: { type: 'string', description: '要执行的命令' },
        cwd: { type: 'string', description: '工作目录' },
        timeout: { type: 'number', description: '超时时间(毫秒)' }
      },
      required: ['command']
    },
    handler: async (params) => {
      return {
        success: true,
        data: { stdout: '', stderr: '', exitCode: 0 }
      };
    },
    dangerous: true,
    riskLevel: 'high'
  }
];

/**
 * 创建带默认工具的注册表
 */
export function createDefaultRegistry(): ToolRegistry {
  const registry = new ToolRegistry();
  for (const tool of defaultTools) {
    registry.register(tool);
  }
  return registry;
}
