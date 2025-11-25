# Detail 组件渲染问题根源分析

## 问题描述

Detail 组件点击后没有渲染出来，模态框打开但内容为空。

## 错误代码示例

```typescript
export class UserDetailComponent {
  @ViewChild('rolesTemplate') rolesTemplate!: TemplateRef<any>;
  
  // ❌ 错误的实现方式
  sections = computed<DetailSection[]>(() => {
    if (!this.user) return [];
    return [
      {
        title: 'User Information',
        fields: [
          // ...
          { 
            label: 'Roles', 
            value: null, 
            type: 'custom', 
            customTemplate: this.rolesTemplate  // ⚠️ 问题所在
          },
        ],
      },
    ];
  });
}
```

## 问题根源分析

### 1. Angular 生命周期执行顺序

```
组件创建
  ↓
构造函数执行
  ↓
@Input() 属性绑定
  ↓
ngOnInit()          ← computed 可能在这里执行
  ↓
ngOnChanges()       ← computed 可能在这里执行
  ↓
ngAfterViewInit()   ← @ViewChild 在这里才可用 ✅
```

**关键点**：`@ViewChild` 在 `ngAfterViewInit()` 之后才可用，但 `computed` 可能在更早的生命周期钩子中就被求值了。

### 2. Computed Signal 的执行时机

`computed` 是一个**响应式计算值**，它会在以下情况自动重新计算：

1. **首次访问时**：当你第一次读取 `sections()` 时
2. **依赖变化时**：当它依赖的 signal 变化时
3. **模板绑定中**：当模板中使用 `[sections]="sections()"` 时

```typescript
// 在模板中
<app-base-detail [sections]="sections()">
```

当 Angular 渲染模板时，会立即执行 `sections()`，此时：
- `this.user` 可能已经设置（通过 @Input）
- 但 `this.rolesTemplate` 还是 `undefined`（@ViewChild 还没初始化）

### 3. ViewChild 的初始化时机

```typescript
@ViewChild('rolesTemplate') rolesTemplate!: TemplateRef<any>;
```

`@ViewChild` 的初始化过程：

1. **组件创建阶段**：`rolesTemplate` = `undefined`
2. **模板编译阶段**：Angular 查找模板中的 `#rolesTemplate`
3. **视图初始化完成**：`ngAfterViewInit()` 执行后，`rolesTemplate` 才可用

### 4. 问题发生的具体流程

```
时间线：
T1: 组件创建，rolesTemplate = undefined
T2: @Input() user 被设置
T3: 模板开始渲染，调用 sections()
T4: computed 执行，尝试访问 this.rolesTemplate
T5: this.rolesTemplate 仍然是 undefined ❌
T6: sections 返回包含 undefined 的数组
T7: BaseDetailComponent 接收到 sections，但 customTemplate 是 undefined
T8: 模板无法渲染 custom 字段
T9: ngAfterViewInit() 执行，rolesTemplate 才可用（但为时已晚）
```

## 解决方案对比

### ❌ 错误方案：使用 Computed

```typescript
sections = computed<DetailSection[]>(() => {
  if (!this.user) return [];
  return [
    {
      fields: [
        { 
          customTemplate: this.rolesTemplate  // undefined!
        }
      ]
    }
  ];
});
```

**问题**：
- `computed` 在 `@ViewChild` 初始化前就执行
- `this.rolesTemplate` 是 `undefined`
- 即使后续 `rolesTemplate` 可用，`computed` 也不会自动重新计算（因为它不依赖 signal）

### ✅ 正确方案：使用 Signal + 手动更新

```typescript
sections = signal<DetailSection[]>([]);

private updateSections(): void {
  // 检查 ViewChild 是否可用
  if (!this.user || !this.rolesTemplate) {
    this.sections.set([]);
    return;
  }
  
  // 现在 rolesTemplate 已经可用
  this.sections.set([
    {
      fields: [
        { 
          customTemplate: this.rolesTemplate  // ✅ 可用
        }
      ]
    }
  ]);
}

ngAfterViewInit(): void {
  // ViewChild 已经初始化，可以安全使用
  this.updateSections();
}

ngOnChanges(changes: SimpleChanges): void {
  if (changes['user'] && this.rolesTemplate) {
    // 数据变化时，如果 ViewChild 已准备好，更新 sections
    this.updateSections();
  }
}
```

## 核心知识点

### 1. Computed vs Signal

| 特性 | `computed` | `signal` |
|------|----------|-----------|
| 自动计算 | ✅ 是 | ❌ 否 |
| 依赖追踪 | ✅ 是 | ❌ 否 |
| 手动更新 | ❌ 否 | ✅ 是 |
| 适用场景 | 纯数据计算 | 需要生命周期控制的场景 |

**何时使用 computed**：
- 纯数据转换（不依赖 DOM/ViewChild）
- 依赖其他 signals 的计算
- 例如：`fullName = computed(() => firstName() + ' ' + lastName())`

**何时使用 signal**：
- 需要访问 `@ViewChild`、`@ViewChildren`
- 需要在特定生命周期钩子中更新
- 需要手动控制更新时机

### 2. ViewChild 的生命周期

```typescript
// ViewChild 的可用时机
class MyComponent {
  @ViewChild('template') template!: TemplateRef<any>;
  
  constructor() {
    // ❌ template 是 undefined
  }
  
  ngOnInit() {
    // ❌ template 仍然是 undefined
  }
  
  ngAfterViewInit() {
    // ✅ template 现在可用
    console.log(this.template); // TemplateRef
  }
}
```

### 3. 模板引用的查找机制

```html
<!-- Angular 在 ngAfterViewInit 之前查找这些引用 -->
<ng-template #rolesTemplate>
  <!-- 内容 -->
</ng-template>
```

Angular 的查找顺序：
1. 编译模板
2. 创建视图
3. 查找所有 `#reference` 引用
4. 在 `ngAfterViewInit` 时注入到 `@ViewChild`

## 最佳实践

### 1. 检查 ViewChild 可用性

```typescript
private updateSections(): void {
  // 总是检查 ViewChild 是否可用
  if (!this.rolesTemplate) {
    return; // 或设置空数组
  }
  // 安全使用
}
```

### 2. 在正确的生命周期钩子中更新

```typescript
ngAfterViewInit(): void {
  // ViewChild 已准备好
  this.updateSections();
}

ngOnChanges(changes: SimpleChanges): void {
  // 数据变化时，检查 ViewChild 是否准备好
  if (changes['user'] && this.rolesTemplate) {
    this.updateSections();
  }
}
```

### 3. 使用 Effect（可选方案）

```typescript
// 另一种解决方案：使用 effect 监听变化
effect(() => {
  if (this.user() && this.rolesTemplate) {
    // 但要注意：effect 也可能在 ViewChild 之前执行
    // 所以仍然需要检查
    this.updateSections();
  }
});
```

## 总结

**错误的根本原因**：
1. `computed` 在 `@ViewChild` 初始化前执行
2. `@ViewChild` 在 `ngAfterViewInit()` 之后才可用
3. 时间差导致 `customTemplate` 是 `undefined`
4. 组件无法渲染自定义模板内容

**正确的解决方案**：
1. 使用 `signal` 而不是 `computed`
2. 在 `ngAfterViewInit()` 中更新
3. 在 `ngOnChanges()` 中检查并更新
4. 始终检查 `@ViewChild` 是否可用

**学习要点**：
- 理解 Angular 生命周期钩子的执行顺序
- 区分 `computed` 和 `signal` 的使用场景
- 了解 `@ViewChild` 的初始化时机
- 在访问 `@ViewChild` 前总是检查其可用性

