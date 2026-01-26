# Claude Companion

> 智能AI助手扩展架构 - 让 Claude Code 更强大

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![Node](https://img.shields.io/badge/Node-%3E=18.0.0-green.svg)](https://nodejs.org/)

Claude Companion 是一个功能强大的 AI 助手扩展架构，通过 MCP 协议与 Claude Code 深度集成，提供智能记忆、深度思考、多重人格、情感交互、高质量代码生成和 UI 美化等功能。

---

## ✨ 核心特性

| 特性 | 说明 |
|------|------|
| 🧠 **自动调用引擎** | 智能分析请求，自动选择最佳处理方式 |
| 💾 **持久化记忆系统** | 跨会话记忆管理（ModelMem），自动保存重要决策 |
| 🎭 **多重人格系统** | 四种预设人格 + 自动切换 |
| 📝 **代码风格优化** | 生成像真人写的代码，注释详细自然 |
| 🎨 **UI 美化架构** | Material Design 风格，自动生成美观组件 |
| 🔮 **深度思考引擎** | 五层推理架构 |
| ❤️ **情感智能** | 情绪检测与情感化响应 |
| 🔌 **MCP 协议支持** | 与 Claude Code 无缝集成 |

---

## 🚀 快速开始

### 安装

```bash
cd claude-companion
npm install
npm run build
```

### 配置 Claude Code

在 Claude Code 配置文件中添加 MCP 服务器：

**Windows**: `%APPDATA%\claude-code\settings.json`

**macOS/Linux**: `~/.config/claude-code/settings.json`

```json
{
  "mcpServers": {
    "claude-companion": {
      "command": "node",
      // 这里要换成你自己的路径
      "args": ["C:\\Users\\31702\\AppData\\Roaming\\npm\\node_modules\\@anthropic-ai\\claude-code\\claude-companion\\dist\\mcp\\run-server.js"],
      "env": {
        "NODE_PATH": "C:\\Users\\31702\\AppData\\Roaming\\npm\\node_modules"
      }
    }
  }
}
```

重启 Claude Code 即可使用。

---

## 💡 使用方式

### 推荐方式：智能自动处理

```
请使用 companion_auto_process: "帮我设计一个用户认证系统"
```

系统会自动：
- 分析问题复杂度
- 选择最适合的人格（架构师）
- 触发深度思考
- 保存决策到记忆
- 应用代码风格指南
- 应用 UI 美化指南（如果是界面相关）

### 显示分析过程

```
请使用 companion_auto_process 处理，显示分析：
"解释 React Hooks 的工作原理"
```

### 其他可用工具

| 工具 | 功能 | 使用场景 |
|------|------|----------|
| `companion_auto_process` | 智能自动处理 | **推荐**，日常使用 |
| `companion_process` | 手动指定处理 | 特定人格需求 |
| `companion_think` | 深度思考报告 | 复杂问题分析 |
| `companion_switch_persona` | 切换人格模式 | 手动切换人格 |
| `companion_get_memory` | 获取记忆摘要 | 查看历史和偏好 |
| `companion_get_status` | 系统状态报告 | 查看运行状态 |
| `companion_set_preference` | 设置用户偏好 | 自定义交互方式 |
| `companion_reflect` | 任务反思 | 总结经验教训 |
| `companion_save_conversation` | 保存对话 | 保存重要对话 |

---

## 🎭 人格系统

### 四种预设人格

| 人格 | 适用场景 | 特点 |
|------|----------|------|
| **专业导师** | 学习、解释概念 | 深入浅出、循序渐进 |
| **高效搭档** | 日常开发、快速实现 | 简洁高效、直奔主题 |
| **架构师** | 系统设计、技术选型 | 全局视野、长期演进 |
| **探索者** | 研究、创新 | 开放心态、快速迭代 |

### 自动人格映射

系统会根据问题类型自动切换人格：

```
学习问题 → 专业导师
设计问题 → 架构师
实现问题 → 高效搭档
研究问题 → 探索者
```

---

## 📝 代码风格优化

Companion 生成的代码具有以下特点：

### ✅ 大白话注释

```javascript
// 等页面加载完再初始化，不然拿不到DOM元素
function initComponent() { ... }
```

### ✅ 调用关系标注

```javascript
// 这个函数给 handleUserClick 调用，用来检查用户是不是点太快了
function checkClickSpeed(userId) {
  // 调用 getUserInfo 拿用户上次点击时间
  const userInfo = getUserInfo(userId);
}
```

### ✅ 数据流向说明

```javascript
// 拿用户输入 → 校验格式 → 发给后端 → 返回结果给界面
async function submitForm(data) { ... }
```

### ✅ 完善的错误处理

```javascript
try {
  const data = await fetchData();
} catch (err) {
  // 网络挂了或者数据格式不对
  console.error("拿数据失败:", err);
  return null;
}
```

### ✅ 边界检查

```javascript
// 先检查数组是不是空的，避免后面报错
if (!items || items.length === 0) {
  return [];
}

## 🎨 UI 美化架构

对于界面相关的请求，Companion 会自动应用 Material Design 风格 (来自Gemini-Cli System-Prompt)：

### 设计原则

- **Material Design**：卡片式布局、阴影、圆角
- **响应式设计**：移动优先，断点 640px/1024px
- **配色方案**：Primary #3B82F6，Secondary #64748B
- **微交互**：Hover 效果、过渡动画、波纹效果

### 自动组件生成

系统会根据需求自动生成组件代码：

```
请使用 companion_auto_process: "写一个登录页面，包含表单和按钮"
```

生成的代码包含：
- 响应式布局
- 美观的表单样式
- 带渐变的按钮
- 错误提示样式
- 完整的交互效果

### 组件示例

```jsx
// 主按钮 - 渐变背景、阴影、hover效果
<button className="bg-gradient-to-r from-blue-500 to-purple-600
                 text-white px-6 py-3 rounded-lg
                 shadow-lg hover:shadow-xl
                 transform hover:scale-105
                 transition-all duration-200">
  点击我
</button>

// 卡片 - 圆角、阴影、hover效果
<div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
  <h3 className="text-xl font-bold text-gray-900 mb-2">
    卡片标题
  </h3>
</div>
```

详细说明请查看 [AESTHETICS_GUIDE.md](AESTHETICS_GUIDE.md)

---

## 💾 记忆系统

### 自动保存

记忆会在以下情况自动保存：
- 添加决策或解决方案时
- 更新用户偏好或项目上下文时
- 添加待办事项时
- 记录任务时

### 记忆存储

所有记忆保存在当前项目的 `./ModelMem` 目录中：

```
ModelMem/
├── conversations/        # 对话历史
├── user_profile/         # 用户偏好
├── project_context/      # 项目上下文
├── session_memory/       # 当前会话
└── semantic_index/       # 语义索引
```

### 全局访问

支持跨项目访问记忆，通过 `globalAccess: true` 配置启用。

---

## 🧠 自动调用引擎

### 智能分析维度

| 分析项 | 触发条件 |
|--------|----------|
| 复杂度 | 消息长度、技术术语、问题类型 |
| 情绪强度 | 情绪关键词、感叹号数量 |
| 推荐人格 | 问题类型和上下文 |
| 记忆保存 | 包含"记住"、"决定"等关键词 |
| UI 相关 | 包含"界面"、"页面"、"组件"等关键词 |
| 工具需求 | 代码、搜索、文件等关键词 |

### 复杂度评估

| 级别 | 触发条件 | 处理方式 |
|------|----------|----------|
| 1-2 级 | 简单问题 | 直接回答 |
| 3 级 | 中等复杂 | 基础推理 |
| 4-5 级 | 多步骤、架构设计 | 深度思考 + 记忆保存 |

---

## 📂 项目结构

```
claude-companion/
├── src/
│   ├── core/                   # 核心引擎
│   │   ├── DeepThinkingEngine.ts
│   │   ├── ProblemParser.ts
│   │   ├── KnowledgeRetriever.ts
│   │   ├── StrategyPlanner.ts
│   │   ├── ExecutionReasoner.ts
│   │   └── ReflectionOptimizer.ts
│   ├── memory/                 # 记忆系统
│   │   ├── MemorySystem.ts
│   │   ├── ConversationMemory.ts
│   │   ├── UserPreference.ts
│   │   ├── ProjectContext.ts
│   │   ├── SemanticIndex.ts
│   │   └── storage/
│   ├── persona/                # 人格系统
│   │   ├── PersonaEngine.ts
│   │   ├── PersonaManager.ts
│   │   └── personas/
│   ├── emotion/                # 情感智能
│   │   └── EmotionalIntelligence.ts
│   ├── mcp/                    # MCP 集成
│   │   ├── server.ts
│   │   ├── AutoCallEngine.ts   # 自动调用引擎
│   │   └── run-server.ts
│   ├── config/                 # 配置
│   │   ├── default.ts
│   │   ├── CodeStyleGuide.ts   # 代码风格指南
│   │   ├── AestheticsGuide.ts  # 美化指南
│   │   └── AestheticsEngine.ts # 美化引擎
│   ├── skills/                 # 技能系统
│   ├── types/                  # 类型定义
│   └── index.ts
├── ModelMem/                   # 记忆存储目录
├── dist/                       # 编译输出
├── package.json
├── tsconfig.json
├── README.md
├── AUTO_CALL_GUIDE.md          # 自动调用指南
├── CODE_STYLE_GUIDE.md         # 代码风格指南
├── AESTHETICS_GUIDE.md         # 美化架构指南
└── COMMUNICATION.md            # 通信方式说明
```

---

## 🛠️ 开发

```bash
# 开发模式（监听文件变化）
npm run dev

# 构建项目
npm run build

# 运行测试
npm test

# 代码检查
npm run lint
```

## 🎯 使用示例

### 示例 1：自动处理架构设计

```
请使用 companion_auto_process: "如何设计一个支持百万用户的即时通讯系统？"
```

系统自动：
- 识别为架构设计问题 → 切换到架构师人格
- 检测高复杂度 → 触发深度思考
- 生成完整的架构方案
- 保存决策到记忆

### 示例 2：代码实现

```
请使用 companion_auto_process: "写一个函数来处理用户登录，要求支持token刷新"
```

系统自动：
- 识别为代码实现 → 切换到高效搭档人格
- 应用代码风格指南
- 生成带详细注释的代码
- 包含错误处理和边界检查

### 示例 3：UI 组件开发

```
请使用 companion_auto_process: "创建一个登录表单，包含用户名、密码输入框和登录按钮"
```

系统自动：
- 识别为 UI 相关请求
- 应用 Material Design 风格
- 生成响应式组件代码
- 包含美化样式和交互效果

### 示例 4：学习新概念

```
请使用 companion_auto_process: "我不理解 TypeScript 的泛型，能解释一下吗？"
```

系统自动：
- 识别为学习问题 → 切换到专业导师人格
- 生成循序渐进的解释
- 提供实际例子
- 鼓励自己尝试

---

## ⚙️ 配置选项

### 自动调用配置

```typescript
{
  autoPersonaSwitch: true,      // 自动人格切换
  autoDeepThinking: true,       // 自动深度思考
  autoMemorySave: true,         // 自动记忆保存
  deepThinkingThreshold: 3,     // 深度思考阈值 (1-5)
  emotionThreshold: 0.6         // 情绪响应阈值
}
```

### 代码风格配置

```typescript
{
  usePlainLanguage: true,        // 大白话注释
  showCallRelations: true,       // 标注调用关系
  showDataFlow: true,            // 标注数据流向
  explainWhy: true,              // 解释为什么
  includeUsageExamples: true,    // 包含使用示例
  descriptiveNames: true,        // 描述性命名
  avoidAbbreviations: true,      // 避免缩写
  includeErrorHandling: true,    // 包含错误处理
  includeBoundaryChecks: true,   // 包含边界检查
  includeLogging: true           // 包含日志
}
```

### 美化配置

```typescript
{
  designPrinciples: {
    useMaterialDesign: true,     // 使用 Material Design
    responsive: true,            // 响应式设计
    accessibility: true          // 无障碍支持
  },
  colorScheme: {
    primary: '#3B82F6',          // 主色调
    secondary: '#64748B',        // 次要色调
    success: '#10B981',          // 成功色
    warning: '#F59E0B',          // 警告色
    error: '#EF4444'             // 错误色
  }
}
```

---

## 🔍 故障排除

### MCP 服务器未启动

1. 检查配置文件路径是否正确
2. 确认 `npm run build` 已执行
3. 查看终端错误日志

### 工具调用失败

1. 确认 Claude Code 已重启
2. 检查 MCP 服务器是否正常运行
3. 尝试重新初始化

### 记忆未保存

1. 检查 `ModelMem/` 目录权限
2. 确认磁盘空间充足
3. 查看错误日志

### 代码风格未生效

1. 确认请求包含代码相关关键词
2. 检查 codeStyle 配置是否启用
3. 尝试明确指定"帮我写代码"

### UI 美化未生效

1. 确认请求包含界面相关关键词（界面、页面、组件等）
2. 检查 aesthetics 配置是否启用
3. 尝试明确指定"界面"或"UI"

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

---

## 🙏 致谢

本项目基于 [Anthropic Claude](https://www.anthropic.com/claude) 的设计理念，旨在为开发者提供更强大、更自然的 AI 辅助编程体验。

---

## 💡 重要提示

**关于架构效果的说明**：

Companion 的所有架构（代码风格、美化、深度思考等）**只在调用 Companion 工具时生效**。

- ✅ 调用 `companion_auto_process` → 架构生效
- ❌ 普通对话 → 架构不生效

这是因为 Companion 是作为"外挂"扩展存在的，需要你主动调用它的功能才能体验到增强效果。

**最佳实践**：
- 代码相关任务 → 使用 `companion_auto_process`
- 界面设计任务 → 使用 `companion_auto_process`（自动应用美化）
- 复杂问题分析 → 使用 `companion_think`
- 日常对话 → 直接对话即可
