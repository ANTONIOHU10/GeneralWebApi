# 🚀 Angular 前端开发计划

## 📊 后端已完成功能分析

### ✅ 已实现的核心模块

1. **员工管理模块** (87% 完成)

   - 员工档案管理 (95% 完成)
   - 组织架构管理 (90% 完成)
   - 权限管理系统 (100% 完成)
   - 审计系统 (100% 完成)

2. **认证授权系统** (100% 完成)

   - JWT Token 认证
   - 基于角色的权限控制 (RBAC)
   - API Key 认证
   - 多角色策略 (Admin, Manager, User)

3. **审计追踪系统** (100% 完成)

   - 通用审计日志
   - 员工审计日志
   - 权限审计日志
   - 完整的操作追踪

4. **合同管理系统** (70% 完成)
   - 合同基础管理
   - 合同审批流程 (100% 完成)
   - 审批步骤管理

### 🔌 可用的 API 端点

- **认证**: `/api/v1/auth/*`
- **员工管理**: `/api/v1/employees/*`
- **部门管理**: `/api/v1/departments/*`
- **权限管理**: `/api/v1/roles/*`, `/api/v1/permissions/*`
- **审计日志**: `/api/v1/audit-logs/*`, `/api/v1/employee-audit-logs/*`
- **合同管理**: `/api/v1/contracts/*`, `/api/v1/contracts/approvals/*`
- **健康检查**: `/api/v1/health/*`
- **文档管理**: `/api/v1/documents/*`

---

## 🎯 前端开发计划

### 第一阶段：基础架构搭建 (1-2 周)

#### 1.1 项目初始化与环境配置

##### 1.1.1 Angular 19 项目创建与配置 ✅ **已完成**

```bash
# 项目已创建，配置如下：
- Angular 19.2.0 ✅
- TypeScript 5.7.2 ✅
- SCSS 样式支持 ✅
- 路由配置 ✅
- Standalone 模式 ✅
```

##### 1.1.2 环境配置文件设置

- [ ] **开发环境配置** (`src/environments/environment.ts`)

  ```typescript
  export const environment = {
    production: false,
    apiUrl: "https://localhost:7297/api/v1",
    appName: "GeneralWebApi Frontend",
    version: "1.0.0",
    enableLogging: true,
    enableDevTools: true,
  };
  ```

- [ ] **生产环境配置** (`src/environments/environment.prod.ts`)

  ```typescript
  export const environment = {
    production: true,
    apiUrl: "https://api.yourdomain.com/api/v1",
    appName: "GeneralWebApi Frontend",
    version: "1.0.0",
    enableLogging: false,
    enableDevTools: false,
  };
  ```

- [ ] **测试环境配置** (`src/environments/environment.test.ts`)
  ```typescript
  export const environment = {
    production: false,
    apiUrl: "https://test-api.yourdomain.com/api/v1",
    appName: "GeneralWebApi Frontend (Test)",
    version: "1.0.0",
    enableLogging: true,
    enableDevTools: true,
  };
  ```

##### 1.1.3 TypeScript 5.7+ 配置优化

- [ ] **更新 tsconfig.json**
  ```json
  {
    "compileOnSave": false,
    "compilerOptions": {
      "outDir": "./dist/out-tsc",
      "strict": true,
      "noImplicitOverride": true,
      "noPropertyAccessFromIndexSignature": true,
      "noImplicitReturns": true,
      "noFallthroughCasesInSwitch": true,
      "skipLibCheck": true,
      "isolatedModules": true,
      "esModuleInterop": true,
      "experimentalDecorators": true,
      "moduleResolution": "bundler",
      "importHelpers": true,
      "target": "ES2022",
      "module": "ES2022",
      "baseUrl": "./src",
      "paths": {
        "@core/*": ["app/core/*"],
        "@shared/*": ["app/shared/*"],
        "@features/*": ["app/features/*"],
        "@layout/*": ["app/layout/*"],
        "@environments/*": ["environments/*"]
      }
    },
    "angularCompilerOptions": {
      "enableI18nLegacyMessageIdFormat": false,
      "strictInjectionParameters": true,
      "strictInputAccessModifiers": true,
      "strictTemplates": true
    }
  }
  ```

##### 1.1.4 ESLint + Prettier 代码规范配置

- [ ] **安装 ESLint 和 Prettier**

  ```bash
  npm install -D eslint @typescript-eslint/eslint-plugin @typescript-eslint/parser

  npm install -D prettier eslint-config-prettier eslint-plugin-prettier

  npm install -D @angular-eslint/eslint-plugin @angular-eslint/template-parser
  ```

- [ ] **创建 .eslintrc.json**

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

- [ ] **创建 .prettierrc**

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

- [ ] **创建 .prettierignore**

  ```
  dist/
  node_modules/
  *.md
  *.json
  ```

