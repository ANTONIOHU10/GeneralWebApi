# 完整数据流详解：从点击到返回处理

## 架构概览

```
┌─────────────────────────────────────────────────────────────┐
│ 层级 1: Component（组件层）                                  │
│  - 用户交互                                                  │
│  - 显示确认对话框                                            │
│  - 调用 Facade                                               │
└──────────────────┬──────────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────────────────┐
│ 层级 2: Facade（门面层/中转站）                              │
│  - 接收组件调用                                               │
│  - 分发 Action 到 Store                                      │
│  - 暴露 Observable 流                                        │
└──────────────────┬──────────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────────────────┐
│ 层级 3: Effect（副作用层）                                   │
│  - 监听 Action                                               │
│  - 调用 HTTP Service                                         │
│  - 分发 Success/Failure Action                              │
└──────────────────┬──────────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────────────────┐
│ 层级 4: Reducer（状态更新层）                                 │
│  - 处理 Action                                               │
│  - 更新 Store 状态                                           │
└──────────────────┬──────────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────────────────┐
│ 层级 5: Store（状态存储层）                                   │
│  - 保存应用状态                                              │
│  - 通知所有订阅者                                            │
└──────────────────┬──────────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────────────────┐
│ 层级 6: Selector（数据选择层）                                │
│  - 从 Store 中选择数据                                       │
│  - 返回 Observable                                          │
└──────────────────┬──────────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────────────────┐
│ 层级 7: OperationNotificationService（通知服务层）           │
│  - 监听 Store 状态变化                                        │
│  - 显示加载指示器                                            │
│  - 显示成功/错误通知（通过 NotificationService）             │
└─────────────────────────────────────────────────────────────┘
```

## 阶段 1：用户点击删除按钮

### 1.1 组件方法被调用

```typescript
// employee-list.component.ts (line 136)
onDeleteEmployee(employee: Employee) {
  const employeeName = `${employee.firstName} ${employee.lastName}`;
  
  // 显示确认对话框
  const confirm$: Observable<boolean> = this.dialogService.confirm({...});
  // ...
}
```

**说明：**
- 用户点击删除按钮
- Angular 调用 `onDeleteEmployee(employee)`
- 准备员工名称用于后续显示

### 1.2 显示确认对话框

```typescript
// employee-list.component.ts (line 140-147)
const confirm$: Observable<boolean> = this.dialogService.confirm({
  title: 'Confirm Delete',
  message: `Are you sure you want to delete ${employeeName}? This action cannot be undone.`,
  confirmText: 'Delete',
  cancelText: 'Cancel',
  confirmVariant: 'danger',
  icon: 'warning',
});
```

**Observable 说明：**
- `confirm$` 是 `Observable<boolean>`
- 用户点击"确认"时发出 `true`
- 用户点击"取消"时发出 `false`
- 冷 Observable，订阅后才执行

**DialogService 内部流程：**

```typescript
// dialog.service.ts (简化版)
confirm(config): Observable<boolean> {
  return new Observable<boolean>(subscriber => {
    const dialogData = { ...config, result$: new Subject<boolean>() };
    this.dialogsSubject.next([...currentDialogs, dialogData]);
    dialogData.result$.pipe(take(1)).subscribe(result => {
      subscriber.next(result);
      subscriber.complete();
    });
  });
}
```

### 1.3 处理用户确认

```typescript
// employee-list.component.ts (line 149-164)
confirm$.pipe(
  take(1),                    // 只取第一个值
  takeUntil(this.destroy$),   // 组件销毁时自动取消订阅
  filter((confirmed: boolean) => confirmed) // 只处理确认的情况
).subscribe(() => {
  this.operationNotification.trackOperation({
    type: 'delete',
    employeeName,
  });
  this.employeeFacade.deleteEmployee(employee.id);
});
```

**RxJS 操作符说明：**
- `take(1)`：只取第一个值
- `takeUntil(this.destroy$)`：组件销毁时自动取消订阅
- `filter(confirmed => confirmed)`：只处理确认的情况

**取消情况：**
- `filter` 会阻止值通过
- `subscribe` 回调不会执行

## 阶段 2：追踪操作（OperationNotificationService）

### 2.1 记录操作信息

```typescript
this.operationNotification.trackOperation({
  type: 'delete',
  employeeName,
});
```

**说明：**
- 记录操作类型和名称
- 用于后续显示成功通知
- 同步操作，不涉及 Observable

## 阶段 3：Facade 分发 Action

### 3.1 调用 Facade 方法

```typescript
this.employeeFacade.deleteEmployee(employee.id);
```

### 3.2 Facade 内部处理

```typescript
deleteEmployee(id: string) {
  this.store.dispatch(EmployeeActions.deleteEmployee({ id }));
}
```

**说明：**
- Facade 是组件与 Store 的接口
- `store.dispatch()` 将 Action 发送到 Store
- 同步操作，立即返回

