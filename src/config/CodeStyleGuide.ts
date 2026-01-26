/**
 * 代码风格指南
 * 让生成的代码看起来像真人写的，注释详细且自然
 */

export interface CodeStyleConfig {
  // 注释风格
  commentStyle: {
    // 使用大白话，不要技术术语
    usePlainLanguage: boolean;
    // 标注函数调用关系
    showCallRelations: boolean;
    // 标注数据流向
    showDataFlow: boolean;
    // 使用"//"而不是"///"或"==="
    commentFormat: 'single-line' | 'jsdoc' | 'minimal';
    // 在注释中说明"为什么"而不只是"做什么"
    explainWhy: boolean;
    // 添加使用示例注释
    includeUsageExamples: boolean;
  };
  // 代码组织
  codeOrganization: {
    // 相关函数放在一起
    groupRelatedFunctions: boolean;
    // 添加空行分隔逻辑块
    useBlankLines: boolean;
    // 公共函数在前，私有在后
    publicFirst: boolean;
  };
  // 命名风格
  namingStyle: {
    // 使用描述性变量名
    descriptiveNames: boolean;
    // 避免缩写
    avoidAbbreviations: boolean;
    // 变量名带上下文信息
    contextualNaming: boolean;
  };
  // 代码质量
  codeQuality: {
    // 添加错误处理
    includeErrorHandling: boolean;
    // 添加边界检查
    includeBoundaryChecks: boolean;
    // 添加日志输出
    includeLogging: boolean;
    // 性能优化提示
    includePerformanceHints: boolean;
  };
}

/**
 * 默认代码风格配置 - 真人程序员风格
 */
export const defaultCodeStyle: CodeStyleConfig = {
  commentStyle: {
    usePlainLanguage: true,
    showCallRelations: true,
    showDataFlow: true,
    commentFormat: 'single-line',
    explainWhy: true,
    includeUsageExamples: true
  },
  codeOrganization: {
    groupRelatedFunctions: true,
    useBlankLines: true,
    publicFirst: true
  },
  namingStyle: {
    descriptiveNames: true,
    avoidAbbreviations: true,
    contextualNaming: true
  },
  codeQuality: {
    includeErrorHandling: true,
    includeBoundaryChecks: true,
    includeLogging: true,
    includePerformanceHints: true
  }
};

/**
 * 生成代码风格提示词
 */
