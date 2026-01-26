import * as fs from 'fs/promises';
import * as path from 'path';
import { existsSync } from 'fs';

/**
 * 存储适配器接口
 * 定义所有存储操作的标准接口
 */
export interface IStorageAdapter {
  read(filePath: string): Promise<string>;
  write(filePath: string, content: string): Promise<void>;
  exists(filePath: string): Promise<boolean>;
  mkdir(dirPath: string): Promise<void>;
  delete(filePath: string): Promise<void>;
  list(dirPath: string): Promise<string[]>;
}

/**
 * 文件系统存储适配器
 * 使用本地文件系统进行持久化存储
 */
export class FileSystemStorage implements IStorageAdapter {
  private basePath: string;

  constructor(basePath: string) {
    this.basePath = path.resolve(basePath);
  }

  /**
   * 获取完整的文件路径
   */
  private fullPath(filePath: string): string {
    return path.join(this.basePath, filePath);
  }

  /**
   * 读取文件内容
   */
  async read(filePath: string): Promise<string> {
    const fullPath = this.fullPath(filePath);
    try {
      return await fs.readFile(fullPath, 'utf-8');
    } catch (error) {
      throw new Error(`Failed to read file ${fullPath}: ${error}`);
    }
  }

  /**
   * 写入文件内容
   */
  async write(filePath: string, content: string): Promise<void> {
    const fullPath = this.fullPath(filePath);
    const dir = path.dirname(fullPath);

    // 确保目录存在
    await this.ensureDirectoryExists(dir);

    try {
      await fs.writeFile(fullPath, content, 'utf-8');
    } catch (error) {
      throw new Error(`Failed to write file ${fullPath}: ${error}`);
    }
  }

  /**
   * 检查文件是否存在
   */
  async exists(filePath: string): Promise<boolean> {
    return existsSync(this.fullPath(filePath));
  }

  /**
   * 创建目录（递归）
   */
  async mkdir(dirPath: string): Promise<void> {
    const fullPath = this.fullPath(dirPath);
    await this.ensureDirectoryExists(fullPath);
  }

  /**
   * 删除文件
   */
  async delete(filePath: string): Promise<void> {
    const fullPath = this.fullPath(filePath);
    try {
      await fs.unlink(fullPath);
    } catch (error) {
      throw new Error(`Failed to delete file ${fullPath}: ${error}`);
    }
  }

  /**
   * 列出目录内容
   */
  async list(dirPath: string): Promise<string[]> {
    const fullPath = this.fullPath(dirPath);
    try {
      const entries = await fs.readdir(fullPath, { withFileTypes: true });
      return entries
        .filter(entry => entry.isFile() || entry.isDirectory())
        .map(entry => entry.name);
    } catch (error) {
      throw new Error(`Failed to list directory ${fullPath}: ${error}`);
    }
  }

  /**
   * 确保目录存在（辅助方法）
   */
  private async ensureDirectoryExists(dirPath: string): Promise<void> {
    try {
      await fs.mkdir(dirPath, { recursive: true });
    } catch (error) {
      // 忽略目录已存在的错误
      if ((error as NodeJS.ErrnoException).code !== 'EEXIST') {
        throw error;
      }
    }
  }

  /**
   * 初始化存储目录结构
   */
  async initializeStructure(): Promise<void> {
    const directories = [
      'conversations',
      'user_profile',
      'project_context',
      'session_memory',
      'semantic_index'
    ];

    for (const dir of directories) {
      await this.mkdir(dir);
    }

    // 创建清单文件
    const manifestPath = 'memory_manifest.json';
    if (!(await this.exists(manifestPath))) {
      const manifest = {
        version: '1.0.0',
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        totalConversations: 0,
        totalMemories: 0
      };
      await this.write(manifestPath, JSON.stringify(manifest, null, 2));
    }
  }

  /**
   * 获取基础路径
   */
  getBasePath(): string {
    return this.basePath;
  }
}
