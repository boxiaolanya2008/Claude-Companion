/**
 * 美化架构配置
 * 让生成的代码和界面更加美观、现代化
 */

export interface AestheticsConfig {
  // UI/UX 设计原则
  designPrinciples: {
    useMaterialDesign: boolean;      // 使用 Material Design 原则
    useModernLayouts: boolean;        // 现代化布局
    responsiveDesign: boolean;        // 响应式设计
    microInteractions: boolean;       // 微交互效果
  };

  // 视觉风格
  visualStyle: {
    colorScheme: 'light' | 'dark' | 'auto';
    borderRadius: 'sharp' | 'rounded' | 'circular';
    shadows: boolean;                  // 阴影效果
    animations: boolean;               // 动画效果
    spacing: 'compact' | 'comfortable' | 'spacious';
  };

  // 组件库偏好
  componentLibrary: {
    primary: 'bootstrap' | 'material-ui' | 'tailwind' | 'custom';
    icons: 'material-icons' | 'font-awesome' | 'heroicons' | 'emoji';
    typography: 'system' | 'google-fonts' | 'custom';
  };

  // 代码组织
  codeOrganization: {
    componentBased: boolean;           // 组件化
    separationOfConcerns: boolean;     // 关注点分离
    reusableComponents: boolean;       // 可复用组件
    folderStructure: 'feature-based' | 'type-based';
  };

  // 性能优化
  performanceOptimization: {
    lazyLoading: boolean;              // 懒加载
    codeSplitting: boolean;            // 代码分割
    treeShaking: boolean;              // 摇树优化
    imageOptimization: boolean;        // 图片优化
  };
}

/**
 * 默认美化配置 - 现代化、美观
 */
export const defaultAestheticsConfig: AestheticsConfig = {
  designPrinciples: {
    useMaterialDesign: true,
    useModernLayouts: true,
    responsiveDesign: true,
    microInteractions: true
  },

  visualStyle: {
    colorScheme: 'auto',
    borderRadius: 'rounded',
    shadows: true,
    animations: true,
    spacing: 'comfortable'
  },

  componentLibrary: {
    primary: 'bootstrap',
    icons: 'material-icons',
    typography: 'google-fonts'
  },

  codeOrganization: {
    componentBased: true,
    separationOfConcerns: true,
    reusableComponents: true,
    folderStructure: 'feature-based'
  },

  performanceOptimization: {
    lazyLoading: true,
    codeSplitting: true,
    treeShaking: true,
    imageOptimization: true
  }
};

/**
 * 生成美化指南提示词
 */
