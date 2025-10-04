# 🚀 Angular 前端项目配置详细指南

## 📋 项目概述

本文档详细记录了 GeneralWebApi 前端项目的完整配置过程，包括项目初始化、代码质量工具、Git hooks 等所有配置步骤。

---

## 🎯 第一阶段：项目初始化

### 1.1 Angular 19 项目创建

#### 命令

```bash
ng new general-frontend --routing --style=scss --strict --standalone --package-manager=npm --minimal --skip-git=false --skip-tests=false
```

#### 配置参数详解

- **`--routing`**: 启用路由模块，支持单页应用导航
- **`--style=scss`**: 使用 SCSS 作为样式预处理器
- **`--strict`**: 启用 TypeScript 严格模式，提高代码质量
- **`--standalone`**: 使用 Angular 17+ 的 Standalone 组件架构
- **`--package-manager=npm`**: 指定使用 npm 作为包管理器
- **`--minimal`**: 创建最小化项目结构，不包含示例代码
- **`--skip-git=false`**: 初始化 Git 仓库
- **`--skip-tests=false`**: 包含测试配置

#### 生成的项目结构

```
general-frontend/
├── src/
│   ├── app/
│   │   ├── app.component.ts
│   │   ├── app.config.ts
│   │   └── app.routes.ts
│   ├── assets/
│   ├── environments/
│   └── styles/
├── angular.json
├── package.json
└── tsconfig.json
```

---

## 🔧 第二阶段：代码质量工具配置

### 2.1 ESLint 配置

#### 安装依赖

```bash
npm install -D eslint @typescript-eslint/eslint-plugin @typescript-eslint/parser
npm install -D @angular-eslint/eslint-plugin @angular-eslint/template-parser
```

#### 依赖说明

- **`eslint`**: 核心 ESLint 库
- **`@typescript-eslint/eslint-plugin`**: TypeScript 专用 ESLint 规则
- **`@typescript-eslint/parser`**: TypeScript 代码解析器
- **`@angular-eslint/eslint-plugin`**: Angular 专用 ESLint 规则
- **`@angular-eslint/template-parser`**: Angular 模板解析器

#### 配置文件：`.eslintrc.json`

```json
{
  "root": true,
  "ignorePatterns": ["projects/**/*"],
  "overrides": [
    {
      "files": ["*.ts"],
      "extends": [
        "eslint:recommended",
        "@typescript-eslint/recommended",
        "@angular-eslint/recommended",
        "prettier"
      ],
      "rules": {
        "@angular-eslint/directive-selector": [
          "error",
          {
            "type": "attribute",
            "prefix": "app",
            "style": "camelCase"
          }
        ],
        "@angular-eslint/component-selector": [
          "error",
          {
            "type": "element",
            "prefix": "app",
            "style": "kebab-case"
          }
        ],
        "@typescript-eslint/no-unused-vars": "error",
        "@typescript-eslint/no-explicit-any": "warn",
        "prefer-const": "error"
      }
    },
    {
      "files": ["*.html"],
      "extends": ["@angular-eslint/template/recommended"],
      "rules": {}
    }
  ]
}
```

#### 配置详解

- **`root: true`**: 标记为根配置文件
- **`ignorePatterns`**: 忽略指定路径的文件
- **`overrides`**: 针对不同文件类型应用不同规则
- **`extends`**: 继承预设规则配置
- **`rules`**: 自定义规则配置

### 2.2 Prettier 配置

#### 安装依赖

```bash
npm install -D prettier eslint-config-prettier eslint-plugin-prettier
```

#### 依赖说明

- **`prettier`**: 代码格式化工具
- **`eslint-config-prettier`**: 禁用与 Prettier 冲突的 ESLint 规则
- **`eslint-plugin-prettier`**: 将 Prettier 作为 ESLint 规则运行

