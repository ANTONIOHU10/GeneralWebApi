# Base Components Library

一套完整的企业级 Angular 基础组件库，提供高度可复用的 UI 组件。

## 📦 组件列表

### 布局组件 (Layout Components)

#### BaseContainerComponent

响应式容器组件，支持多种尺寸和样式配置。

```typescript
import {
  BaseContainerComponent,
  ContainerConfig,
} from '@shared/components/base';

@Component({
  template: `
    <app-base-container [config]="containerConfig">
      <h1>Container Content</h1>
    </app-base-container>
  `,
  imports: [BaseContainerComponent],
})
export class MyComponent {
  containerConfig: ContainerConfig = {
    maxWidth: 'lg',
    padding: 'md',
    margin: 'auto',
    center: true,
    background: 'surface',
    border: true,
    rounded: true,
    shadow: 'md',
  };
}
```

#### BaseGridComponent

灵活的网格布局组件，支持响应式列数。

```typescript
import { BaseGridComponent, GridConfig } from '@shared/components/base';

@Component({
  template: `
    <app-base-grid [config]="gridConfig">
      <div>Item 1</div>
      <div>Item 2</div>
      <div>Item 3</div>
    </app-base-grid>
  `,
  imports: [BaseGridComponent],
})
export class MyComponent {
  gridConfig: GridConfig = {
    columns: { xs: 1, sm: 2, md: 3, lg: 4 },
    gap: 'md',
    align: 'stretch',
    justify: 'start',
  };
}
```

#### BaseCardComponent

卡片容器组件，支持多种变体和插槽。

```typescript
import { BaseCardComponent } from '@shared/components/base';

@Component({
  template: `
    <app-base-card
      title="Card Title"
      subtitle="Card Subtitle"
      icon="dashboard"
      variant="elevated"
      [showActions]="true"
    >
      <div slot="actions">
        <button>Action</button>
      </div>

      <p>Card content goes here</p>

      <div slot="footer">
        <button>Footer Action</button>
      </div>
    </app-base-card>
  `,
  imports: [BaseCardComponent],
})
export class MyComponent {}
```

### 表单组件 (Form Components)

#### BaseInputComponent

功能丰富的输入框组件，支持多种类型和验证。

```typescript
import { BaseInputComponent } from '@shared/components/base';

@Component({
  template: `
    <app-base-input
      label="Email Address"
      type="email"
      placeholder="Enter your email"
      [required]="true"
      [clearable]="true"
      prefixIcon="email"
      hint="We'll never share your email"
      [(ngModel)]="email"
      (inputChange)="onEmailChange($event)"
    >
    </app-base-input>
  `,
  imports: [BaseInputComponent, FormsModule],
})
export class MyComponent {
  email = '';

  onEmailChange(value: string) {
    console.log('Email changed:', value);
  }
}
```

#### BaseSelectComponent

下拉选择器组件，支持搜索、分组和自定义选项。

```typescript
import { BaseSelectComponent, SelectOption } from '@shared/components/base';

@Component({
  template: `
    <app-base-select
      label="Select Country"
      placeholder="Choose a country"
      [options]="countries"
      [searchable]="true"
      [required]="true"
      [(ngModel)]="selectedCountry"
    >
    </app-base-select>
  `,
  imports: [BaseSelectComponent, FormsModule],
})
export class MyComponent {
  selectedCountry = '';

  countries: SelectOption[] = [
    { value: 'us', label: 'United States', icon: 'flag' },
    { value: 'ca', label: 'Canada', icon: 'flag' },
    { value: 'uk', label: 'United Kingdom', icon: 'flag' },
  ];
}
```

#### BaseSearchComponent

功能强大的搜索框组件，支持防抖、清除和自定义配置。

```typescript
import { BaseSearchComponent, SearchConfig } from '@shared/components/base';

@Component({
  template: `
    <app-base-search
      [config]="searchConfig"
      (searchChange)="onSearchChange($event)"
      (searchSubmit)="onSearchSubmit($event)"
      (searchClear)="onSearchClear()"
    >
    </app-base-search>
  `,
  imports: [BaseSearchComponent],
})
export class MyComponent {
  searchConfig: SearchConfig = {
    placeholder: 'Search employees...',
    debounceTime: 300,
    minLength: 1,
    showClearButton: true,
    showSearchButton: true,
    disabled: false,
  };

  onSearchChange(searchTerm: string) {
    console.log('Search term:', searchTerm);
  }

  onSearchSubmit(searchTerm: string) {
    console.log('Search submitted:', searchTerm);
  }

  onSearchClear() {
    console.log('Search cleared');
  }
}
```

#### BaseCheckboxComponent

自定义样式的复选框组件，支持多种变体和尺寸。