export function generateAestheticsPrompt(config: AestheticsConfig = defaultAestheticsConfig): string {
  const parts: string[] = [];

  parts.push('# 界面美化指南');
  parts.push('');
  parts.push('请按照以下指南生成美观、现代化的界面和代码：');
  parts.push('');

  // 设计原则
  parts.push('## 设计原则');
  parts.push('');
  if (config.designPrinciples.useMaterialDesign) {
    parts.push('- **Material Design**: 使用卡片、阴影、圆角、涟漪效果');
    parts.push('- **层次感**: 使用 elevation（阴影）区分层级');
    parts.push('- **留白**: 充足的间距让界面呼吸');
    parts.push('');
  }

  if (config.designPrinciples.responsiveDesign) {
    parts.push('- **响应式**: 适配手机、平板、桌面各种屏幕');
    parts.push('- **移动优先**: 先设计移动端，再扩展到桌面');
    parts.push('');
  }

  if (config.designPrinciples.microInteractions) {
    parts.push('- **微交互**: 按钮 hover、点击反馈、加载动画');
    parts.push('- **过渡动画**: 平滑的 state 变化');
    parts.push('');
  }

  // 视觉风格
  parts.push('## 视觉风格');
  parts.push('');
  parts.push('**配色方案**:');
  parts.push('- 主色: 鲜艳但不刺眼（如 #3B82F6 蓝色）');
  parts.push('- 辅助色: 柔和中性（如 #64748B 灰蓝）');
  parts.push('- 背景: 纯净（#FFFFFF 白色 或 #F8FAFC 浅灰）');
  parts.push('- 文字: 对比清晰（#1E293B 深色）');
  parts.push('');

  parts.push('**圆角规范**:');
  parts.push('- 按钮/卡片: 8px - 12px');
  parts.push('- 输入框: 6px - 8px');
  parts.push('- 小元素: 4px');
  parts.push('');

  parts.push('**阴影效果**:');
  parts.push('```css');
  parts.push('.card {');
  parts.push('  box-shadow: 0 1px 3px rgba(0,0,0,0.1),');
  parts.push('              0 1px 2px rgba(0,0,0,0.06);');
  parts.push('}');
  parts.push('');
  parts.push('.card:hover {');
  parts.push('  box-shadow: 0 10px 15px rgba(0,0,0,0.1),');
  parts.push('              0 4px 6px rgba(0,0,0,0.05);');
  parts.push('}');
  parts.push('```');
  parts.push('');

  // 布局规范
  parts.push('## 布局规范');
  parts.push('');
  parts.push('**容器宽度**:');
  parts.push('```css');
  parts.push('.container {');
  parts.push('  max-width: 1200px;');
  parts.push('  margin: 0 auto;');
  parts.push('  padding: 0 16px;');
  parts.push('}');
  parts.push('```');
  parts.push('');

  parts.push('**间距系统** (8px 基准):');
  parts.push('- xs: 4px');
  parts.push('- sm: 8px');
  parts.push('- md: 16px');
  parts.push('- lg: 24px');
  parts.push('- xl: 32px');
  parts.push('- xxl: 48px');
  parts.push('');

  // 组件示例
  parts.push('## 美观组件示例');
  parts.push('');

  parts.push('### 按钮');
  parts.push('```jsx');
  parts.push('// 主按钮 - 带渐变和阴影');
  parts.push('<Button');
  parts.push('  className="bg-gradient-to-r from-blue-500 to-purple-600');
  parts.push('                 text-white px-6 py-3 rounded-lg');
  parts.push('                 shadow-lg hover:shadow-xl');
  parts.push('                 transform hover:scale-105');
  parts.push('                 transition-all duration-200">');
  parts.push('  确认操作');
  parts.push('</Button>');
  parts.push('```');
  parts.push('');

  parts.push('### 卡片');
  parts.push('```jsx');
  parts.push('// 信息卡片 - 带阴影和圆角');
  parts.push('<div className="bg-white rounded-xl shadow-md p-6');
  parts.push('     hover:shadow-lg transition-shadow duration-300">');
  parts.push('  <h3 className="text-xl font-bold text-gray-800 mb-2">');
  parts.push('    卡片标题');
  parts.push('  </h3>');
  parts.push('  <p className="text-gray-600">');
  parts.push('    这是卡片内容，使用适当的间距和字体大小。');
  parts.push('  </p>');
  parts.push('</div>');
  parts.push('```');
  parts.push('');

  parts.push('### 输入框');
  parts.push('```jsx');
  parts.push('// 输入框 - 带焦点状态');
  parts.push('<input');
  parts.push('  type="text"');
  parts.push('  className="w-full px-4 py-3 rounded-lg');
  parts.push('             border-2 border-gray-200');
  parts.push('             focus:border-blue-500 focus:ring-2');
  parts.push('             focus:ring-blue-200');
  parts.push('             outline-none');
  parts.push('             transition-all duration-200"');
  parts.push('  placeholder="请输入内容..."');
  parts.push('/>');
  parts.push('```');
  parts.push('');

  parts.push('### 加载状态');
  parts.push('```jsx');
  parts.push('// 加载动画 - 骨架屏');
  parts.push('<div className="animate-pulse">');
  parts.push('  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>');
  parts.push('  <div className="h-4 bg-gray-200 rounded w-1/2"></div>');
  parts.push('</div>');
  parts.push('```');
  parts.push('');

  // 页面布局示例
  parts.push('## 页面布局示例');
  parts.push('');
  parts.push('```jsx');
  parts.push('// 典型页面布局');
  parts.push('function PageLayout() {');
  parts.push('  return (');
  parts.push('    <div className="min-h-screen bg-gray-50">');
  parts.push('      {/* 导航栏 */}');
  parts.push('      <nav className="bg-white shadow-sm sticky top-0 z-10">');
  parts.push('        <div className="max-w-7xl mx-auto px-4 sm:px-6">');
  parts.push('          <div className="flex justify-between h-16">');
  parts.push('            {/* Logo */}');
  parts.push('            <div className="flex items-center">');
  parts.push('              <Logo />');
  parts.push('            </div>');
  parts.push('            {/* 导航链接 */}');
  parts.push('            <div className="hidden md:flex items-center space-x-8">');
  parts.push('              <NavLink href="/">首页</NavLink>');
  parts.push('              <NavLink href="/about">关于</NavLink>');
  parts.push('            </div>');
  parts.push('          </div>');
  parts.push('        </div>');
  parts.push('      </nav>');
  parts.push('');
  parts.push('      {/* 主内容区 */}');
  parts.push('      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">');
  parts.push('        {/* 页面标题 */}');
  parts.push('        <div className="mb-8">');
  parts.push('          <h1 className="text-3xl font-bold text-gray-900">');
  parts.push('            页面标题');
  parts.push('          </h1>');
  parts.push('          <p className="mt-2 text-gray-600">');
  parts.push('            页面描述文字');
  parts.push('          </p>');
  parts.push('        </div>');
  parts.push('');
  parts.push('        {/* 内容卡片 */}');
  parts.push('        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">');
  parts.push('          <ContentCard />');
  parts.push('          <ContentCard />');
  parts.push('        </div>');
  parts.push('      </main>');
  parts.push('');
  parts.push('      {/* 页脚 */}');
  parts.push('      <footer className="bg-white border-t mt-12">');
  parts.push('        <div className="max-w-7xl mx-auto px-4 py-6">');
  parts.push('          <p className="text-center text-gray-600">');
  parts.push('            © 2024 Your App. All rights reserved.');
  parts.push('          </p>');
  parts.push('        </div>');
  parts.push('      </footer>');
  parts.push('    </div>');
  parts.push('  );');
  parts.push('}');
  parts.push('```');
  parts.push('');

  // 动画和过渡
  parts.push('## 动画和过渡');
  parts.push('');
  parts.push('**常用过渡类**:');
  parts.push('```css');
  parts.push('.transition-all {');
  parts.push('  transition: all 0.3s ease;');
  parts.push('}');
  parts.push('');
  parts.push('.hover-scale:hover {');
  parts.push('  transform: scale(1.05);');
  parts.push('}');
  parts.push('');
  parts.push('.hover-lift:hover {');
  parts.push('  transform: translateY(-2px);');
  parts.push('  box-shadow: 0 4px 12px rgba(0,0,0,0.15);');
  parts.push('}');
  parts.push('```');
  parts.push('');

  parts.push('**加载动画**:');
  parts.push('```css');
  parts.push('@keyframes spin {');
  parts.push('  to { transform: rotate(360deg); }');
  parts.push('}');
  parts.push('');
  parts.push('.spinner {');
  parts.push('  animation: spin 1s linear infinite;');
  parts.push('}');
  parts.push('```');
  parts.push('');

  // 响应式设计
  parts.push('## 响应式断点');
  parts.push('');
  parts.push('```css');
  parts.push('/* 移动优先 */');
  parts.push('.container {');
  parts.push('  padding: 1rem; /* 移动端 */');
  parts.push('}');
  parts.push('');
  parts.push('@media (min-width: 640px) {');
  parts.push('  .container {');
  parts.push('    padding: 1.5rem; /* 平板 */');
  parts.push('  }');
  parts.push('}');
  parts.push('');
  parts.push('@media (min-width: 1024px) {');
  parts.push('  .container {');
  parts.push('    padding: 2rem; /* 桌面 */');
  parts.push('  }');
  parts.push('}');
  parts.push('```');
  parts.push('');

  // 性能优化
  parts.push('## 性能优化');
  parts.push('');
  if (config.performanceOptimization.lazyLoading) {
    parts.push('- **图片懒加载**: 使用 loading="lazy" 属性');
    parts.push('- **组件懒加载**: React.lazy() + Suspense');
    parts.push('- **路由懒加载**: dynamic import()');
    parts.push('');
  }

  if (config.performanceOptimization.codeSplitting) {
    parts.push('- **代码分割**: 按路由分割代码包');
    parts.push('- **Tree Shaking**: 只导入使用的代码');
    parts.push('');
  }

  // 最佳实践
  parts.push('## 最佳实践');
  parts.push('');
  parts.push('1. **可访问性**:');
  parts.push('   - 使用语义化 HTML');
  parts.push('   - 添加 aria-label');
  parts.push('   - 确保键盘导航');
  parts.push('   - 颜色对比度符合 WCAG AA');
  parts.push('');
  parts.push('2. **性能**:');
  parts.push('   - 避免过度渲染');
  parts.push('   - 使用 useMemo/useCallback');
  parts.push('   - 图片优化和压缩');
  parts.push('   - 代码分割和懒加载');
  parts.push('');
  parts.push('3. **用户体验**:');
  parts.push('   - 加载状态反馈');
  parts.push('   - 错误提示友好');
  parts.push('   - 操作确认提示');
  parts.push('   - 空状态设计');
  parts.push('');

  return parts.join('\n');
}