##### 1.1.5 Husky Git hooks 配置

- [ ] **安装 Husky**

  ```bash
  npm install -D husky lint-staged
  npx husky init
  ```

- [ ] **配置 package.json**

  ```json
  {
    "scripts": {
      "prepare": "husky",
      "lint": "ng lint",
      "lint:fix": "ng lint --fix",
      "format": "prettier --write \"src/**/*.{ts,html,scss,json}\"",
      "format:check": "prettier --check \"src/**/*.{ts,html,scss,json}\""
    },
    "lint-staged": {
      "*.{ts,html,scss}": ["prettier --write", "eslint --fix"]
    }
  }
  ```

- [ ] **创建 pre-commit hook** (`.husky/pre-commit`)

  ```bash
  #!/usr/bin/env sh
  . "$(dirname -- "$0")/_/husky.sh"

  npx lint-staged
  ```

- [ ] **创建 commit-msg hook** (`.husky/commit-msg`)

  ```bash
  #!/usr/bin/env sh
  . "$(dirname -- "$0")/_/husky.sh"

  npx --no -- commitlint --edit ${1}
  ```

--- DONE

##### 1.1.6 代码质量工具配置

- [ ] **安装 commitlint**

  ```bash
  npm install -D @commitlint/config-conventional @commitlint/cli
  ```

- [ ] **创建 commitlint.config.js**
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

##### 1.1.7 VS Code 工作区配置

- [ ] **创建 .vscode/settings.json**

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

- [ ] **创建 .vscode/extensions.json**
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

##### 1.1.8 项目文档配置

- [ ] **创建 README.md**

  ````markdown
  # GeneralWebApi Frontend

  ## 项目简介

  基于 Angular 19 的企业级内部管理系统前端

  ## 技术栈

  - Angular 19.2.0
  - TypeScript 5.7.2
  - Angular Material
  - PrimeNG
  - NgRx
  - RxJS

  ## 开发环境

  - Node.js 20+
  - npm 10+

  ## 快速开始

  ```bash
  # 安装依赖
  npm install

  # 启动开发服务器
  npm start

  # 构建项目
  npm run build
  ```
  ````

  ```

  ```

- [ ] **创建 .gitignore 更新**

  ```
  # Angular
  /dist/
  /tmp/
  /out-tsc/
  /bazel-out

  # Dependencies
  /node_modules/

  # IDEs and editors
  /.idea/
  .project
  .classpath
  .c9/
  *.launch
  .settings/
  *.sublime-workspace

  # IDE - VSCode
  .vscode/*
  !.vscode/settings.json
  !.vscode/tasks.json
  !.vscode/launch.json
  !.vscode/extensions.json

  # Logs
  logs
  *.log
  npm-debug.log*
  yarn-debug.log*
  yarn-error.log*
  lerna-debug.log*

  # Runtime data
  pids
  *.pid
  *.seed
  *.pid.lock

  # Coverage directory used by tools like istanbul
  coverage/
  *.lcov

  # nyc test coverage
  .nyc_output

  # Dependency directories
  node_modules/
  jspm_packages/

  # Optional npm cache directory
  .npm

  # Optional eslint cache
  .eslintcache

  # Optional REPL history
  .node_repl_history

  # Output of 'npm pack'
  *.tgz

  # Yarn Integrity file
  .yarn-integrity

  # dotenv environment variables file
  .env
  .env.test
  .env.production

  # parcel-bundler cache (https://parceljs.org/)
  .cache
  .parcel-cache

  # next.js build output
  .next

  # nuxt.js build output
  .nuxt

  # vuepress build output
  .vuepress/dist

  # Serverless directories
  .serverless/

  # FuseBox cache
  .fusebox/

  # DynamoDB Local files
  .dynamodb/

  # TernJS port file
  .tern-port
  ```

##### 1.1.9 验证配置

- [ ] **运行代码检查**

  ```bash
  npm run lint
  npm run format:check
  ```

- [ ] **测试构建**

  ```bash
  npm run build
  npm run build --configuration=production
  ```

- [ ] **启动开发服务器**
  ```bash
  npm start
  ```

##### 1.1.10 项目结构验证

- [ ] **确认目录结构**

  ```
  src/
  ├── app/
  │   ├── core/
  │   ├── shared/
  │   ├── features/
  │   ├── layout/
  │   ├── app.component.ts
  │   ├── app.config.ts
  │   └── app.routes.ts
  ├── assets/
  ├── environments/
  ├── styles/
  └── index.html
  ```

- [ ] **确认配置文件**
  ```
  .eslintrc.json ✅
  .prettierrc ✅
  .prettierignore ✅
  .husky/ ✅
  .vscode/ ✅
  commitlint.config.js ✅
  ```

#### 1.2 核心依赖安装, 记得上官网使用最新适配指令，不要听 ai 的