```typescript
import { BaseCheckboxComponent, CheckboxConfig } from '@shared/components/base';

@Component({
  template: `
    <app-base-checkbox
      label="I agree to the terms and conditions"
      [config]="checkboxConfig"
      [(ngModel)]="isAgreed"
      (valueChange)="onCheckboxChange($event)"
    >
    </app-base-checkbox>
  `,
  imports: [BaseCheckboxComponent, FormsModule],
})
export class MyComponent {
  isAgreed = false;

  checkboxConfig: CheckboxConfig = {
    size: 'md',
    variant: 'primary',
    showLabel: true,
    disabled: false,
    required: true,
    indeterminate: false,
  };

  onCheckboxChange(value: boolean) {
    console.log('Checkbox changed:', value);
  }
}
```

### 数据展示组件 (Data Display Components)

#### BaseTableComponent

功能完整的数据表格组件，支持排序、分页、搜索等。

```typescript
import {
  BaseTableComponent,
  TableColumn,
  TableAction,
} from '@shared/components/base';

@Component({
  template: `
    <app-base-table
      title="Employee List"
      [data]="employees"
      [columns]="columns"
      [actions]="actions"
      [config]="tableConfig"
    >
    </app-base-table>
  `,
  imports: [BaseTableComponent],
})
export class MyComponent {
  employees = [
    {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      department: 'Engineering',
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane@example.com',
      department: 'Marketing',
    },
  ];

  columns: TableColumn[] = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'department', label: 'Department' },
  ];

  actions: TableAction[] = [
    { label: 'Edit', icon: 'edit', onClick: item => this.editEmployee(item) },
    {
      label: 'Delete',
      icon: 'delete',
      variant: 'danger',
      onClick: item => this.deleteEmployee(item),
    },
  ];

  tableConfig = {
    showHeader: true,
    showFooter: true,
    showPagination: true,
    showSearch: true,
    striped: true,
    hoverable: true,
  };

  editEmployee(employee: any) {
    console.log('Edit:', employee);
  }

  deleteEmployee(employee: any) {
    console.log('Delete:', employee);
  }
}
```

#### BasePaginationComponent

分页组件，支持多种配置选项。

```typescript
import {
  BasePaginationComponent,
  PaginationConfig,
} from '@shared/components/base';

@Component({
  template: `
    <app-base-pagination
      [currentPage]="currentPage"
      [totalPages]="totalPages"
      [totalItems]="totalItems"
      [pageSize]="pageSize"
      [config]="paginationConfig"
      (pageChange)="onPageChange($event)"
      (pageSizeChange)="onPageSizeChange($event)"
    >
    </app-base-pagination>
  `,
  imports: [BasePaginationComponent],
})
export class MyComponent {
  currentPage = 1;
  totalPages = 10;
  totalItems = 100;
  pageSize = 10;

  paginationConfig: PaginationConfig = {
    showFirstLast: true,
    showPrevNext: true,
    showPageNumbers: true,
    showInfo: true,
    showPageSize: true,
    pageSizeOptions: [5, 10, 25, 50],
  };

  onPageChange(page: number) {
    this.currentPage = page;
  }

  onPageSizeChange(size: number) {
    this.pageSize = size;
  }
}
```

### 反馈组件 (Feedback Components)

#### BaseLoadingComponent

多种加载状态组件，支持不同的动画效果。

```typescript
import { BaseLoadingComponent, LoadingConfig } from '@shared/components/base';

@Component({
  template: ` <app-base-loading [config]="loadingConfig"> </app-base-loading> `,
  imports: [BaseLoadingComponent],
})
export class MyComponent {
  loadingConfig: LoadingConfig = {
    size: 'md',
    type: 'spinner',
    message: 'Loading employees...',
    overlay: false,
    centered: true,
    fullHeight: false,
  };
}
```

#### BaseErrorComponent

错误状态显示组件，支持多种错误类型和操作按钮。

```typescript
import { BaseErrorComponent, ErrorConfig } from '@shared/components/base';

@Component({
  template: `
    <app-base-error
      [message]="errorMessage"
      [config]="errorConfig"
      (retry)="onRetry()"
      (dismiss)="onDismiss()"
    >
    </app-base-error>
  `,
  imports: [BaseErrorComponent],
})
export class MyComponent {
  errorMessage = 'Failed to load data';

  errorConfig: ErrorConfig = {
    type: 'error',
    size: 'md',
    showIcon: true,
    showRetryButton: true,
    showDismissButton: false,
    retryButtonText: 'Retry',
    centered: true,
    fullWidth: false,
  };

  onRetry() {
    console.log('Retrying...');
  }

  onDismiss() {
    console.log('Dismissed');
  }
}
```

#### BaseEmptyComponent

空状态显示组件，提供友好的无数据提示。