#### 配置文件：`.prettierrc`

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false,
  "bracketSpacing": true,
  "arrowParens": "avoid"
}
```

#### 配置详解

- **`semi: true`**: 语句末尾添加分号
- **`trailingComma: "es5"`**: ES5 兼容的尾随逗号
- **`singleQuote: true`**: 使用单引号
- **`printWidth: 80`**: 每行最大字符数
- **`tabWidth: 2`**: 缩进宽度为 2 个空格
- **`useTabs: false`**: 使用空格而不是制表符
- **`bracketSpacing: true`**: 对象括号内添加空格
- **`arrowParens: "avoid"`**: 箭头函数参数避免括号

#### 忽略文件：`.prettierignore`

```
dist/
node_modules/
*.md
*.json
```

### 2.3 Commitlint 配置

#### 安装依赖

```bash
npm install -D @commitlint/config-conventional @commitlint/cli
```

#### 依赖说明

- **`@commitlint/config-conventional`**: 约定式提交规范配置
- **`@commitlint/cli`**: Commitlint 命令行工具

#### 配置文件：`commitlint.config.js`

```javascript
module.exports = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "type-enum": [
      2,
      "always",
      [
        "feat", // 新功能
        "fix", // 修复
        "docs", // 文档
        "style", // 格式
        "refactor", // 重构
        "perf", // 性能
        "test", // 测试
        "chore", // 构建
        "ci", // CI
        "build", // 构建
        "revert", // 回滚
      ],
    ],
  },
};
```

#### 提交信息规范

- **`feat:`**: 新功能
- **`fix:`**: 修复 bug
- **`docs:`**: 文档更新
- **`style:`**: 代码格式调整
- **`refactor:`**: 代码重构
- **`perf:`**: 性能优化
- **`test:`**: 测试相关
- **`chore:`**: 构建过程或辅助工具的变动

---

## 🔄 第三阶段：Git Hooks 配置

### 3.1 Husky 配置

#### 安装依赖

```bash
npm install -D husky lint-staged
npx husky init
```

#### 依赖说明

- **`husky`**: Git hooks 管理工具
- **`lint-staged`**: 对暂存区文件运行 linters

#### 配置文件：`.husky/pre-commit`

```bash
#!/usr/bin/env sh
# ========================================
# Pre-commit Hook
# 在 Git 提交前自动执行代码质量检查
# ========================================

# 加载 Husky 核心功能
. "$(dirname -- "$0")/_/husky.sh"

# 执行 lint-staged：
# - 格式化代码 (Prettier)
# - 修复 ESLint 问题
# - 只处理暂存区的文件
npx lint-staged
```

#### 配置文件：`.husky/commit-msg`

```bash
#!/usr/bin/env sh
# ========================================
# Commit Message Hook
# 检查提交信息格式是否符合规范
# ========================================

# 加载 Husky 核心功能
. "$(dirname -- "$0")/_/husky.sh"