##### 1.2.1 Angular Material 19+ 安装配置

- [ ] **安装 Angular Material**

  ```bash
  cd GeneralWebApi/Frontend/general-frontend
  ng add @angular/material
  ```

- [ ] **安装过程选择**

  - **Choose a prebuilt theme**: 选择 `Indigo/Pink` 或 `Custom`
  - **Set up global Angular Material typography styles**: `Yes`
  - **Set up browser animations for Angular Material**: `Yes`

- [ ] **手动安装（如果 ng add 失败）**

  ```bash
  npm install @angular/material @angular/cdk
  npm install -D @angular/material-moment-adapter
  ```

- [ ] **配置 Angular Material**

  在 `src/app/app.config.ts` 中添加：

  ```typescript
  import { provideAnimationsAsync } from "@angular/platform-browser/animations/async";
  import { provideHttpClient } from "@angular/common/http";

  export const appConfig: ApplicationConfig = {
    providers: [
      // ... existing providers
      provideAnimationsAsync(),
      provideHttpClient(),
    ],
  };
  ```

- [ ] **更新全局样式**

  在 `src/styles.scss` 中添加：【如果选择了 custom 以外的主题】

  ```scss
  @import "@angular/material/prebuilt-themes/indigo-pink.css";
  ```

  DONE

##### 1.2.2 PrimeNG 17+ 安装配置

- [ ] **安装 PrimeNG**

  // prime 17 和 ng19 兼容

  ```bash
  # 安装与 Angular 19 兼容的 PrimeNG 版本
  npm install primeng@19.1.3 primeicons@7.0.0
  npm install -D @types/node
  ```

- [ ] **配置 PrimeNG 样式**
      follow the lates angular prime Ng website guiding
      https://v19.primeng.org/installation

  ```

  ```

- [ ] **配置 PrimeNG 服务**
      for now added a Aura theme for components & table ecc.
      follow the lates angular prime Ng website guiding

Done

##### 1.2.3 NgRx 19+ 状态管理配置

- [ ] **安装 NgRx 19 基础包**

  ```bash
  # 安装 NgRx 19 核心包
  npm install @ngrx/store@19 @ngrx/effects@19 @ngrx/store-devtools@19 @ngrx/router-store@19

  # 用于 ng cli 生成 NgRx 代码 (可选)
  npm install -D @ngrx/schematics@19
  ```

DONE

- [ ] **创建基础状态文件**

  创建 `src/app/store/app.store.ts`：

  ```typescript
  import { ActionReducerMap } from "@ngrx/store";

  export interface AppState {
    // 应用状态接口 - 后续根据需要添加
  }

  export const reducers: ActionReducerMap<AppState> = {
    // 状态 reducers - 后续根据需要添加
  };
  ```

- [ ] **配置 NgRx Store 基础架构**

  在 `src/app/app.config.ts` 中添加：

  ```typescript
  import { provideStore } from "@ngrx/store";
  import { provideEffects } from "@ngrx/effects";
  import { provideStoreDevtools } from "@ngrx/store-devtools";
  import { provideRouterStore } from "@ngrx/router-store";
  import { reducers } from "./store/app.store";

  export const appConfig: ApplicationConfig = {
    providers: [
      // ... existing providers
      provideStore(reducers),
      provideEffects([]), // 空数组，后续根据需要添加
      provideStoreDevtools({
        maxAge: 25,
        logOnly: false,
        autoPause: true,
        trace: true,
        traceLimit: 75,
      }),
      provideRouterStore(),
    ],
  };
  ```

- [ ] **创建 store 目录结构**

  ```
  src/app/store/
  ├── app.store.ts          # 主状态文件
  ├── index.ts              # 导出文件 (可选)
  └── features/             # 功能模块状态 (后续添加)
      ├── auth/             # 认证模块 (后续添加)
      ├── employees/        # 员工模块 (后续添加)
      └── departments/      # 部门模块 (后续添加)
  ```

##### 1.2.4 RxJS 7+ 响应式编程

- [ ] **RxJS 已包含在 Angular 中**

  RxJS 7+ 已经包含在 Angular 19 中，无需额外安装。