```typescript
import { BaseEmptyComponent, EmptyConfig } from '@shared/components/base';

@Component({
  template: `
    <app-base-empty [config]="emptyConfig" (actionClick)="onAddNew()">
    </app-base-empty>
  `,
  imports: [BaseEmptyComponent],
})
export class MyComponent {
  emptyConfig: EmptyConfig = {
    type: 'data',
    size: 'md',
    showIcon: true,
    showActionButton: true,
    actionButtonText: 'Add First Employee',
    centered: true,
    fullHeight: false,
  };

  onAddNew() {
    console.log('Adding new item...');
  }
}
```

### 导航组件 (Navigation Components)

#### BaseTabsComponent

标签页导航组件，支持图标、徽章和多种样式。

```typescript
import { BaseTabsComponent, TabItem } from '@shared/components/base';

@Component({
  template: `
    <app-base-tabs
      [tabs]="tabs"
      [activeTabId]="activeTab"
      [config]="tabsConfig"
      (tabChange)="onTabChange($event)"
    >
    </app-base-tabs>
  `,
  imports: [BaseTabsComponent],
})
export class MyComponent {
  activeTab = 'list';

  tabs: TabItem[] = [
    { id: 'list', label: 'Employee List', icon: 'list' },
    { id: 'add', label: 'Add Employee', icon: 'person_add' },
    { id: 'reports', label: 'Reports', icon: 'assessment' },
    { id: 'settings', label: 'Settings', icon: 'settings' },
  ];

  tabsConfig = {
    size: 'md',
    variant: 'default',
    showIcons: true,
    showBadges: false,
    centered: false,
    fullWidth: false,
    scrollable: true,
  };

  onTabChange(tabId: string) {
    this.activeTab = tabId;
  }
}
```

#### BaseModalComponent

模态框组件，支持多种尺寸和配置。

```typescript
import { BaseModalComponent, ModalConfig } from '@shared/components/base';

@Component({
  template: `
    <app-base-modal
      [isOpen]="isModalOpen"
      title="Confirm Action"
      icon="warning"
      [config]="modalConfig"
      (close)="onModalClose()"
    >
      <p>Are you sure you want to delete this item?</p>

      <div slot="footer">
        <button (click)="onModalClose()">Cancel</button>
        <button (click)="confirmDelete()">Delete</button>
      </div>
    </app-base-modal>
  `,
  imports: [BaseModalComponent],
})
export class MyComponent {
  isModalOpen = false;

  modalConfig: ModalConfig = {
    size: 'medium',
    closable: true,
    backdrop: true,
    keyboard: true,
    centered: true,
  };

  onModalClose() {
    this.isModalOpen = false;
  }

  confirmDelete() {
    // Delete logic
    this.isModalOpen = false;
  }
}
```

#### BaseToastComponent

通知组件，支持多种类型和位置。

```typescript
import { BaseToastComponent, ToastConfig } from '@shared/components/base';

@Component({
  template: ` <app-base-toast [config]="toastConfig"></app-base-toast> `,
  imports: [BaseToastComponent],
})
export class MyComponent {
  toastConfig: ToastConfig = {
    position: 'top-right',
    duration: 5000,
    closable: true,
    pauseOnHover: true,
    showProgress: true,
  };

  showSuccess() {
    this.toast.success('Success!', 'Operation completed successfully');
  }

  showError() {
    this.toast.error('Error!', 'Something went wrong');
  }
}
```

## 🎨 主题定制

所有组件都使用 CSS 变量进行主题定制，确保与你的设计系统保持一致：

```scss
:root {
  // Primary colors
  --color-primary-500: #2196f3;
  --color-primary-600: #1e88e5;

  // Background colors
  --bg-surface: #ffffff;
  --bg-secondary: #f5f5f5;

  // Text colors
  --text-primary: #212121;
  --text-secondary: #757575;

  // Border colors
  --border-primary: #e0e0e0;
  --border-focus: #2196f3;

  // Shadows
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
}
```

## 📱 响应式设计

所有组件都内置了响应式设计，自动适配不同屏幕尺寸：

- **移动端** (< 768px): 优化触摸交互，调整间距和字体大小
- **平板端** (768px - 1024px): 平衡的布局和交互
- **桌面端** (> 1024px): 完整的功能和最佳的用户体验

## ♿ 无障碍支持

组件库遵循 WCAG 2.1 标准，提供完整的无障碍支持：

- 键盘导航
- 屏幕阅读器支持
- 高对比度模式
- 焦点管理
- ARIA 属性

## 🚀 性能优化

- 使用 OnPush 变更检测策略
- 懒加载和虚拟滚动支持
- 最小化重渲染
- 优化的动画性能

## 📚 更多示例

查看 `examples/` 目录获取更多使用示例和最佳实践。