# 使用 commitlint 检查提交信息格式
# ${1} 是 Git 传递的临时文件路径
npx --no -- commitlint --edit ${1}
```

### 3.2 Lint-staged 配置

#### 配置位置：`package.json`

```json
{
  "lint-staged": {
    "*.{ts,html,scss}": ["prettier --write", "eslint --fix"]
  }
}
```

#### 工作流程

1. **文件暂存**: 开发者执行 `git add`
2. **触发 hook**: 执行 `git commit`
3. **运行 lint-staged**: 对暂存区文件执行
4. **Prettier 格式化**: 自动格式化代码
5. **ESLint 修复**: 自动修复可修复的问题
6. **提交检查**: 检查提交信息格式

---

## 📝 第四阶段：VS Code 工作区配置

### 4.1 编辑器设置

#### 配置文件：`.vscode/settings.json`

```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.importModuleSpecifier": "relative",
  "angular.enable-strict-mode-prompt": false,
  "files.exclude": {
    "**/node_modules": true,
    "**/dist": true,
    "**/.angular": true
  }
}
```

#### 配置详解

- **`editor.formatOnSave: true`**: 保存时自动格式化
- **`source.fixAll.eslint: true`**: 保存时自动修复 ESLint 问题
- **`importModuleSpecifier: "relative"`**: 优先使用相对路径导入
- **`enable-strict-mode-prompt: false`**: 禁用 Angular 严格模式提示
- **`files.exclude`**: 隐藏指定文件夹

### 4.2 推荐扩展

#### 配置文件：`.vscode/extensions.json`

```json
{
  "recommendations": [
    "angular.ng-template",
    "ms-vscode.vscode-typescript-next",
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "bradlc.vscode-tailwindcss"
  ]
}
```

#### 扩展说明

- **`angular.ng-template`**: Angular 模板语法支持
- **`vscode-typescript-next`**: TypeScript 最新版本支持
- **`prettier-vscode`**: Prettier 代码格式化
- **`vscode-eslint`**: ESLint 代码检查
- **`vscode-tailwindcss`**: Tailwind CSS 支持

---

## 🛠️ 第五阶段：Package.json Scripts 配置

### 5.1 开发脚本

```json
{
  "scripts": {
    "ng": "ng",
    "start": "ng serve",
    "build": "ng build",
    "watch": "ng build --watch --configuration development",
    "prepare": "husky"
  }
}
```

#### 脚本说明

- **`ng`**: Angular CLI 命令入口
- **`start`**: 启动开发服务器 (http://localhost:4200)
- **`build`**: 构建生产版本
- **`watch`**: 监听模式构建
- **`prepare`**: Husky 初始化脚本

### 5.2 代码质量脚本

```json
{
  "scripts": {
    "lint": "ng lint",
    "lint:fix": "ng lint --fix",
    "format": "prettier --write \"src/**/*.{ts,html,scss,json}\"",
    "format:check": "prettier --check \"src/**/*.{ts,html,scss,json}\""
  }
}
```

#### 脚本说明

- **`lint`**: ESLint 代码检查
- **`lint:fix`**: 自动修复 ESLint 问题
- **`format`**: Prettier 代码格式化
- **`format:check`**: 检查代码格式

---

## 🔍 工具触发时机详解

### 工具功能对比

| 工具            | 主要作用       | 检查时机      | 处理范围     | 输出结果          |
| --------------- | -------------- | ------------- | ------------ | ----------------- |
| **ESLint**      | 代码质量检查   | 开发时/提交前 | 所有代码文件 | 错误报告/自动修复 |
| **Prettier**    | 代码格式化     | 开发时/提交前 | 所有代码文件 | 格式化后的代码    |
| **Commitlint**  | 提交信息检查   | 提交时        | 提交信息     | 通过/拒绝提交     |
| **Husky**       | Git Hooks 管理 | Git 操作时    | 整个项目     | 触发其他工具      |
| **Lint-staged** | 暂存区处理     | 提交前        | 暂存区文件   | 处理后的文件      |

### 详细触发时机表格

| 工具            | 触发时机                                         | 触发条件                                                     | 处理范围                           | 执行命令            | 输出结果          |
| --------------- | ------------------------------------------------ | ------------------------------------------------------------ | ---------------------------------- | ------------------- | ----------------- |
| **ESLint**      | 1. 保存文件时<br>2. 手动运行<br>3. Git commit 前 | 1. VS Code 保存<br>2. `npm run lint`<br>3. pre-commit hook   | 所有 .ts, .html 文件               | `ng lint`           | 错误报告/自动修复 |
| **Prettier**    | 1. 保存文件时<br>2. 手动运行<br>3. Git commit 前 | 1. VS Code 保存<br>2. `npm run format`<br>3. pre-commit hook | 所有 .ts, .html, .scss, .json 文件 | `prettier --write`  | 格式化后的代码    |
| **Commitlint**  | Git commit 时                                    | `git commit -m "message"`                                    | 提交信息                           | `commitlint --edit` | 通过/拒绝提交     |
| **Husky**       | Git 操作时                                       | 1. `git commit`<br>2. `git push`<br>3. `git add`             | 整个项目                           | 触发其他工具        | 管理 Git hooks    |
| **Lint-staged** | Git commit 前                                    | pre-commit hook 触发                                         | 暂存区文件                         | `lint-staged`       | 处理暂存区文件    |

### 完整触发流程

#### 1. 开发阶段 (编写代码时)

```
编写代码 → 保存文件 (Ctrl+S) → VS Code 触发 → Prettier 格式化 + ESLint 检查
```

**触发时机**: 每次保存文件  
**触发工具**: Prettier + ESLint  
**处理范围**: 当前保存的文件

#### 2. 手动检查阶段

```bash
# 手动格式化代码
npm run format

# 手动检查代码质量
npm run lint

# 手动修复代码问题
npm run lint:fix

