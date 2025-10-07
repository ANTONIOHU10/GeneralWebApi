# Frontend project:

ng new general-frontend
--routing
--style=scss
--strict
--standalone
--package-manager=npm
--minimal
--skip-git=false
--skip-tests=false

# packages

    -D = to devDependency, not for production environment

    npm install -D eslint @typescript-eslint/eslint-plugin @typescript-eslint/parser

    npm install -D prettier eslint-config-prettier eslint-plugin-prettier

    npm install -D @angular-eslint/eslint-plugin @angular-eslint/template-parser

    npm install jwt-decode

# scripts

npm start # 启动开发服务器
npm run format # 格式化代码
npm run lint:fix # 修复代码问题
npm run format:check # 检查格式
npm run lint # 检查代码质量
npm run build # 生产构建
npm run watch # 开发构建