- [ ] **配置 RxJS 操作符**

  创建 `src/app/core/rxjs-operators.ts`：

  ```typescript
  import { Observable, of } from "rxjs";
  import { map, catchError } from "rxjs/operators";

  // 自定义 RxJS 操作符
  export const handleError = <T>(operation = "operation", result?: T) => {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed:`, error);
      return of(result as T);
    };
  };
  ```

##### 1.2.5 Angular Signals 配置

- [ ] **Angular Signals 已内置**

  Angular 17+ 内置了 Signals，无需额外安装。

- [ ] **创建 Signal 服务示例**

  创建 `src/app/core/signal.service.ts`：

  ```typescript
  import { Injectable, signal, computed } from "@angular/core";

  @Injectable({
    providedIn: "root",
  })
  export class SignalService {
    // 创建 signal
    private count = signal(0);

    // 创建 computed signal
    doubleCount = computed(() => this.count() * 2);

    // 更新 signal
    increment() {
      this.count.update((value) => value + 1);
    }

    decrement() {
      this.count.update((value) => value - 1);
    }

    // 获取 signal 值
    getCount() {
      return this.count();
    }
  }
  ```

##### 1.2.6 验证安装

- [ ] **测试 Angular Material**

  在 `src/app/app.component.ts` 中添加：

  ```typescript
  import { Component } from "@angular/core";
  import { MatButtonModule } from "@angular/material/button";

  @Component({
    selector: "app-root",
    standalone: true,
    imports: [MatButtonModule],
    template: `
      <h1>GeneralWebApi Frontend</h1>
      <button mat-raised-button color="primary">Material Button</button>
    `,
  })
  export class AppComponent {
    title = "general-frontend";
  }
  ```

- [ ] **测试 PrimeNG**

  在 `src/app/app.component.ts` 中添加：

  ```typescript
  import { Component } from "@angular/core";
  import { ButtonModule } from "primeng/button";

  @Component({
    selector: "app-root",
    standalone: true,
    imports: [ButtonModule],
    template: `
      <h1>GeneralWebApi Frontend</h1>
      <p-button label="PrimeNG Button" icon="pi pi-check"></p-button>
    `,
  })
  export class AppComponent {
    title = "general-frontend";
  }
  ```

- [ ] **启动项目验证**

  ```bash
  npm start
  ```

  访问 `http://localhost:4200` 查看效果。

##### 1.2.7 完整配置文件

- [ ] **更新 `src/app/app.config.ts` (基础架构配置)**

  ```typescript
  import { ApplicationConfig } from "@angular/core";
  import { provideRouter } from "@angular/router";
  import { provideAnimationsAsync } from "@angular/platform-browser/animations/async";
  import { provideHttpClient } from "@angular/common/http";
  import { provideStore } from "@ngrx/store";
  import { provideEffects } from "@ngrx/effects";
  import { provideStoreDevtools } from "@ngrx/store-devtools";
  import { provideRouterStore } from "@ngrx/router-store";
  import { providePrimeNG } from "primeng/config";
  import Aura from "@primeng/themes/aura";

  import { routes } from "./app.routes";
  import { reducers } from "./store/app.store";

  export const appConfig: ApplicationConfig = {
    providers: [
      // 路由配置
      provideRouter(routes),

      // 动画和 HTTP 客户端
      provideAnimationsAsync(),
      provideHttpClient(),

      // NgRx 19 基础状态管理
      provideStore(reducers),
      provideEffects([]), // 空数组，后续根据需要添加
      provideStoreDevtools({
        maxAge: 25,
        logOnly: false,
        autoPause: true,
        trace: true,
        traceLimit: 75,
      }),
      provideRouterStore(),

      // PrimeNG 19 主题配置
      providePrimeNG({
        theme: {
          preset: Aura,
        },
      }),
    ],
  };
  ```

- [ ] **更新 `src/styles.scss`**

  ```scss
  /* Angular Material 主题 */
  @import "@angular/material/prebuilt-themes/indigo-pink.css";

  /* PrimeNG 主题 */
  @import "primeng/resources/themes/lara-light-blue/theme.css";
  @import "primeng/resources/primeng.css";
  @import "primeicons/primeicons.css";

  /* 全局样式 */
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: "Roboto", sans-serif;
    line-height: 1.6;
  }
  ```

#### 1.3 项目结构搭建

```
src/
├── app/
│   ├── core/                    # 核心模块
│   │   ├── services/           # 核心服务
│   │   ├── guards/             # 路由守卫
│   │   ├── interceptors/       # HTTP拦截器
│   │   ├── models/             # 核心模型
│   │   └── constants/          # 常量定义
│   ├── shared/                 # 共享模块
│   │   ├── components/         # 共享组件
│   │   ├── directives/         # 自定义指令
│   │   ├── pipes/              # 自定义管道
│   │   ├── validators/         # 表单验证器
│   │   └── models/             # 共享模型
│   ├── features/               # 功能模块
│   │   ├── auth/               # 认证模块
│   │   ├── employees/          # 员工管理
│   │   ├── departments/        # 部门管理
│   │   ├── permissions/        # 权限管理
│   │   ├── contracts/          # 合同管理
│   │   ├── approvals/          # 审批流程
│   │   └── audit/              # 审计日志
│   ├── layout/                 # 布局组件
│   │   ├── header/
│   │   ├── sidebar/
│   │   └── footer/
│   └── app-routing.module.ts   # 主路由配置
```