# 手动检查格式
npm run format:check
```

**触发时机**: 开发者主动执行  
**触发工具**: Prettier + ESLint  
**处理范围**: 所有相关文件

#### 3. Git 提交阶段

```
git add . → 文件进入暂存区 → git commit -m "message" → Husky 触发 pre-commit →
Lint-staged 处理暂存区文件 → Prettier 格式化暂存区文件 → ESLint 检查和修复暂存区文件 →
代码质量检查通过? → Husky 触发 commit-msg → Commitlint 检查提交信息 →
提交信息格式正确? → 提交成功
```

**触发时机**: `git commit` 命令  
**触发工具**: Husky → Lint-staged → Prettier + ESLint → Commitlint  
**处理范围**: 暂存区文件 + 提交信息

### 详细触发条件表

#### 保存文件时 (VS Code)

| 工具         | 触发条件                       | 配置文件                | 处理文件       |
| ------------ | ------------------------------ | ----------------------- | -------------- |
| **Prettier** | `"editor.formatOnSave": true`  | `.vscode/settings.json` | 当前保存的文件 |
| **ESLint**   | `"source.fixAll.eslint": true` | `.vscode/settings.json` | 当前保存的文件 |

#### Git 操作时

| Git 命令     | 触发的 Hook | 触发的工具                      | 处理范围   |
| ------------ | ----------- | ------------------------------- | ---------- |
| `git add .`  | 无          | 无                              | 无         |
| `git commit` | pre-commit  | Lint-staged → Prettier + ESLint | 暂存区文件 |
| `git commit` | commit-msg  | Commitlint                      | 提交信息   |
| `git push`   | pre-push    | 可配置                          | 可配置     |

#### 手动执行时

| 命令                   | 触发的工具 | 处理范围     | 输出结果     |
| ---------------------- | ---------- | ------------ | ------------ |
| `npm run format`       | Prettier   | 所有相关文件 | 格式化代码   |
| `npm run lint`         | ESLint     | 所有相关文件 | 错误报告     |
| `npm run lint:fix`     | ESLint     | 所有相关文件 | 自动修复     |
| `npm run format:check` | Prettier   | 所有相关文件 | 格式检查结果 |

---

## 🎯 配置效果总结

### 开发体验提升

- ✅ **自动格式化**: 保存时自动格式化代码
- ✅ **自动修复**: ESLint 问题自动修复
- ✅ **实时检查**: 编写代码时实时提示问题
- ✅ **统一环境**: 团队成员使用相同配置

### 代码质量保证

- ✅ **格式统一**: Prettier 确保代码风格一致
- ✅ **质量检查**: ESLint 发现潜在问题
- ✅ **提交规范**: Commitlint 确保提交信息规范
- ✅ **自动检查**: Git hooks 自动执行检查

### 团队协作

- ✅ **配置共享**: `.vscode/` 配置确保环境一致
- ✅ **扩展推荐**: 自动推荐必要扩展
- ✅ **规范统一**: 统一的代码规范和提交规范

---

## 🚀 使用指南

### 日常开发流程

```bash
# 1. 启动开发服务器
npm start

# 2. 开发完成后格式化代码
npm run format

# 3. 修复代码问题
npm run lint:fix

# 4. 检查代码质量
npm run lint

# 5. 提交代码 (自动触发 hooks)
git add .
git commit -m "feat: 添加新功能"
```

### 代码检查流程

```bash
# 检查格式
npm run format:check

# 检查代码质量
npm run lint

# 构建项目
npm run build
```

---

## 📋 文件结构总览

```
general-frontend/
├── .husky/
│   ├── pre-commit          # 提交前检查
│   └── commit-msg          # 提交信息检查
├── .vscode/
│   ├── settings.json       # 编辑器设置
│   └── extensions.json     # 推荐扩展
├── src/                    # 源代码
├── .eslintrc.json         # ESLint 配置
├── .prettierrc            # Prettier 配置
├── .prettierignore        # Prettier 忽略文件
├── commitlint.config.js   # Commitlint 配置
└── package.json           # 项目配置和脚本
```

---

**文档版本**: v1.0  
**创建日期**: 2024 年 12 月 19 日  
**维护者**: 开发团队

---

_此文档记录了完整的项目配置过程，确保团队成员能够理解和维护项目配置。_