/**
 * 生成技术栈推荐
 */
export function generateTechStackRecommendation(appType: string): string {
  const parts: string[] = [];

  parts.push('# 推荐技术栈');
  parts.push('');
  parts.push(`基于项目类型: **${appType}**`);
  parts.push('');

  const stacks: Record<string, string[]> = {
    'website': [
      'React 18 + TypeScript',
      'Bootstrap 5 或 Tailwind CSS',
      'React Router',
      'Axios',
      'Material Icons'
    ],
    'fullstack': [
      'Next.js 14 (React)',
      'Bootstrap CSS / Tailwind',
      'API Routes / Express.js',
      'Prisma / MongoDB',
      'Material Icons'
    ],
    'api': [
      'Node.js + Express.js',
      'TypeScript',
      'Swagger/OpenAPI',
      'Joi 验证',
      'CORS 配置'
    ],
    'cli': [
      'Python / Go',
      'Commander.js / Click',
      'Chalk (彩色输出)',
      'Ora (加载动画)',
      'Inquirer (交互式输入)'
    ],
    'mobile': [
      'React Native / Flutter',
      'Expo',
      'React Navigation',
      'Async Storage',
      'Axios'
    ]
  };

  const recommended = stacks[appType.toLowerCase()] || stacks['website'];

  parts.push('**推荐使用**:');
  recommended.forEach(tech => {
    parts.push(`- ${tech}`);
  });

  return parts.join('\n');
}

/**
 * 应用美化检查清单
 */
export function generateAestheticsChecklist(): string {
  return `
# 界面美化检查清单

## 视觉设计
- [ ] 配色方案协调统一
- [ ] 字体大小层级清晰
- [ ] 间距充足且一致
- [ ] 圆角风格统一
- [ ] 阴影效果适度
- [ ] 动画平滑自然

## 布局
- [ ] 响应式适配
- [ ] 移动端友好
- [ ] 内容居中对齐
- [ ] 导航清晰易用
- [ ] 页脚完整

## 交互
- [ ] 按钮状态反馈
- [ ] 表单验证提示
- [ ] 加载状态显示
- [ ] 错误友好提示
- [ ] 成功确认提示

## 性能
- [ ] 图片懒加载
- [ ] 代码分割
- [ ] Tree Shaking
- [ ] 首屏优化
- [ ] 加载速度

## 可访问性
- [ ] 语义化 HTML
- [ ] aria-label
- [ ] 键盘导航
- [ ] 颜色对比度
- [ ] 屏幕阅读器
`;
}
