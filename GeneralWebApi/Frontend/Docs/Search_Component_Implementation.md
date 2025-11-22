# 搜索组件实现详解

## 📋 目录
1. [组件架构](#组件架构)
2. [数据流](#数据流)
3. [搜索流程详解](#搜索流程详解)
4. [关键方法说明](#关键方法说明)
5. [后端交互](#后端交互)
6. [状态管理](#状态管理)

---

## 🏗️ 组件架构

### 1. 组件结构

```
SearchDepartmentComponent
├── 依赖注入 (Dependency Injection)
│   ├── DepartmentFacade (NgRx Store)
│   ├── DepartmentService (HTTP 服务)
│   ├── NotificationService (通知服务)
│   └── DialogService (对话框服务)
├── 状态管理 (State Management)
│   ├── Signals (Angular Signals)
│   └── Observables (RxJS)
└── UI 组件
    ├── BaseFormComponent (搜索表单)
    ├── BaseTableComponent (结果表格)
    └── BaseAsyncStateComponent (异步状态)
```

### 2. 核心依赖

```typescript
// 1. NgRx Facade - 用于获取下拉选项数据（如父部门列表）
private departmentFacade = inject(DepartmentFacade);

// 2. HTTP Service - 直接调用后端搜索 API
private departmentService = inject(DepartmentService);

// 3. 通知服务 - 显示成功/错误消息
private notificationService = inject(NotificationService);

// 4. 对话框服务 - 删除确认对话框
private dialogService = inject(DialogService);
```

---

## 🔄 数据流

### 完整数据流图

```
用户操作
  ↓
[1] 用户填写搜索表单
  ↓
[2] 点击"Search"按钮
  ↓
[3] onSearchFormSubmit()
  ↓
[4] searchDepartmentsWithBackend()
  ↓
[5] DepartmentService.searchDepartmentsWithFilters()
  ↓
[6] HTTP GET /api/departments/search?name=...&code=...
  ↓
[7] 后端处理 (DepartmentsController → SearchDepartmentsQuery → Repository)
  ↓
[8] 返回 Department[] 数组
  ↓
[9] 更新组件状态
  ├── allDepartments.set(departments)
  ├── departmentsData$.next(departments)
  └── loading.set(false)
  ↓
[10] UI 自动更新 (Angular Change Detection)
  ├── 表格显示结果
  └── 显示通知消息
```

---

## 🔍 搜索流程详解

### 步骤 1: 组件初始化 (`ngOnInit`)

```typescript
ngOnInit(): void {
  // 1.1 检查 Store 中是否有部门数据（用于下拉选项）
  this.departments$.pipe(
    startWith([]),
    filter(depts => depts.length === 0),  // 如果没有数据
    first()  // 只执行一次
  ).subscribe(() => {
    // 1.2 从 Store 加载部门列表（用于父部门下拉选项）
    this.departmentFacade.loadDepartments();
  });

  // 1.3 订阅部门数据变化，更新表单下拉选项
  this.updateFormOptions();
}
```

**作用：**
- 确保下拉选项有数据可用
- 设置表单选项的自动更新

---

### 步骤 2: 用户提交搜索表单

```typescript
onSearchFormSubmit(data: Record<string, unknown>): void {
  // 2.1 更新搜索过滤器 Signal
  this.searchFilters.set({
    name: data['name'] || '',
    code: data['code'] || '',
    description: data['description'] || '',
    parentDepartmentId: data['parentDepartmentId'] ?? null,
    level: data['level'] ?? null,
  });

  // 2.2 调用后端搜索方法
  this.searchDepartmentsWithBackend(this.searchFilters());
}
```

**数据转换：**
- 表单数据 → 搜索过滤器对象
- 空字符串转换为空字符串（后端会忽略）
- null 值保持不变

---

### 步骤 3: 执行后端搜索 (`searchDepartmentsWithBackend`)

```typescript
private searchDepartmentsWithBackend(filters: Record<string, unknown>): void {
  // 3.1 设置加载状态
  this.loading.set(true);           // Signal 状态
  this.loading$.next(true);         // Observable 状态（用于 BaseAsyncStateComponent）

  // 3.2 转换过滤器为搜索参数
  const searchParams = {
    name: filters['name'] as string || '',
    code: filters['code'] as string || '',
    description: filters['description'] as string || '',
    parentDepartmentId: filters['parentDepartmentId'] !== null && filters['parentDepartmentId'] !== undefined
      ? (typeof filters['parentDepartmentId'] === 'number' 
          ? filters['parentDepartmentId'] 
          : parseInt(filters['parentDepartmentId'] as string))
      : null,
    level: filters['level'] !== null && filters['level'] !== undefined
      ? (typeof filters['level'] === 'number' 
          ? filters['level'] 
          : parseInt(filters['level'] as string))
      : null,
  };

  // 3.3 调用 HTTP 服务
  this.departmentService.searchDepartmentsWithFilters(searchParams).pipe(
    first(),  // 只取第一个值（HTTP 请求只发出一次就完成）
    catchError(err => {
      // 错误处理...
    })
  ).subscribe({
    next: (departments: Department[]) => {
      // 成功处理...
    }
  });
}
```

**关键点：**
- 双重 loading 状态：Signal + Observable
- 类型转换：确保数字类型正确
- 使用 `first()` 确保只处理一次响应

---

### 步骤 4: HTTP 服务层 (`DepartmentService`)

```typescript
searchDepartmentsWithFilters(searchParams: {
  name?: string;
  code?: string;
  description?: string;
  parentDepartmentId?: number | null;
  level?: number | null;
}): Observable<Department[]> {
  // 4.1 构建查询参数（只包含非空值）
  const params: Record<string, string> = {};

  if (searchParams.name && searchParams.name.trim()) {
    params['name'] = searchParams.name.trim();
  }
  // ... 其他参数类似处理

  // 4.2 发送 HTTP GET 请求
  return this.get<BackendDepartment[]>(`${this.endpoint}/search`, params).pipe(
    // 4.3 转换后端数据格式为前端模型
    map(backendDepartments =>
      backendDepartments.map(item => this.transformBackendDepartment(item))
    )
  );
}
```

**URL 示例：**
```
GET /api/departments/search?name=IT&code=IT001&level=1
```

---

### 步骤 5: 后端处理流程

```
[Controller] DepartmentsController.SearchDepartments()
  ↓
[Query] SearchDepartmentsQuery
  ↓
[Handler] SearchDepartmentsQueryHandler
  ↓
[Repository] DepartmentRepository.GetPagedAsync()
  ↓
[Database] Entity Framework Core 查询
  ↓
[Response] List<DepartmentDto>
```

**后端代码路径：**
1. `DepartmentsController.cs` - `[HttpGet("search")]` 端点
2. `SearchDepartmentsQuery.cs` - MediatR Query
3. `SearchDepartmentsQueryHandler.cs` - 查询处理器
4. `DepartmentRepository.cs` - 数据访问层

---

### 步骤 6: 处理搜索结果

```typescript
.subscribe({
  next: (departments: Department[]) => {
    // 6.1 更新组件状态
    this.allDepartments.set(departments);              // Signal
    this.departmentsData$.next(departments);          // Observable

    // 6.2 清除加载状态
    this.loading.set(false);
    this.loading$.next(false);

    // 6.3 显示成功通知
    if (departments.length > 0) {
      this.notificationService.info(
        'Search Completed',
        `Found ${departments.length} department(s) matching your criteria`,
        { duration: 3000, autoClose: true }
      );
    }
  }
});
```

**状态更新：**
- `allDepartments` Signal → 触发 UI 更新
- `departmentsData$` Observable → BaseAsyncStateComponent 使用
- 双重状态确保所有 UI 组件都能响应

---

## 🛠️ 关键方法说明

### 1. `onSearchFormSubmit()` - 表单提交处理

**触发时机：** 用户点击"Search Departments"按钮

**职责：**
- 收集表单数据
- 更新搜索过滤器
- 触发搜索

**代码：**
```typescript
onSearchFormSubmit(data: Record<string, unknown>): void {
  this.searchFilters.set({ /* 更新过滤器 */ });
  this.searchDepartmentsWithBackend(this.searchFilters());
}
```

---

### 2. `searchDepartmentsWithBackend()` - 核心搜索方法

**职责：**
- 管理加载状态
- 转换数据格式
- 调用 HTTP 服务
- 处理成功/错误响应

**关键特性：**
- 使用 `first()` 确保只处理一次响应
- 使用 `catchError` 统一错误处理
- 双重 loading 状态管理

---

### 3. `onFieldDropdownOpen()` - 下拉选项加载

**触发时机：** 用户点击下拉框（如父部门选择）

**职责：**
- 按需加载下拉选项数据
- 显示字段级别的 loading 状态

**代码：**
```typescript
onFieldDropdownOpen(key: string): void {
  if (key === 'parentDepartmentId') {
    this.loadParentDepartmentOptionsIfNeeded();
  }
}
```

**优化：** 延迟加载，只在需要时加载数据

---

### 4. `reloadSearchAfterOperation()` - 操作后重载

**使用场景：** 删除或更新部门后重新搜索

**职责：**
- 等待操作完成（避免双重 loading）
- 使用当前过滤器重新搜索

**代码：**
```typescript
private reloadSearchAfterOperation(): void {
  this.departmentFacade.operationInProgress$.pipe(
    filter(op => !op.loading && op.operation === null),  // 等待操作完成
    take(1),
    delay(100)  // 确保状态完全更新
  ).subscribe(() => {
    this.searchDepartmentsWithBackend(this.searchFilters());
  });
}
```

**为什么需要：**
- 删除/更新操作会触发全局 loading（通过 NgRx）
- 搜索操作会触发组件 loading
- 等待操作完成可以避免同时显示两个 loading

---

## 🔌 后端交互

### API 端点

```
GET /api/departments/search
```

### 查询参数

| 参数 | 类型 | 说明 | 示例 |
|------|------|------|------|
| `name` | string | 部门名称（模糊匹配） | `IT` |
| `code` | string | 部门代码（模糊匹配） | `IT001` |
| `description` | string | 描述（模糊匹配） | `Information Technology` |
| `parentDepartmentId` | number | 父部门 ID | `5` |
| `level` | number | 部门层级 | `1` |

### 请求示例

```http
GET /api/departments/search?name=IT&level=1 HTTP/1.1
Host: localhost:5000
Authorization: Bearer <token>
```

### 响应格式

```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "name": "IT Department",
      "code": "IT001",
      "description": "Information Technology",
      "parentDepartmentId": null,
      "level": 1,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "message": "Departments retrieved successfully"
}
```

---

## 📊 状态管理

### Signals (Angular Signals)

```typescript
// 搜索结果数据
allDepartments = signal<Department[]>([]);

// 加载状态
loading = signal(false);

// 搜索过滤器
searchFilters = signal<Record<string, unknown>>({...});

// 字段加载状态
fieldLoading = signal<Record<string, boolean>>({...});
```

**特点：**
- 响应式更新
- 自动触发 UI 更新
- 类型安全

### Observables (RxJS)

```typescript
// 用于 BaseAsyncStateComponent
loading$ = new BehaviorSubject<boolean>(false);
departmentsData$ = new BehaviorSubject<Department[] | null>(null);

// 从 NgRx Store 获取下拉选项数据
departments$ = this.departmentFacade.departments$;
```

**为什么需要双重状态？**
- Signals：用于模板绑定，自动更新
- Observables：用于需要 Observable 的组件（如 BaseAsyncStateComponent）

---

## 🎯 设计模式

### 1. **服务层模式**
- `DepartmentService` 负责所有 HTTP 通信
- 组件不直接调用 HTTP，通过服务层

### 2. **Facade 模式**
- `DepartmentFacade` 封装 NgRx Store 复杂性
- 组件通过 Facade 访问 Store 数据

### 3. **观察者模式**
- 使用 RxJS Observables 处理异步操作
- 使用 Angular Signals 处理响应式状态

### 4. **策略模式**
- 不同的搜索字段使用不同的过滤策略
- 后端统一处理所有过滤逻辑

---

## 🔄 完整调用链示例

### 场景：用户搜索名称为 "IT" 的部门

```
1. 用户在表单输入 "IT"
   ↓
2. 点击 "Search Departments" 按钮
   ↓
3. BaseFormComponent 触发 (formSubmit) 事件
   ↓
4. onSearchFormSubmit({ name: "IT" })
   ├── 更新 searchFilters Signal
   └── 调用 searchDepartmentsWithBackend()
   ↓
5. searchDepartmentsWithBackend()
   ├── 设置 loading = true
   ├── 转换参数: { name: "IT", code: "", ... }
   └── 调用 departmentService.searchDepartmentsWithFilters()
   ↓
6. DepartmentService.searchDepartmentsWithFilters()
   ├── 构建查询参数: { name: "IT" }
   └── HTTP GET /api/departments/search?name=IT
   ↓
7. 后端处理
   ├── DepartmentsController.SearchDepartments()
   ├── SearchDepartmentsQueryHandler
   ├── DepartmentRepository.GetPagedAsync()
   └── 返回 List<DepartmentDto>
   ↓
8. 前端接收响应
   ├── 转换数据格式
   └── 触发 subscribe next
   ↓
9. 更新状态
   ├── allDepartments.set([...])
   ├── departmentsData$.next([...])
   ├── loading.set(false)
   └── 显示通知
   ↓
10. UI 自动更新
    ├── 表格显示结果
    └── 隐藏 loading 指示器
```

---

## 💡 关键优化点

### 1. **避免双重 Loading**
- 删除/更新操作后等待操作完成再搜索
- 使用 `reloadSearchAfterOperation()` 方法

### 2. **按需加载下拉选项**
- 只在用户点击下拉框时加载数据
- 使用 `onFieldDropdownOpen()` 方法

### 3. **统一错误处理**
- 所有错误通过 `NotificationService` 显示
- 不在组件中显示错误状态

### 4. **类型安全**
- 使用 TypeScript 严格类型
- 转换数据时进行类型检查

---

## 📝 总结

搜索组件采用了以下设计原则：

1. **关注点分离**：UI、业务逻辑、数据访问分离
2. **响应式编程**：使用 Signals 和 Observables
3. **错误处理**：统一的错误处理机制
4. **用户体验**：加载状态、通知消息、确认对话框
5. **性能优化**：按需加载、避免重复请求

这种实现方式确保了代码的可维护性、可扩展性和良好的用户体验。


