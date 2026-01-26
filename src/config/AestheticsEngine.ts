/**
 * 美化和视觉优化引擎
 * 自动检测UI/界面相关请求，应用美化指南
 */

import type { AestheticsConfig } from '../types/index.js';
import { generateAestheticsPrompt, generateTechStackRecommendation } from '../config/AestheticsGuide.js';
import type { Companion } from '../Companion.js';

/**
 * 美化请求分析结果
 */
export interface AestheticsAnalysis {
  isUIRelated: boolean;           // 是否是UI相关请求
  needsStyling: boolean;          // 是否需要样式
  appType: string;                // 应用类型
  components: string[];           // 需要的组件
  designRequirements: string[];   // 设计要求
}

/**
 * 美化引擎配置
 */
export interface AestheticsEngineConfig {
  autoApply: boolean;             // 自动应用美化指南
  detectUIRequests: boolean;      // 检测UI相关请求
  suggestComponents: boolean;     // 建议使用组件
  generateExamples: boolean;      // 生成代码示例
}

/**
 * 美化和视觉优化引擎
 */
export class AestheticsEngine {
  private config: AestheticsEngineConfig;
  private aestheticsConfig: AestheticsConfig;

  constructor(aestheticsConfig: AestheticsConfig, config?: AestheticsEngineConfig) {
    this.aestheticsConfig = aestheticsConfig;
    this.config = {
      autoApply: true,
      detectUIRequests: true,
      suggestComponents: true,
      generateExamples: true,
      ...config
    };
  }

  /**
   * 分析请求是否需要美化
   */
  analyzeRequest(request: string): AestheticsAnalysis {
    const analysis: AestheticsAnalysis = {
      isUIRelated: false,
      needsStyling: false,
      appType: 'unknown',
      components: [],
      designRequirements: []
    };

    // 检测UI相关关键词
    const uiPatterns = [
      /界面|UI|页面|网页/i,
      /美化|样式|CSS|设计/i,
      /布局|响应式|适配/i,
      /按钮|表单|卡片/i,
      /动画|过渡|交互/i,
      /React|Vue|Angular|前端/i,
      /组件|Component/i,
      /Bootstrap|Tailwind|Material/i
    ];

    analysis.isUIRelated = uiPatterns.some(pattern => pattern.test(request));

    if (!analysis.isUIRelated) {
      return analysis;
    }

    // 确定应用类型
    if (/网站|网页|前端/i.test(request)) {
      analysis.appType = 'website';
    } else if (/全栈|前后端/i.test(request)) {
      analysis.appType = 'fullstack';
    } else if (/接口|API|后端/i.test(request)) {
      analysis.appType = 'api';
    } else if (/移动|APP|手机/i.test(request)) {
      analysis.appType = 'mobile';
    } else if (/CLI|命令行/i.test(request)) {
      analysis.appType = 'cli';
    }

    // 检测需要的组件
    const componentPatterns: Record<string, RegExp[]> = {
      '导航栏': [/导航|navbar|header/i],
      '按钮': [/按钮|button/i],
      '表单': [/表单|form|输入|input/i],
      '卡片': [/卡片|card/i],
      '模态框': [/弹窗|modal|dialog/i],
      '列表': [/列表|list/i],
      '表格': [/表格|table/i],
      '轮播图': [/轮播|carousel|slider/i],
      '下拉菜单': [/下拉|dropdown|select/i],
      '标签页': [/标签|tab/i]
    };

    for (const [component, patterns] of Object.entries(componentPatterns)) {
      if (patterns.some(pattern => pattern.test(request))) {
        analysis.components.push(component);
      }
    }

    // 检测设计要求
    if (/响应式|手机|平板/i.test(request)) {
      analysis.designRequirements.push('responsive');
    }
    if (/动画|过渡|交互/i.test(request)) {
      analysis.designRequirements.push('animations');
    }
    if (/暗色|深色|夜间模式/i.test(request)) {
      analysis.designRequirements.push('dark-mode');
    }
    if (/圆角|阴影|渐变/i.test(request)) {
      analysis.designRequirements.push('modern-style');
    }

    analysis.needsStyling = true;

    return analysis;
  }

