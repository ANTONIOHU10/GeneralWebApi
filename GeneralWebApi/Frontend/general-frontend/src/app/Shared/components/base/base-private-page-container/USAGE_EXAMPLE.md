# BasePrivatePageContainer 使用示例

## 在 employee-list 中使用

### 原始结构（使用容器组件之前）

```html
<div class="employee-list">
  <div class="list-header">
    <div class="header-content">
      <h2><span class="material-icons">people</span>Employee Management</h2>
      <p>Manage and view all employees in the system</p>
    </div>
    <div class="header-actions">
      <app-base-search ... />
    </div>
  </div>
  <app-base-tabs [tabs]="tabs" ... />
  <div class="content-area">
    <!-- content -->
  </div>
</div>
```

### 使用 BasePrivatePageContainer 后

```html
<app-base-private-page-container
  title="Employee Management"
  subtitle="Manage and view all employees in the system"
  icon="people"
  [showTabs]="true"
  [tabs]="tabs"
  [activeTabId]="activeTab()"
  (tabChange)="onTabChange($event)"
>
  <!-- Search in header actions -->
  <app-base-search
    slot="search"
    [config]="{
      placeholder: 'Search employees...',
      debounceTime: 300,
      minLength: 1,
      showClearButton: true,
      showSearchButton: true,
    }"
    (searchChange)="onSearchChange($event)"
    inputId="employee-search"
  />

  <!-- Content -->
  <div *ngIf="activeTab() === 'list'" class="tab-content">
    <!-- 加载状态 -->
    <app-base-loading *ngIf="loading$ | async" ... />
    
    <!-- 错误状态 -->
    <app-base-error *ngIf="error$ | async as error" ... />
    
    <!-- 员工列表 -->
    <div *ngIf="(loading$ | async) === false && (error$ | async) === null" class="employee-grid">
      <app-employee-card *ngFor="let employee of employees$ | async" ... />
    </div>
  </div>

  <div *ngIf="activeTab() === 'add'" class="tab-content">
    <app-add-employee></app-add-employee>
  </div>
</app-base-private-page-container>
```

## TypeScript 保持不变

```typescript
// 原有的 TypeScript 代码保持不变
export class EmployeeListComponent {
  tabs: TabItem[] = [
    { id: 'list', label: 'Employee List', icon: 'list' },
    { id: 'add', label: 'Add Employee', icon: 'person_add' },
    // ...
  ];
  
  onTabChange(tabId: string): void {
    this.setActiveTab(tabId as 'list' | 'add' | 'reports' | 'settings');
  }
}
```

## 优势

1. **统一的布局结构** - 所有 private 页面使用相同的布局
2. **减少重复代码** - 不需要在每个页面重复写 header/tabs 结构
3. **易于维护** - 布局样式集中管理
4. **一致性** - 确保所有页面看起来一致
5. **响应式** - 内置移动端适配











