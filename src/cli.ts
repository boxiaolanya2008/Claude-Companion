#!/usr/bin/env node

/**
 * Claude Companion CLI
 * 命令行界面
 */

import { Command } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import { Companion, createCompanion } from './index.js';

const program = new Command();

program
  .name('claude-companion')
  .description('Claude Companion - AI 助手扩展架构')
  .version('1.0.0');

// 初始化命令
program
  .command('init')
  .description('初始化 Claude Companion')
  .option('-p, --path <path>', '存储路径', './ModelMem')
  .option('-u, --user <userId>', '用户ID', 'default')
  .option('--project <project>', '项目名称', 'default')
  .action(async (options) => {
    const spinner = ora('初始化中...').start();

    try {
      const companion = new Companion({
        memorySystem: {
          ...require('./config/default.js').defaultConfig.memorySystem,
          storagePath: options.path
        }
      });

      await companion.initialize(options.user, options.project);

      spinner.succeed(chalk.green('初始化完成！'));
      console.log(chalk.gray(`存储路径: ${options.path}`));
      console.log(chalk.gray(`用户ID: ${options.user}`));
      console.log(chalk.gray(`项目: ${options.project}`));
    } catch (error) {
      spinner.fail(chalk.red('初始化失败'));
      console.error(chalk.red(error instanceof Error ? error.message : String(error)));
      process.exit(1);
    }
  });

// 交互模式
program
  .command('chat')
  .description('启动交互式对话')
  .option('-p, --path <path>', '存储路径', './ModelMem')
  .action(async (options) => {
    console.log(chalk.cyan('Claude Companion 交互模式'));
    console.log(chalk.gray('输入 "exit" 或 "quit" 退出\n'));

    const spinner = ora('加载中...').start();

    try {
      const companion = new Companion({
        memorySystem: {
          ...require('./config/default.js').defaultConfig.memorySystem,
          storagePath: options.path
        }
      });

      await companion.initialize();
      spinner.stop();

      // 显示状态
      const status = await companion.generateStatusReport();
      console.log(chalk.gray(status.split('\n').slice(0, 10).join('\n') + '...\n'));

      // 交互循环
      let currentPersona = companion.getCurrentPersona().type;

      while (true) {
        const { message } = await inquirer.prompt([
          {
            type: 'input',
            name: 'message',
            message: chalk.cyan(`[${currentPersona}] 你 >`),
            prefix: ''
          }
        ]);

        // 检查退出命令
        if (message.toLowerCase() === 'exit' || message.toLowerCase() === 'quit') {
          console.log(chalk.yellow('\n再见！'));
          await companion.shutdown();
          break;
        }

        // 检查人格切换命令
        if (message.startsWith('/persona ')) {
          const persona = message.split(' ')[1] as 'professional-mentor' | 'efficient-partner' | 'architect' | 'explorer';
          try {
            companion.switchPersona(persona);
            currentPersona = companion.getCurrentPersona().type;
            console.log(chalk.green(`✓ 已切换到 ${currentPersona}\n`));
          } catch (error) {
            console.log(chalk.red(`✗ 切换失败: ${error}\n`));
          }
          continue;
        }

        // 检查状态命令
        if (message === '/status') {
          const status = await companion.generateStatusReport();
          console.log(chalk.gray('\n' + status + '\n'));
          continue;
        }

        // 处理普通消息
        const thinkingSpinner = ora('思考中...').start();

        try {
          const result = await companion.process({ message });
          thinkingSpinner.stop();

          console.log(chalk.white('\n' + result.response));

          if (result.emotions && result.emotions.length > 0) {
            console.log(chalk.gray(`\n[情绪: ${result.emotions.join(', ')}]`));
          }

          if (result.followUpSuggestions && result.followUpSuggestions.length > 0) {
            console.log(chalk.gray('\n建议: ' + result.followUpSuggestions.join(', ')));
          }

          console.log('');
        } catch (error) {
          thinkingSpinner.fail(chalk.red('处理失败'));
          console.error(chalk.red(error instanceof Error ? error.message : String(error)));
        }
      }
    } catch (error) {
      spinner.fail(chalk.red('启动失败'));
      console.error(chalk.red(error instanceof Error ? error.message : String(error)));
      process.exit(1);
    }
  });

// 生成报告
program
  .command('report')
  .description('生成系统状态报告')
  .option('-p, --path <path>', '存储路径', './ModelMem')
  .action(async (options) => {
    const spinner = ora('生成报告中...').start();

    try {
      const companion = new Companion({
        memorySystem: {
          ...require('./config/default.js').defaultConfig.memorySystem,
          storagePath: options.path
        }
      });

      await companion.initialize();
      const report = await companion.generateStatusReport();

      spinner.stop();
      console.log(report);

      await companion.shutdown();
    } catch (error) {
      spinner.fail(chalk.red('生成报告失败'));
      console.error(chalk.red(error instanceof Error ? error.message : String(error)));
      process.exit(1);
    }
  });

// 思考报告
program
  .command('think <request>')
  .description('生成思考过程报告')
  .option('-p, --path <path>', '存储路径', './ModelMem')
  .action(async (request, options) => {
    const spinner = ora('思考中...').start();

    try {
      const companion = new Companion({
        memorySystem: {
          ...require('./config/default.js').defaultConfig.memorySystem,
          storagePath: options.path
        }
      });

      await companion.initialize();
      const report = await companion.generateThinkingReport(request);

      spinner.stop();
      console.log(report);

      await companion.shutdown();
    } catch (error) {
      spinner.fail(chalk.red('生成报告失败'));
      console.error(chalk.red(error instanceof Error ? error.message : String(error)));
      process.exit(1);
    }
  });

// 列出人格
program
  .command('personas')
  .description('列出所有可用的人格')
  .action(() => {
    console.log(chalk.cyan('\n可用的人格:\n'));

    const personas = [
      { name: 'professional-mentor', desc: '专业导师 - 适合教学和学习' },
      { name: 'efficient-partner', desc: '高效搭档 - 适合日常开发' },
      { name: 'architect', desc: '架构师 - 适合系统设计' },
      { name: 'explorer', desc: '探索者 - 适合创新探索' }
    ];

    for (const persona of personas) {
      console.log(chalk.white(`  ${persona.name}`));
      console.log(chalk.gray(`    ${persona.desc}\n`));
    }

    console.log(chalk.gray('使用 /persona <名称> 在交互模式中切换人格\n'));
  });

// 列出技能
program
  .command('skills')
  .description('列出所有可用的技能')
  .action(() => {
    const { coreSkills, webSkills, specializedSkills } = require('./skills/SkillLoader.js');

    console.log(chalk.cyan('\n核心技能:\n'));
    for (const skill of coreSkills) {
      console.log(chalk.white(`  ${skill.id}`));
      console.log(chalk.gray(`    ${skill.description}\n`));
    }

    console.log(chalk.cyan('\nWeb 开发技能:\n'));
    for (const skill of webSkills) {
      console.log(chalk.white(`  ${skill.id}`));
      console.log(chalk.gray(`    ${skill.description}\n`));
    }

    console.log(chalk.cyan('\n专项技能:\n'));
    for (const skill of specializedSkills) {
      console.log(chalk.white(`  ${skill.id}`));
      console.log(chalk.gray(`    ${skill.description}\n`));
    }
  });

// 解析命令行参数
program.parse();