**Action 对象结构：**

```typescript
{
  type: '[Employee] Delete Employee',
  id: 'employee-123'
}
```

## 阶段 4：Effect 监听并处理

### 4.1 Effect 监听 Action

```typescript
deleteEmployee$ = createEffect(() =>
  this.actions$.pipe(
    ofType(EmployeeActions.deleteEmployee),
    switchMap(action =>
      this.employeeService.deleteEmployee(action.id).pipe(
        map(() => EmployeeActions.deleteEmployeeSuccess({ id: action.id })),
        catchError(error =>
          of(EmployeeActions.deleteEmployeeFailure({
            error: error.message || 'Failed to delete employee',
          }))
        )
      )
    )
  )
);
```

**Observable 说明：**
- `this.actions$`：所有 Action 的 Observable
- `ofType`：过滤删除 Action
- `switchMap`：切换到 HTTP 请求流

### 4.2 调用 HTTP Service

```typescript
deleteEmployee(id: string): Observable<void> {
  return this.delete<void>(`${this.endpoint}/${id}`);
}
```

**HTTP 请求流程：**
```
Component → Facade → Effect → EmployeeService → BaseHttpService → HttpClient → 后端 API
```

### 4.3 Effect 处理响应

**成功：**
```typescript
map(() => EmployeeActions.deleteEmployeeSuccess({ id: action.id }))
```

**失败：**
```typescript
catchError(error =>
  of(EmployeeActions.deleteEmployeeFailure({
    error: error.message || 'Failed to delete employee',
  }))
)
```

## 阶段 5：Reducer 更新 Store

### 5.1 删除操作开始

```typescript
on(EmployeeActions.deleteEmployee, (state, { id }) => ({
  ...state,
  operationInProgress: { loading: true, operation: 'delete', employeeId: id },
  error: null,
})),
```

### 5.2 删除操作成功

```typescript
on(EmployeeActions.deleteEmployeeSuccess, (state, { id }) => ({
  ...state,
  employees: state.employees.filter(emp => emp.id !== id),
  selectedEmployee: state.selectedEmployee?.id === id ? null : state.selectedEmployee,
  operationInProgress: { loading: false, operation: null, employeeId: null },
  error: null,
})),
```

### 5.3 删除操作失败

```typescript
on(EmployeeActions.deleteEmployeeFailure, (state, { error }) => ({
  ...state,
  operationInProgress: { loading: false, operation: null, employeeId: null },
  error,
})),
```

## 阶段 6：Selector 选择数据

### 6.1 Selector 从 Store 选择

```typescript
export const selectOperationInProgress = createSelector(
  selectEmployeeState,
  (state: EmployeeState) => state.operationInProgress
);
```

### 6.2 Facade 暴露 Observable

```typescript
operationInProgress$ = this.store.select(EmployeeSelectors.selectOperationInProgress);
```

## 阶段 7：OperationNotificationService 监听状态

### 7.1 服务订阅 Observable

```typescript
config.operationInProgress$
  .pipe(takeUntil(config.destroy$))
  .subscribe(operationState => {
    this.handleOperationStateChange(operationState, config);
  });
```

### 7.2 处理状态变化

```typescript
private handleOperationStateChange(operationState: OperationState, config: OperationNotificationConfig): void {
  const wasLoading = this.previousOperation?.loading || false;
  const isLoading = operationState?.loading || false;
  const operation = operationState?.operation;
  
  if (!wasLoading && isLoading && autoShowLoading) {
    this.loadingService.show(this.getLoadingMessage(operation, config.loadingMessages));
  }
  
  if (wasLoading && !isLoading && this.previousOperation?.operation) {
    if (autoShowLoading) this.loadingService.hide();
    if (this.currentOperation.type && !this.hasError) {
      this.showSuccessNotification(config.successMessages);
      this.currentOperation = { type: null };
    }
  }
  
  this.previousOperation = operationState;
}
```

### 7.3 错误处理

```typescript
// operation-notification.service.ts (line 155-170)
config.error$
  .pipe(takeUntil(config.destroy$))
  .subscribe(error => {
    if (error !== null) {
      this.hasError = true;
      // Only show notification if it's a different error (prevent duplicates)
      if (this.lastErrorShown !== error) {
        this.lastErrorShown = error;
        this.notificationService.error('Operation Failed', error);
      }
    } else {
      // Error cleared - reset flag and last error
      this.hasError = false;
      this.lastErrorShown = null;
    }
  });
```

**关键点：**
- 使用 `NotificationService` 显示错误通知（不再是 ToastService）
- 通过 `lastErrorShown` 防止重复显示相同错误
- 错误清除时重置状态

### 7.4 成功通知

```typescript
// operation-notification.service.ts (line 257-291)
private showSuccessNotification(
  successMessages?: OperationNotificationConfig['successMessages']
): void {
  const { type, employeeName } = this.currentOperation;
  
  // ... 构建消息 ...
  
  this.notificationService.success(title, message);
}
```