  /**
   * 为请求添加美化指南
   */
  enhanceRequestWithAesthetics(request: string): string {
    if (!this.config.autoApply) {
      return request;
    }

    const analysis = this.analyzeRequest(request);

    if (!analysis.isUIRelated) {
      return request;
    }

    const parts: string[] = [request];

    // 添加技术栈推荐
    if (analysis.appType !== 'unknown') {
      parts.push('\n\n');
      parts.push(generateTechStackRecommendation(analysis.appType));
    }

    // 添加美化指南
    parts.push('\n\n');
    parts.push(generateAestheticsPrompt(this.aestheticsConfig));

    // 如果需要特定组件，添加组件示例
    if (analysis.components.length > 0 && this.config.suggestComponents) {
      parts.push('\n\n');
      parts.push('## 需要的组件示例');
      parts.push('');
      parts.push(`根据请求，需要以下组件: ${analysis.components.join(', ')}`);
      parts.push('');
      parts.push(this.generateComponentExamples(analysis.components));
    }

    return parts.join('\n');
  }

  /**
   * 生成组件示例代码
   */
  private generateComponentExamples(components: string[]): string {
    const examples: string[] = [];

    const componentCode: Record<string, string> = {
      '导航栏': `
// 导航栏组件 - 响应式、带阴影
<nav className="bg-white shadow-md sticky top-0 z-50">
  <div className="max-w-7xl mx-auto px-4 sm:px-6">
    <div className="flex justify-between h-16">
      {/* Logo */}
      <div className="flex items-center">
        <a href="/" className="text-2xl font-bold text-blue-600">
          Logo
        </a>
      </div>

      {/* 桌面端导航 */}
      <div className="hidden md:flex items-center space-x-8">
        <a href="/" className="text-gray-700 hover:text-blue-600 transition">
          首页
        </a>
        <a href="/about" className="text-gray-700 hover:text-blue-600 transition">
          关于
        </a>
        <a href="/contact" className="text-gray-700 hover:text-blue-600 transition">
          联系
        </a>
      </div>

      {/* 移动端菜单按钮 */}
      <div className="md:hidden">
        <button className="text-gray-700 hover:text-blue-600">
          <svg className="w-6 h-6" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</nav>
`,

      '按钮': `
// 按钮组件 - 多种样式
// 主按钮 - 渐变背景、阴影、hover效果
<button className="bg-gradient-to-r from-blue-500 to-purple-600
                   text-white px-6 py-3 rounded-lg
                   shadow-lg hover:shadow-xl
                   transform hover:scale-105
                   transition-all duration-200">
  点击我
</button>

// 次按钮 - 边框样式
<button className="border-2 border-blue-500 text-blue-500
                   px-6 py-3 rounded-lg
                   hover:bg-blue-50
                   transition-colors duration-200">
  取消
</button>

// 危险按钮 - 红色
<button className="bg-red-500 hover:bg-red-600
                   text-white px-6 py-3 rounded-lg
                   transition-colors duration-200">
  删除
</button>
`,

      '表单': `
// 表单组件 - 带验证和错误提示
<form className="space-y-4">
  {/* 输入框 */}
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      用户名
    </label>
    <input
      type="text"
      className="w-full px-4 py-2 rounded-lg
                 border-2 border-gray-300
                 focus:border-blue-500 focus:ring-2
                 focus:ring-blue-200
                 outline-none
                 transition-all duration-200"
      placeholder="请输入用户名"
    />
    <p className="text-xs text-gray-500 mt-1">
      3-20个字符，只能包含字母、数字
    </p>
  </div>

  {/* 文本域 */}
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      描述
    </label>
    <textarea
      className="w-full px-4 py-2 rounded-lg
                 border-2 border-gray-300
                 focus:border-blue-500 focus:ring-2
                 focus:ring-blue-200
                 outline-none
                 transition-all duration-200
                 resize-none"
      rows={4}
      placeholder="请输入描述"
    />
  </div>

  {/* 错误提示示例 */}
  <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
    <div className="flex">
      <div className="flex-shrink-0">
        <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.293 9.293a1 1 0 101.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      </div>
      <div className="ml-3">
        <p className="text-sm text-red-700">
          用户名不能为空
        </p>
      </div>
    </div>
  </div>
</form>
`,

      '卡片': `
// 卡片组件 - 多种样式
// 基础卡片
<div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
  <h3 className="text-xl font-bold text-gray-900 mb-2">
    卡片标题
  </h3>
  <p className="text-gray-600">
    这是卡片内容，使用适当的间距和字体大小。
  </p>
</div>

// 图片卡片
<div className="bg-white rounded-xl shadow-md overflow-hidden">
  <img src="/image.jpg" alt="" className="w-full h-48 object-cover" />
  <div className="p-6">
    <h3 className="text-xl font-bold text-gray-900 mb-2">
      图片标题
    </h3>
    <p className="text-gray-600 mb-4">
      图片描述文字
    </p>
    <button className="text-blue-600 hover:text-blue-800 font-medium">
      查看详情 →
    </button>
  </div>
</div>
`,

      '模态框': `
// 模态框组件 - 带遮罩层
<div className="fixed inset-0 z-50 overflow-y-auto">
  {/* 遮罩层 */}
  <div className="flex items-center justify-center min-h-screen px-4">
    <div className="fixed inset-0 bg-black opacity-50"></div>

    {/* 模态框内容 */}
    <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
      {/* 关闭按钮 */}
      <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
        <svg className="w-6 h-6" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* 标题 */}
      <h2 className="text-2xl font-bold text-gray-900 mb-4">
        模态框标题
      </h2>

      {/* 内容 */}
      <div className="text-gray-600 mb-6">
        这是模态框的内容区域...
      </div>

      {/* 按钮 */}
      <div className="flex justify-end space-x-3">
        <button className="px-4 py-2 text-gray-700 hover:text-gray-900">
          取消
        </button>
        <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
          确认
        </button>
      </div>
    </div>
  </div>
</div>
`,

      '列表': `
// 列表组件 - 卡片式列表
<div className="space-y-4">
  {/* 列表项 */}
  <div className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow">
    <div className="flex items-center">
      <div className="flex-shrink-0 mr-4">
        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
          <span className="text-blue-600 font-bold">1</span>
        </div>
      </div>
      <div className="flex-1">
        <h4 className="text-lg font-semibold text-gray-900">列表项标题</h4>
        <p className="text-gray-600 text-sm">列表项描述</p>
      </div>
      <div className="flex-shrink-0">
        <button className="text-blue-600 hover:text-blue-800">查看 →</button>
      </div>
    </div>
  </div>

  {/* 更多列表项... */}
</div>
`
    };

    for (const component of components) {
      if (componentCode[component]) {
        examples.push(`### ${component}`);
        examples.push(componentCode[component]);
        examples.push('');
      }
    }

    if (examples.length === 0) {
      examples.push('// 组件示例代码会根据请求动态生成');
    }

    return examples.join('\n');
  }

