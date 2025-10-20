# 🎨 GeneralWebApi 样式架构文档

## 📋 目录

- [架构概述](#架构概述)
- [文件结构](#文件结构)
- [设计系统](#设计系统)
- [主题系统](#主题系统)
- [组件样式](#组件样式)
- [工具类系统](#工具类系统)
- [使用指南](#使用指南)
- [最佳实践](#最佳实践)
- [迁移指南](#迁移指南)

---

## 🏗️ 架构概述

GeneralWebApi 采用**分层模块化样式架构**，基于 SCSS 和现代 CSS 特性构建。架构设计遵循以下原则：

- **🎯 模块化**：每个功能模块独立，职责清晰
- **🔄 可复用**：通过混入和工具类实现代码复用
- **🎨 主题化**：支持明暗主题无缝切换
- **📱 响应式**：内置响应式断点和适配
- **♿ 可访问**：遵循无障碍设计标准
- **⚡ 性能优化**：最小化CSS体积，优化加载速度

---

## 📁 文件结构

```
src/styles/
├── main.scss                    # 🎯 主入口文件
├── core/                        # 🔧 核心系统
│   ├── _variable.scss           # 设计令牌（颜色、间距、字体等）
│   ├── _mixin.scss             # 可复用混入函数
│   └── _typography.scss        # 排版系统
├── themes/                      # 🎨 主题系统
│   ├── _light-theme.scss       # 明亮主题
│   └── _dark-theme.scss        # 暗黑主题
├── components/                  # 🧩 组件样式
│   ├── _page-layout.scss       # 页面布局组件
│   ├── _forms.scss             # 表单组件
│   ├── _buttons.scss           # 按钮组件
│   ├── _status.scss            # 状态指示器
│   ├── _layout.scss            # 布局组件
│   └── _component-guidelines.scss # 组件开发指南
├── utilities/                   # ⚡ 工具类
│   └── _utilities.scss         # 通用工具类
└── STYLE_ARCHITECTURE.md       # 📖 本文档
```

---

## 🎨 设计系统

### 设计令牌（Design Tokens）

设计令牌是设计系统的原子单位，定义在 `core/_variable.scss` 中：

#### 颜色系统

```scss
// 主色调
$primary-50: #e3f2fd;
$primary-500: #2196f3; // 主色
$primary-900: #0d47a1;

// 中性色
$white: #ffffff;
$gray-50: #fafafa;
$gray-500: #9e9e9e;
$gray-900: #212121;
$black: #000000;

// 语义色
$success-500: #4caf50;
$warning-500: #ff9800;
$error-500: #f44336;
$info-500: #2196f3;
```

#### 间距系统

```scss
$spacing-1: 0.25rem; // 4px
$spacing-2: 0.5rem; // 8px
$spacing-3: 0.75rem; // 12px
$spacing-4: 1rem; // 16px
$spacing-6: 1.5rem; // 24px
$spacing-8: 2rem; // 32px
```

#### 字体系统

```scss
$font-family-primary:
  'Inter',
  -apple-system,
  BlinkMacSystemFont,
  sans-serif;
$font-size-xs: 0.75rem; // 12px
$font-size-sm: 0.875rem; // 14px
$font-size-base: 1rem; // 16px
$font-size-lg: 1.125rem; // 18px
$font-size-xl: 1.25rem; // 20px
$font-size-2xl: 1.5rem; // 24px
```

#### 圆角系统

```scss
$border-radius-sm: 0.25rem; // 4px
$border-radius-base: 0.375rem; // 6px
$border-radius-lg: 0.5rem; // 8px
$border-radius-xl: 0.75rem; // 12px
$border-radius-full: 9999px; // 圆形
```

#### 阴影系统

```scss
$shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
$shadow-base: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
$shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
$shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
```

---

## 🌓 主题系统

### CSS 变量映射

主题系统通过 CSS 变量实现，支持明暗主题无缝切换：

#### 明亮主题 (`_light-theme.scss`)

```scss
:root {
  // 主色调
  --color-primary-500: #{$primary-500};
  --color-primary-600: #{$primary-600};

  // 背景色
  --bg-primary: #{$white};
  --bg-surface: #{$white};
  --bg-secondary: #{$gray-50};

  // 文字颜色
  --text-primary: #{$gray-900};
  --text-secondary: #{$gray-600};
  --text-muted: #{$gray-500};

  // 边框颜色
  --border-primary: #{$gray-200};
  --border-secondary: #{$gray-300};
}
```

#### 暗黑主题 (`_dark-theme.scss`)

```scss
[data-theme='dark'] {
  // 主色调
  --color-primary-500: #{$primary-400};
  --color-primary-600: #{$primary-300};

  // 背景色
  --bg-primary: #{$gray-900};
  --bg-surface: #{$gray-800};
  --bg-secondary: #{$gray-700};

  // 文字颜色
  --text-primary: #{$gray-100};
  --text-secondary: #{$gray-300};
  --text-muted: #{$gray-400};

  // 边框颜色
  --border-primary: #{$gray-600};
  --border-secondary: #{$gray-500};
}
```

### 主题切换

```typescript
// 切换主题
function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', newTheme);
}
```

---

## 🧩 组件样式

### 页面布局组件

#### 页面容器

```scss
.page-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--bg-primary);
}
```

#### 页面头部

```scss
.page-header {
  padding: $spacing-6;
  border-bottom: 1px solid var(--border-primary);
  background: var(--bg-surface);

  h2 {
    @include heading-style($font-size-2xl, $font-weight-semibold);
    margin: 0 0 $spacing-2 0;
    display: flex;
    align-items: center;
    gap: $spacing-2;

    .material-icons {
      font-size: $font-size-2xl;
      color: var(--color-primary-500);
    }
  }
}
```

### 表单组件

#### 表单区域

```scss
.form-section {
  margin-bottom: $spacing-6;

  h3 {
    color: var(--text-primary);
    border-bottom: 1px solid var(--border-primary);
    padding-bottom: $spacing-2;
    margin-bottom: $spacing-4;
  }
}

.form-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: $spacing-4;
  margin-bottom: $spacing-4;
}

.form-group {
  display: flex;
  flex-direction: column;

  label {
    color: var(--text-primary);
    font-weight: $font-weight-medium;
    margin-bottom: $spacing-1;
  }
}

.form-control {
  width: 100%;
  padding: $spacing-2 $spacing-3;
  border: 1px solid var(--border-primary);
  border-radius: var(--border-radius-base);
  background: var(--bg-surface);
  color: var(--text-primary);
  font-size: $font-size-sm;
  transition: border-color $duration-200 $ease-in-out;

  &:focus {
    outline: none;
    border-color: var(--color-primary-500);
    box-shadow: 0 0 0 3px rgba(var(--color-primary-500), 0.1);
  }
}
```

### 按钮组件

#### 基础按钮

```scss
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: $spacing-2 $spacing-4;
  border: 1px solid transparent;
  border-radius: var(--border-radius-base);
  font-size: $font-size-sm;
  font-weight: $font-weight-medium;
  text-decoration: none;
  cursor: pointer;
  transition: all $duration-200 $ease-in-out;

  &:focus {
    outline: 2px solid var(--color-primary-300);
    outline-offset: 2px;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

.btn-primary {
  background: var(--color-primary-500);
  color: var(--color-white);
  border-color: var(--color-primary-500);

  &:hover:not(:disabled) {
    background: var(--color-primary-600);
    border-color: var(--color-primary-600);
  }
}

.btn-secondary {
  background: transparent;
  color: var(--text-primary);
  border-color: var(--border-primary);

  &:hover:not(:disabled) {
    background: var(--bg-secondary);
  }
}
```

---

## ⚡ 工具类系统

### 布局工具类

```scss
// 显示
.d-none {
  display: none !important;
}
.d-block {
  display: block !important;
}
.d-flex {
  display: flex !important;
}
.d-grid {
  display: grid !important;
}

// Flexbox
.flex-row {
  flex-direction: row !important;
}
.flex-column {
  flex-direction: column !important;
}
.justify-center {
  justify-content: center !important;
}
.justify-between {
  justify-content: space-between !important;
}
.items-center {
  align-items: center !important;
}
.items-start {
  align-items: flex-start !important;
}
```

### 间距工具类

```scss
// 外边距
.m-0 {
  margin: 0 !important;
}
.m-2 {
  margin: $spacing-2 !important;
}
.m-4 {
  margin: $spacing-4 !important;
}
.mt-2 {
  margin-top: $spacing-2 !important;
}
.mb-4 {
  margin-bottom: $spacing-4 !important;
}

// 内边距
.p-0 {
  padding: 0 !important;
}
.p-2 {
  padding: $spacing-2 !important;
}
.p-4 {
  padding: $spacing-4 !important;
}
.pt-2 {
  padding-top: $spacing-2 !important;
}
.pb-4 {
  padding-bottom: $spacing-4 !important;
}
```

### 文字工具类

```scss
.text-center {
  text-align: center !important;
}
.text-left {
  text-align: left !important;
}
.text-right {
  text-align: right !important;
}
.font-bold {
  font-weight: $font-weight-bold !important;
}
.font-medium {
  font-weight: $font-weight-medium !important;
}
```

---

## 📖 使用指南

### 1. 在组件中使用

#### TypeScript 组件

```typescript
@Component({
  selector: 'app-example',
  templateUrl: './example.component.html',
  styleUrls: ['./example.component.scss'],
})
export class ExampleComponent {}
```

#### HTML 模板

```html
<div class="page-container">
  <div class="page-header">
    <h2>页面标题</h2>
  </div>
  <div class="page-content">
    <form class="employee-form">
      <div class="form-section">
        <div class="form-row">
          <div class="form-group">
            <label>标签</label>
            <input class="form-control" type="text" />
          </div>
        </div>
      </div>
    </form>
  </div>
</div>
```

#### SCSS 样式

```scss
@use '../../../../styles/core/variable' as *;
@use '../../../../styles/core/mixin' as *;

.example-component {
  // 使用全局样式类作为基础
  @extend .page-container;

  // 添加自定义样式
  .custom-element {
    color: var(--text-primary);
    margin: $spacing-4;

    // 使用混入
    @include flex-center;
  }

  // 响应式设计
  @include mobile-only {
    .form-row {
      grid-template-columns: 1fr;
    }
  }
}
```

### 2. 混入使用

#### 布局混入

```scss
.my-component {
  @include flex-center; // 居中布局
  @include flex-between; // 两端对齐
  @include card-base; // 卡片基础样式
  @include card-elevated; // 卡片阴影样式
}
```

#### 响应式混入

```scss
.responsive-component {
  // 桌面端样式
  padding: $spacing-6;

  // 平板端样式
  @include tablet-up {
    padding: $spacing-4;
  }

  // 移动端样式
  @include mobile-only {
    padding: $spacing-2;
  }
}
```

### 3. CSS 变量使用

```scss
.themed-component {
  // 使用主题变量
  background: var(--bg-surface);
  color: var(--text-primary);
  border: 1px solid var(--border-primary);

  // 使用颜色变量
  .accent {
    color: var(--color-primary-500);
  }
}
```

---

## 🎯 最佳实践

### 1. 命名规范

#### BEM 命名法

```scss
// 块（Block）
.card {
}

// 元素（Element）
.card__header {
}
.card__body {
}
.card__footer {
}

// 修饰符（Modifier）
.card--elevated {
}
.card--outlined {
}
.card__header--large {
}
```

#### 工具类命名

```scss
// 间距：{property}{sides}-{size}
.m-4 {
  margin: $spacing-4;
}
.mt-2 {
  margin-top: $spacing-2;
}
.px-3 {
  padding-left: $spacing-3;
  padding-right: $spacing-3;
}

// 颜色：{property}-{color}-{shade}
.text-primary {
  color: var(--text-primary);
}
.bg-surface {
  background: var(--bg-surface);
}
```

### 2. 组件开发流程

1. **分析需求**：确定组件功能和样式需求
2. **选择基础**：选择合适的全局样式类作为基础
3. **添加自定义**：在组件SCSS中添加特定样式
4. **响应式适配**：添加移动端适配
5. **测试主题**：确保明暗主题下正常显示

### 3. 性能优化

#### 避免重复样式

```scss
// ❌ 避免
.component-a {
  color: #333;
}
.component-b {
  color: #333;
}

// ✅ 推荐
.text-primary {
  color: var(--text-primary);
}
```

#### 使用混入复用

```scss
// ❌ 避免
.button-1 {
  padding: 8px 16px;
  border-radius: 4px;
}
.button-2 {
  padding: 8px 16px;
  border-radius: 4px;
}

// ✅ 推荐
@mixin button-base {
  padding: $spacing-2 $spacing-4;
  border-radius: var(--border-radius-base);
}

.button-1 {
  @include button-base;
}
.button-2 {
  @include button-base;
}
```

---

## 🔄 迁移指南

### 从内联样式迁移

#### 迁移前

```typescript
@Component({
  template: `
    <div style="color: #333; padding: 16px;">
      <button style="background: #2196f3; color: white;">
        按钮
      </button>
    </div>
  `,
  styles: [`
    .component {
      color: #333;
      background: #ffffff;
    }
  `]
})
```

#### 迁移后

```typescript
@Component({
  templateUrl: './component.html',
  styleUrls: ['./component.scss']
})
```

```html
<div class="page-container">
  <button class="btn btn-primary">按钮</button>
</div>
```

```scss
@use '../../../../styles/core/variable' as *;

.page-container {
  color: var(--text-primary);
  padding: $spacing-4;
}
```

### 从硬编码颜色迁移

#### 迁移前

```scss
.component {
  color: #333;
  background: #ffffff;
  border: 1px solid #e0e0e0;
}
```

#### 迁移后

```scss
.component {
  color: var(--text-primary);
  background: var(--bg-surface);
  border: 1px solid var(--border-primary);
}
```

---

## 🚀 扩展指南

### 添加新组件样式

1. 在 `components/` 目录创建新文件
2. 在 `main.scss` 中导入
3. 遵循现有命名规范
4. 添加响应式支持

### 添加新主题

1. 在 `themes/` 目录创建主题文件
2. 定义完整的CSS变量映射
3. 在 `main.scss` 中导入
4. 更新主题切换逻辑

### 添加新工具类

1. 在 `utilities/_utilities.scss` 中添加
2. 遵循现有命名规范
3. 使用设计令牌
4. 添加响应式变体

---

## 📚 参考资源

- [SCSS 官方文档](https://sass-lang.com/documentation)
- [CSS 自定义属性](https://developer.mozilla.org/en-US/docs/Web/CSS/--*)
- [BEM 命名规范](http://getbem.com/)
- [设计令牌规范](https://spectrum.adobe.com/page/design-tokens/)

---

## 🤝 贡献指南

1. 遵循现有代码风格
2. 添加必要的注释
3. 确保响应式兼容
4. 测试主题切换
5. 更新相关文档

---

_最后更新：2024年12月_

