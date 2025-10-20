# Employee NgRx Store

Employee 模块的 NgRx 状态管理实现，提供完整的状态管理、副作用处理和组件集成。

## 📁 文件结构

```
src/app/store/employee/
├── employee.state.ts      # 状态接口和初始状态
├── employee.actions.ts    # Actions 定义
├── employee.reducer.ts    # Reducer 实现
├── employee.effects.ts    # Effects 处理副作用
├── employee.selectors.ts  # Selectors 数据选择
├── employee.facade.ts     # Facade 简化使用
├── index.ts              # 统一导出
└── README.md             # 使用文档
```

## 🚀 快速开始

### 1. 在组件中使用 Facade

```typescript
import { Component, inject } from '@angular/core';
import { EmployeeFacade } from '@store/employee/employee.facade';

@Component({
  template: `
    <div *ngIf="loading$ | async">Loading...</div>
    <div *ngIf="error$ | async as error" class="error">{{ error }}</div>

    <div *ngFor="let employee of employees$ | async">
      {{ employee.firstName }} {{ employee.lastName }}
    </div>
  `,
})
export class EmployeeListComponent {
  private employeeFacade = inject(EmployeeFacade);

  // 状态流
  employees$ = this.employeeFacade.filteredEmployees$;
  loading$ = this.employeeFacade.loading$;
  error$ = this.employeeFacade.error$;

  ngOnInit() {
    // 加载员工列表
    this.employeeFacade.loadEmployees();
  }

  onSearch(searchTerm: string) {
    // 设置搜索过滤器
    this.employeeFacade.setFilters({ searchTerm });
  }
}
```

### 2. 直接使用 Store 和 Selectors

```typescript
import { Component, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { selectAllEmployees, selectEmployeeLoading } from '@store/employee';

@Component({
  template: `...`,
})
export class EmployeeComponent {
  private store = inject(Store);

  employees$ = this.store.select(selectAllEmployees);
  loading$ = this.store.select(selectEmployeeLoading);
}
```

## 📋 可用的 Actions

### 加载操作

- `loadEmployees(params?)` - 加载员工列表
- `loadEmployee(id)` - 加载单个员工

### CRUD 操作

- `createEmployee(employee)` - 创建员工
- `updateEmployee(id, employee)` - 更新员工
- `deleteEmployee(id)` - 删除员工

### 选择操作

- `selectEmployee(employee)` - 选择员工
- `clearSelectedEmployee()` - 清除选择

### 过滤和分页

- `setFilters(filters)` - 设置过滤器
- `clearFilters()` - 清除过滤器
- `setPagination(pagination)` - 设置分页

### 状态管理

- `clearError()` - 清除错误
- `resetEmployeeState()` - 重置状态

## 🎯 可用的 Selectors

### 基础选择器

- `selectAllEmployees` - 所有员工
- `selectSelectedEmployee` - 选中的员工
- `selectEmployeeLoading` - 加载状态
- `selectEmployeeError` - 错误信息
- `selectEmployeePagination` - 分页信息
- `selectEmployeeFilters` - 过滤器信息

### 复合选择器

- `selectFilteredEmployees` - 过滤后的员工列表
- `selectEmployeeById(id)` - 根据ID选择员工
- `selectEmployeesByDepartment(department)` - 按部门选择员工
- `selectActiveEmployees` - 活跃员工
- `selectEmployeeStats` - 员工统计信息

## 🔄 状态结构

```typescript
interface EmployeeState {
  employees: Employee[]; // 员工列表
  selectedEmployee: Employee | null; // 选中的员工
  loading: boolean; // 加载状态
  error: string | null; // 错误信息
  pagination: {
    // 分页信息
    currentPage: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
  filters: {
    // 过滤器
    searchTerm: string;
    department: string;
    status: string;
    sortBy: string;
    sortDirection: 'asc' | 'desc';
  };
  operationInProgress: {
    // 操作状态
    loading: boolean;
    operation: 'create' | 'update' | 'delete' | null;
    employeeId: string | null;
  };
}
```

## 🎨 使用示例

### 搜索和过滤

```typescript
// 搜索员工
this.employeeFacade.setFilters({ searchTerm: 'john' });

// 按部门过滤
this.employeeFacade.setFilters({ department: 'Engineering' });

// 按状态过滤
this.employeeFacade.setFilters({ status: 'Active' });

// 排序
this.employeeFacade.setFilters({
  sortBy: 'firstName',
  sortDirection: 'asc',
});
```

### 分页

```typescript
// 跳转到第2页
this.employeeFacade.setPagination({ currentPage: 2 });

// 改变每页显示数量
this.employeeFacade.setPagination({ pageSize: 20, currentPage: 1 });
```

### CRUD 操作

```typescript
// 创建员工
const newEmployee = {
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  // ... 其他字段
};
this.employeeFacade.createEmployee(newEmployee);

// 更新员工
this.employeeFacade.updateEmployee('1', {
  firstName: 'Jane',
});

// 删除员工
this.employeeFacade.deleteEmployee('1');
```

### 监听操作状态

```typescript
// 监听创建操作
this.employeeFacade.isOperationInProgress('create').subscribe(isLoading => {
  if (isLoading) {
    console.log('Creating employee...');
  }
});

// 监听所有操作
this.employeeFacade.operationInProgress$.subscribe(operation => {
  console.log('Operation:', operation);
});
```

## 🔧 配置

确保在 `app.config.ts` 中正确配置了 Effects：

```typescript
import { EmployeeEffects } from './store/employee/employee.effects';

export const appConfig: ApplicationConfig = {
  providers: [
    // ... 其他配置
    provideEffects([EmployeeEffects]),
  ],
};
```

## 🎯 最佳实践

1. **使用 Facade** - 优先使用 Facade 而不是直接使用 Store
2. **组件解耦** - 组件只依赖 Facade，不直接依赖 Store
3. **选择器复用** - 创建可复用的选择器
4. **错误处理** - 始终处理错误状态
5. **内存管理** - 在组件销毁时取消订阅

## 🐛 故障排除

### 常见问题

1. **Effects 不工作** - 检查是否正确注册了 Effects
2. **状态不更新** - 检查 Reducer 是否正确处理 Action
3. **选择器返回空** - 检查状态结构是否正确
4. **内存泄漏** - 确保正确取消订阅

### 调试技巧

1. 使用 Redux DevTools 查看状态变化
2. 在 Effects 中添加 console.log 调试
3. 检查 Action 是否正确触发
4. 验证选择器逻辑