  /**
   * 更新配置
   */
  updateConfig(config: Partial<AestheticsEngineConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * 更新美化配置
   */
  updateAestheticsConfig(config: Partial<AestheticsConfig>): void {
    this.aestheticsConfig = { ...this.aestheticsConfig, ...config };
  }

  /**
   * 生成美化建议
   */
  generateSuggestions(request: string): string[] {
    const analysis = this.analyzeRequest(request);
    const suggestions: string[] = [];

    if (!analysis.isUIRelated) {
      return [];
    }

    // 基于分析生成建议
    if (analysis.appType === 'website') {
      suggestions.push('使用 React + Bootstrap/Tailwind 构建');
      suggestions.push('采用移动优先的响应式设计');
    }

    if (analysis.components.includes('导航栏')) {
      suggestions.push('导航栏使用 sticky 定位，添加阴影效果');
      suggestions.push('移动端使用汉堡菜单');
    }

    if (analysis.components.includes('按钮')) {
      suggestions.push('按钮添加 hover 缩放效果');
      suggestions.push('使用渐变背景增强视觉效果');
    }

    if (analysis.designRequirements.includes('responsive')) {
      suggestions.push('使用 flexbox 和 grid 布局');
      suggestions.push('设置媒体查询断点: 640px, 1024px');
    }

    if (analysis.designRequirements.includes('animations')) {
      suggestions.push('使用 CSS transition 添加平滑过渡');
      suggestions.push('关键动画使用 @keyframes');
    }

    return suggestions;
  }

  /**
   * 获取美化指南
   */
  getAestheticsGuide(): string {
    return generateAestheticsPrompt(this.aestheticsConfig);
  }
}