export function generateCodeStylePrompt(config: CodeStyleConfig = defaultCodeStyle): string {
  const parts: string[] = [];

  parts.push('# 代码编写要求');
  parts.push('');
  parts.push('请按照以下规范编写代码，让代码看起来像有经验的程序员写的：');
  parts.push('');

  // 注释规范
  parts.push('## 注释规范');
  parts.push('');
  if (config.commentStyle.usePlainLanguage) {
    parts.push('1. **用大白话写注释**，不要用技术术语');
    parts.push('   - ❌ bad: "异步初始化组件"');
    parts.push('   - ✅ good: "等页面加载完再初始化，不然拿不到DOM元素"');
    parts.push('');
  }

  if (config.commentStyle.showCallRelations) {
    parts.push('2. **标注函数调用关系**');
    parts.push('   ```javascript');
    parts.push('   // 这个函数给 handleUserClick 调用，用来检查用户是不是点太快了');
    parts.push('   function checkClickSpeed(userId) {');
    parts.push('     // 调用 getUserInfo 拿用户上次点击时间');
    parts.push('     const userInfo = getUserInfo(userId);');
    parts.push('     // ...');
    parts.push('   }');
    parts.push('   ```');
    parts.push('');
  }

  if (config.commentStyle.showDataFlow) {
    parts.push('3. **标注数据流向**');
    parts.push('   ```javascript');
    parts.push('   // 拿用户输入 -> 校验格式 -> 发给后端 -> 返回结果给界面');
    parts.push('   async function submitForm(formData) {');
    parts.push('     // ...');
    parts.push('   }');
    parts.push('   ```');
    parts.push('');
  }

  if (config.commentStyle.commentFormat === 'single-line') {
    parts.push('4. **用 // 单行注释，不要用 === xxx === 这种格式**');
    parts.push('   ```javascript');
    parts.push('   // ✅ good: 这样写');
    parts.push('');
    parts.push('   // ❌ bad: ========== 初始化函数 ==========');
    parts.push('   ```');
    parts.push('');
  }

  if (config.commentStyle.explainWhy) {
    parts.push('5. **注释要说明"为什么"，不只是"做什么"**');
    parts.push('   ```javascript');
    parts.push('   // ❌ bad: "遍历数组"');
    parts.push('   // ✅ good: "这里用 for 循环而不是 forEach，因为要中途 break"');
    parts.push('   ```');
    parts.push('');
  }

  if (config.commentStyle.includeUsageExamples) {
    parts.push('6. **在复杂函数旁边加个使用小例子**');
    parts.push('   ```javascript');
    parts.push('   // 用法示例:');
    parts.push('   // const result = await fetchUserData("user123");');
    parts.push('   // console.log(result.name);');
    parts.push('   async function fetchUserData(userId) { ... }');
    parts.push('   ```');
    parts.push('');
  }

  // 代码组织
  parts.push('## 代码组织');
  parts.push('');
  if (config.codeOrganization.groupRelatedFunctions) {
    parts.push('- **把相关的函数放在一起**，比如 A 调用 B，那 AB 就挨着写');
    parts.push('');
  }

  if (config.codeOrganization.useBlankLines) {
    parts.push('- **用空行分隔逻辑块**，让代码好读');
    parts.push('');
  }

  if (config.codeOrganization.publicFirst) {
    parts.push('- **对外接口放前面，内部函数放后面**');
    parts.push('');
  }

  // 命名风格
  parts.push('## 命名风格');
  parts.push('');
  if (config.namingStyle.descriptiveNames) {
    parts.push('- **变量名要说清楚是干嘛的**，别用单字母');
    parts.push('  ```javascript');
    parts.push('  // ❌ bad: const d = new Date();');
    parts.push('  // ✅ good: const currentDate = new Date();');
    parts.push('  ```');
    parts.push('');
  }

  if (config.namingStyle.avoidAbbreviations) {
    parts.push('- **别用缩写**，多打几个字没事');
    parts.push('  ```javascript');
    parts.push('  // ❌ bad: usrInfo, msgCnt');
    parts.push('  // ✅ good: userInfo, messageCount');
    parts.push('  ```');
    parts.push('');
  }

  if (config.namingStyle.contextualNaming) {
    parts.push('- **变量名带上上下文**，一看就知道是干嘛的');
    parts.push('  ```javascript');
    parts.push('  // ❌ bad: const data = await getData();');
    parts.push('  // ✅ good: const userOrders = await getUserOrders();');
    parts.push('  ```');
    parts.push('');
  }

  // 代码质量
  parts.push('## 代码质量');
  parts.push('');
  if (config.codeQuality.includeErrorHandling) {
    parts.push('- **加上错误处理**，别让程序崩溃');
    parts.push('  ```javascript');
    parts.push('  try {');
    parts.push('    const data = await fetchData();');
    parts.push('  } catch (err) {');
    parts.push('    // 网络挂了或者数据格式不对');
    parts.push('    console.error("拿数据失败:", err);');
    parts.push('    return null;');
    parts.push('  }');
    parts.push('  ```');
    parts.push('');
  }

  if (config.codeQuality.includeBoundaryChecks) {
    parts.push('- **检查边界情况**，比如空值、数组越界');
    parts.push('  ```javascript');
    parts.push('  // 先检查数组是不是空的，避免后面报错');
    parts.push('  if (!items || items.length === 0) {');
    parts.push('    return [];');
    parts.push('  }');
    parts.push('  ```');
    parts.push('');
  }

  if (config.codeQuality.includeLogging) {
    parts.push('- **关键步骤加个 log**，方便调试');
    parts.push('  ```javascript');
    parts.push('  console.log("开始处理订单，订单号:", orderId);');
    parts.push('  // ...');
    parts.push('  console.log("订单处理完成，结果:", result);');
    parts.push('  ```');
    parts.push('');
  }

  if (config.codeQuality.includePerformanceHints) {
    parts.push('- **加个性能小提示**');
    parts.push('  ```javascript');
    parts.push('  // 这里先存一下长度，避免循环里每次都计算');
    parts.push('  const len = array.length;');
    parts.push('  for (let i = 0; i < len; i++) { ... }');
    parts.push('  ```');
    parts.push('');
  }

  parts.push('## 完整示例');
  parts.push('');
  parts.push('```javascript');
  parts.push('/**');
  parts.push(' * 用户管理模块');
  parts.push(' * 负责用户的增删改查操作');
  parts.push(' */');
  parts.push('');
  parts.push('// ========== 用户相关函数 ========== ');
  parts.push('');
  parts.push('/**');
  parts.push(' * 获取用户信息');
  parts.push(' * 这个函数给页面展示用户资料用，返回的数据包含姓名、头像等基本信息');
  parts.push(' * 如果用户不存在，返回 null');
  parts.push(' * ');
  parts.push(' * 用法示例:');
  parts.push(' * const user = await getUserInfo("user123");');
  parts.push(' * console.log(user.name);');
  parts.push(' * ');
  parts.push(' * @param {string} userId - 用户ID');
  parts.push(' * @returns {Promise<Object|null>} 用户信息对象或null');
  parts.push(' */');
  parts.push('async function getUserInfo(userId) {');
  parts.push('  // 先检查入参，避免空值导致后面出错');
  parts.push('  if (!userId) {');
  parts.push('    console.error("getUserInfo: userId 是空的");');
  parts.push('    return null;');
  parts.push('  }');
  parts.push('  ');
  parts.push('  try {');
  parts.push('    // 调用后端接口拿数据');
  parts.push('    const response = await fetch(`/api/users/${userId}`);');
  parts.push('    ');
  parts.push('    // 检查请求是不是成功了');
  parts.push('    if (!response.ok) {');
  parts.push('      console.error("getUserInfo: 接口返回错误", response.status);');
  parts.push('      return null;');
  parts.push('    }');
  parts.push('    ');
  parts.push('    // 解析返回的JSON数据');
  parts.includes('    const userData = await response.json();');
  parts.push('    ');
  parts.push('    // 数据格式化一下，把后端返回的字段名改成前端习惯的');
  parts.push('    // 后端用 user_name，前端用 userName，这里做个转换');
  parts.push('    return {');
  parts.push('      id: userData.id,');
  parts.push('      name: userData.user_name,');
  parts.push('      email: userData.email_addr,');
  parts.push('      avatar: userData.avatar_url');
  parts.push('    };');
  parts.push('  } catch (err) {');
  parts.push('    // 网络出错了或者数据解析失败');
  parts.push('    console.error("getUserInfo: 出错了", err);');
  parts.push('    return null;');
  parts.push('  }');
  parts.push('}');
  parts.push('```');

  return parts.join('\n');
}

/**
 * 生成代码检查提示词
 */
export function generateCodeReviewPrompt(): string {
  return `
# 代码自查清单

在提交代码前，请检查以下内容：

## 注释检查
- [ ] 注释用的是大白话，没有技术术语
- [ ] 标注了函数被谁调用、调用了谁
- [ ] 说明了数据从哪来、到哪去
- [ ] 用的是 // 而不是 === 或 ///
- [ ] 注释解释了"为什么"而不只是"做什么"

## 命名检查
- [ ] 变量名描述性强，一看就知道是干嘛的
- [ ] 没有用缩写（usr、msg、cnt 之类的）
- [ ] 变量名带上下文信息

## 代码质量检查
- [ ] 关键地方有错误处理
- [ ] 检查了空值、边界情况
- [ ] 重要步骤有日志输出
- [ ] 性能关键点有优化说明

## 组织检查
- [ ] 相关函数挨着放
- [ ] 用空行分隔了不同的逻辑块
- [ ] 公共接口在前，内部函数在后
`;
}