**说明：**
- 使用 `NotificationService.success()` 显示成功通知
- 统一的通知系统，支持 success/error/warning/info 四种类型

## 阶段 8：自动刷新列表（Effect）

```typescript
reloadEmployeesAfterDelete$ = createEffect(() =>
  this.actions$.pipe(
    ofType(EmployeeActions.deleteEmployeeSuccess),
    switchMap(() => of(EmployeeActions.loadEmployees({})))
  )
);
```

**重新加载流程：**
```
deleteEmployeeSuccess → reloadEmployeesAfterDelete$ → dispatch(loadEmployees) 
→ loadEmployees$ → HTTP GET /employees → loadEmployeesSuccess 
→ Reducer 更新 employees → Selector → employees$ Observable → Component 模板更新
```

## 完整数据流时间线

- **T0**: 用户点击删除按钮
- **T1**: Component.onDeleteEmployee() 调用
- **T2**: DialogService.confirm() 显示对话框
- **T3**: 用户点击"确认"
- **T4**: confirm$ 发出 true
- **T5**: filter(confirmed => confirmed) 通过
- **T6**: OperationNotificationService.trackOperation() 记录
- **T7**: EmployeeFacade.deleteEmployee() 调用
- **T8**: Store.dispatch(deleteEmployee Action)
- **T9**: Reducer 更新 Store: operationInProgress.loading = true
- **T10**: Selector 重新计算 operationInProgress
- **T11**: operationInProgress$ Observable 发出 { loading: true, operation: 'delete', employeeId: '123' }
- **T12**: OperationNotificationService 收到状态变化，显示加载
- **T13**: Effect.deleteEmployee$ 监听 Action
- **T14**: EmployeeService.deleteEmployee() 调用 HTTP
- **T15**: HTTP DELETE /api/employees/123
- **T16**: 服务器处理请求
- **T17**: 返回响应
- **T18**: Effect 处理响应，dispatch Success/Failure
- **T19**: Reducer 更新 Store
- **T20**: Selector 发出新值，operationInProgress$ / error$
- **T21**: OperationNotificationService 收到状态变化，隐藏加载，显示通知（通过 NotificationService）
- **T22**: reloadEmployeesAfterDelete$ Effect 发出 loadEmployees Action
- **T23-T29**: HTTP GET /employees → 更新 employees → Observable 发出 → Component 模板更新

## Observable 详解

### confirm$ (DialogService)
- **来源**：DialogService.confirm()
- **类型**：冷 Observable
- **发出值**：true/false
- **生命周期**：对话框关闭后完成

### actions$ (NgRx Effects)
- **来源**：NgRx Actions
- **类型**：热 Observable
- **发出值**：所有 Action
- **生命周期**：应用运行期间持续

### operationInProgress$ (Facade)
- **来源**：store.select(selectOperationInProgress)
- **类型**：热 Observable
- **发出值**：Store 中 operationInProgress 变化
- **生命周期**：应用运行期间持续

### error$ (Facade)
- **来源**：store.select(selectEmployeeError)
- **类型**：热 Observable
- **发出值**：Store 中 error 字段变化
- **生命周期**：应用运行期间持续

### employees$ (Facade)
- **来源**：store.select(selectAllEmployees)
- **类型**：热 Observable
- **发出值**：Store 中 employees 数组变化
- **生命周期**：应用运行期间持续

## 关键理解点

### Observable 的订阅时机
- **组件初始化**：OperationNotificationService 订阅
- **用户操作**：confirm$ 在点击后订阅
- **持续监听**：Facade Observable 持续监听

### 数据流向
```
用户操作 → Action → Effect → HTTP → Success/Failure Action → Reducer → Store → Selector → Observable → 订阅者
```

### 状态同步
- Store 是单一数据源
- 状态变化通过 Reducer
- Selector 选择数据
- Observable 自动传播变化

### 响应式编程
- 不需手动刷新
- 状态变化自动传播
- 组件模板自动更新

### 通知系统统一化
- **NotificationService** 是唯一的通知服务
- 支持 success/error/warning/info 四种类型
- OperationNotificationService 通过 NotificationService 显示通知
- 不再使用 ToastService（已移除）

## 总结

1. **用户交互** → Component 处理
2. **确认对话框** → DialogService Observable
3. **分发 Action** → Facade → Store
4. **副作用处理** → Effect → HTTP Service
5. **状态更新** → Reducer → Store
6. **数据选择** → Selector → Observable
7. **状态监听** → OperationNotificationService
8. **通知显示** → NotificationService（统一的通知系统）
9. **UI 更新** → 自动响应式更新

所有操作通过 NgRx Store，数据流清晰、可预测、易维护。通知系统已统一为 NotificationService，提供一致的用户体验。

