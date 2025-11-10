# Dialog Container 和 Base Confirm Dialog 运转流程详解 (Observable 模式)

## 📋 架构概览

```
┌─────────────────────────────────────────────────────────────┐
│                    调用层 (业务组件)                          │
│  EmployeeListComponent.onDeleteEmployee()                    │
│  └─> dialogService.confirmDelete()                         │
└────────────────────────┬────────────────────────────────────┘
                         │ Observable<boolean>
                         │
                         ↓
┌─────────────────────────────────────────────────────────────┐
│                    服务层 (DialogService)                    │
│  - 创建 DialogData (包含 result$ Subject)                  │
│  - 推送到 dialogsSubject                                     │
│  - 返回 Observable<boolean>                                │
└────────────────────────┬────────────────────────────────────┘
                         │ dialogs$ Observable
                         │
                         ↓
┌─────────────────────────────────────────────────────────────┐
│                  容器层 (DialogContainerComponent)           │
│  - 订阅 dialogs$                                            │
│  - 为每个 dialog 创建 BaseConfirmDialogComponent            │
│  - 处理用户交互事件                                          │
└────────────────────────┬────────────────────────────────────┘
                         │ [config] (Input)
                         │ (confirm/cancel) (Output)
                         ↓
┌─────────────────────────────────────────────────────────────┐
│                  展示层 (BaseConfirmDialogComponent)          │
│  - 显示对话框 UI                                             │
│  - 发出用户操作事件                                          │
└─────────────────────────────────────────────────────────────┘
```

## 🔄 完整流程详解

### 阶段 1: 调用 DialogService

**位置**: `employee-list.component.ts`

```typescript
// 用户点击删除按钮
onDeleteEmployee(employee: Employee) {
  const employeeName = `${employee.firstName} ${employee.lastName}`;

  // 步骤 1: 调用 DialogService.confirmDelete()，返回 Observable
  this.dialogService.confirmDelete(
    `Are you sure you want to delete ${employeeName}? This action cannot be undone.`
  )
    .pipe(
      take(1),                    // 只取第一个值
      takeUntil(this.destroy$),   // 组件销毁时自动取消订阅
      filter(confirmed => confirmed) // 只处理确认的情况
    )
    .subscribe(() => {
      // 步骤 6: Observable 发出 true，执行删除逻辑
      this.employeeFacade.deleteEmployee(employee.id);
    });
}
```

### 阶段 2: DialogService 处理

**位置**: `dialog.service.ts`

```typescript
confirmDelete(message?: string): Observable<boolean> {
  return this.confirm({
    title: 'Confirm Delete',
    message: message || '...',
    confirmText: 'Delete',
    cancelText: 'Cancel',
    confirmVariant: 'danger',
    icon: 'warning',
  });
}

confirm(config: ConfirmDialogConfig): Observable<boolean> {
  return new Observable<boolean>(subscriber => {
    // 步骤 2: 生成唯一 ID
    const id = this.generateId(); // "dialog-1"

    // 步骤 3: 创建 Subject 用于传递用户选择结果
    const resultSubject = new Subject<boolean>();

    // 步骤 4: 创建 DialogData，包含 result$ Subject
    const dialogData: DialogData = {
      ...config,                    // 配置信息
      id,                           // "dialog-1"
      result$: resultSubject,      // Subject<boolean> ⭐ 关键
      timestamp: Date.now(),
    };

    // 步骤 5: 推送到 BehaviorSubject
    const currentDialogs = this.dialogsSubject.value; // []
    this.dialogsSubject.next([...currentDialogs, dialogData]); // [{...}]

    // 步骤 6: 订阅 resultSubject，等待用户操作
    const resultSubscription = resultSubject
      .pipe(
        take(1),                    // 只取第一个值
        finalize(() => {
          // 对话框完成后自动清理
          this.removeDialog(id);
        })
      )
      .subscribe({
        next: (result) => {
          // 用户做出选择，将结果传递给外部订阅者
          subscriber.next(result);
          subscriber.complete();
        },
        error: (error) => {
          subscriber.error(error);
        }
      });

    // 步骤 7: 返回清理函数（如果 Observable 被取消订阅）
    return () => {
      resultSubscription.unsubscribe();
      // 如果对话框还存在，取消它
      const dialogs = this.dialogsSubject.value;
      const dialog = dialogs.find(d => d.id === id);
      if (dialog) {
        dialog.result$.next(false);
        dialog.result$.complete();
        this.removeDialog(id);
      }
    };
  });
}
```

**关键点**:

- `result$` Subject 被保存在 `dialogData` 中
- Observable 不会立即发出值，等待用户操作
- 使用 `finalize()` 确保对话框被清理

### 阶段 3: DialogContainerComponent 响应

**位置**: `dialog-container.component.ts` 和 `.html`

```typescript
// dialog-container.component.ts
ngOnInit(): void {
  // 步骤 8: 订阅 dialogs$ Observable
  this.subscription = this.dialogService.dialogs$.subscribe(
    dialogs => {
      // dialogs = [{ id: "dialog-1", message: "...", result$: Subject, ... }]
      this.dialogs = dialogs;
    }
  );
}
```

```html
<!-- dialog-container.component.html -->
<div class="dialog-container">
  <!-- 步骤 9: Angular 检测到 dialogs 数组变化，创建 BaseConfirmDialogComponent -->
  <app-base-confirm-dialog
    *ngFor="let dialog of dialogs; trackBy: trackByDialogId"
    [isOpen]="true"  <!-- 强制打开 -->
    [config]="{
      title: dialog.title,           <!-- "Confirm Delete" -->
      message: dialog.message,        <!-- "Are you sure..." -->
      confirmText: dialog.confirmText, <!-- "Delete" -->
      cancelText: dialog.cancelText,   <!-- "Cancel" -->
      confirmVariant: dialog.confirmVariant, <!-- "danger" -->
      cancelVariant: dialog.cancelVariant,   <!-- "outline" -->
      icon: dialog.icon,              <!-- "warning" -->
      showCancel: dialog.showCancel,
      size: dialog.size,
      closable: dialog.closable
    }"
    (confirm)="onConfirm(dialog)"      <!-- 用户点击确认 -->
    (cancelAction)="onCancel(dialog)" <!-- 用户点击取消 -->
    (dialogClose)="onClose(dialog)"    <!-- 用户关闭对话框 -->
  />
</div>
```

### 阶段 4: BaseConfirmDialogComponent 显示

**位置**: `base-confirm-dialog.component.ts` 和 `.html`

```typescript
// base-confirm-dialog.component.ts
export class BaseConfirmDialogComponent {
  @Input() isOpen = false; // 从容器传入 true
  @Input() config: ConfirmDialogConfig; // 从容器传入配置

  @Output() confirm = new EventEmitter<void>();
  @Output() cancelAction = new EventEmitter<void>();
  @Output() dialogClose = new EventEmitter<void>();

  // 用户点击确认按钮
  onConfirm(): void {
    this.confirm.emit(); // 发出 confirm 事件
    this.dialogClose.emit(); // 发出 dialogClose 事件
  }

  // 用户点击取消按钮
  onCancel(): void {
    this.cancelAction.emit(); // 发出 cancelAction 事件
    this.dialogClose.emit(); // 发出 dialogClose 事件
  }
}
```

```html
<!-- base-confirm-dialog.component.html -->
<app-base-modal [isOpen]="isOpen" ...>
  <div class="confirm-dialog-body">
    <div class="confirm-message">
      {{ config.message }}  <!-- 显示消息 -->
    </div>
  </div>

  <div slot="footer" class="confirm-dialog-footer">
    <!-- 取消按钮 -->
    <app-base-button
      *ngIf="config.showCancel !== false"
      [text]="config.cancelText || 'Cancel'"
      [variant]="cancelButtonVariant"
      (buttonClick)="onCancel()"  <!-- 点击 → onCancel() → cancelAction.emit() -->
    />

    <!-- 确认按钮 -->
    <app-base-button
      [text]="config.confirmText || 'Confirm'"
      [variant]="confirmButtonVariant"
      (buttonClick)="onConfirm()"  <!-- 点击 → onConfirm() → confirm.emit() -->
    />
  </div>
</app-base-modal>
```

### 阶段 5: 用户交互 → 事件处理

**用户点击 "Delete" 按钮**:

```
用户点击确认按钮
    ↓
BaseConfirmDialogComponent.onConfirm()
    ↓
this.confirm.emit() 发出事件
    ↓
DialogContainerComponent.onConfirm(dialog) 接收事件
    ↓
this.dialogService.resolveDialog(dialog.id, true)
    ↓
DialogService.resolveDialog()
    ↓
找到对应的 dialog，调用 dialog.result$.next(true)
    ↓
resultSubject 发出 true ⭐ Observable 发出值
    ↓
resultSubscription 收到值，调用 subscriber.next(true)
    ↓
外部 Observable 发出 true
    ↓
employee-list.component.ts 中的 subscribe 回调执行
    ↓
if (confirmed) { ... }  // confirmed = true
```

**用户点击 "Cancel" 按钮**:

```
用户点击取消按钮
    ↓
BaseConfirmDialogComponent.onCancel()
    ↓
this.cancelAction.emit() 发出事件
    ↓
DialogContainerComponent.onCancel(dialog) 接收事件
    ↓
this.dialogService.resolveDialog(dialog.id, false)
    ↓
DialogService.resolveDialog()
    ↓
找到对应的 dialog，调用 dialog.result$.next(false)
    ↓
resultSubject 发出 false ⭐ Observable 发出值
    ↓
resultSubscription 收到值，调用 subscriber.next(false)
    ↓
外部 Observable 发出 false
    ↓
employee-list.component.ts 中的 subscribe 回调执行
    ↓
filter(confirmed => confirmed) 过滤掉 false，不执行后续逻辑
```

### 阶段 6: DialogService.resolveDialog() 详解

```typescript
resolveDialog(id: string, result: boolean): void {
  // 步骤 1: 获取当前所有对话框
  const currentDialogs = this.dialogsSubject.value;
  // currentDialogs = [{ id: "dialog-1", result$: Subject, ... }]

  // 步骤 2: 找到对应的对话框
  const dialog = currentDialogs.find(d => d.id === id);
  // dialog = { id: "dialog-1", result$: Subject, ... }

  if (dialog) {
    // 步骤 3: 通过 Subject 发出结果 ⭐
    dialog.result$.next(result); // result = true 或 false

    // 步骤 4: 完成 Subject（Observable 会完成）
    dialog.result$.complete();

    // 步骤 5: finalize 操作符会自动调用 removeDialog(id)
    // 对话框从列表中移除
  }
}
```

## 📝 完整代码示例

### 示例 1: 删除员工（完整流程）

```typescript
// ========== 1. 业务组件调用 ==========
// employee-list.component.ts

export class EmployeeListComponent implements OnInit, OnDestroy {
  private dialogService = inject(DialogService);
  private destroy$ = new Subject<void>();

  onDeleteEmployee(employee: Employee) {
    const employeeName = `${employee.firstName} ${employee.lastName}`;

    // 调用服务，返回 Observable
    this.dialogService
      .confirmDelete(`Are you sure you want to delete ${employeeName}?`)
      .pipe(
        take(1), // 只取第一个值
        takeUntil(this.destroy$), // 自动取消订阅
        filter(confirmed => confirmed) // 只处理确认的情况
      )
      .subscribe(() => {
        // Observable 发出 true 后执行
        this.employeeFacade.deleteEmployee(employee.id);
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

```typescript
// ========== 2. DialogService 处理 ==========
// dialog.service.ts

confirmDelete(message?: string): Observable<boolean> {
  return this.confirm({
    title: 'Confirm Delete',
    message: message,
    confirmText: 'Delete',
    cancelText: 'Cancel',
    confirmVariant: 'danger',
    icon: 'warning',
  });
}

confirm(config: ConfirmDialogConfig): Observable<boolean> {
  return new Observable<boolean>(subscriber => {
    const id = this.generateId();
    const resultSubject = new Subject<boolean>();

    const dialogData: DialogData = {
      ...config,
      id,
      result$: resultSubject,  // ⭐ 保存 Subject
      timestamp: Date.now(),
    };

    // 推送到 Observable
    const currentDialogs = this.dialogsSubject.value;
    this.dialogsSubject.next([...currentDialogs, dialogData]);
    // dialogs$ 发出新值，DialogContainerComponent 会收到

    // 订阅 resultSubject，等待用户操作
    const resultSubscription = resultSubject
      .pipe(
        take(1),
        finalize(() => {
          // 自动清理对话框
          this.removeDialog(id);
        })
      )
      .subscribe({
        next: (result) => {
          subscriber.next(result);
          subscriber.complete();
        },
        error: (error) => {
          subscriber.error(error);
        }
      });

    // 清理函数
    return () => {
      resultSubscription.unsubscribe();
      const dialogs = this.dialogsSubject.value;
      const dialog = dialogs.find(d => d.id === id);
      if (dialog) {
        dialog.result$.next(false);
        dialog.result$.complete();
        this.removeDialog(id);
      }
    };
  });
}
```

```typescript
// ========== 3. DialogContainerComponent 订阅 ==========
// dialog-container.component.ts

ngOnInit(): void {
  // 订阅 dialogs$，当有新对话框时，dialogs 数组会更新
  this.subscription = this.dialogService.dialogs$.subscribe(
    dialogs => {
      this.dialogs = dialogs;
      // Angular 检测到变化，会重新渲染模板
      // *ngFor 会为每个 dialog 创建 BaseConfirmDialogComponent
    }
  );
}

onConfirm(dialog: DialogData): void {
  // 用户点击确认，调用服务解析 Observable
  this.dialogService.resolveDialog(dialog.id, true);
  // 这会调用 dialog.result$.next(true)，Observable 发出值
}

onCancel(dialog: DialogData): void {
  // 用户点击取消，调用服务解析 Observable
  this.dialogService.resolveDialog(dialog.id, false);
  // 这会调用 dialog.result$.next(false)，Observable 发出值
}
```

```html
<!-- ========== 4. DialogContainerComponent 模板 ========== -->
<!-- dialog-container.component.html -->

<div class="dialog-container">
  <!-- 为每个 dialog 创建一个 BaseConfirmDialogComponent -->
  <app-base-confirm-dialog
    *ngFor="let dialog of dialogs; trackBy: trackByDialogId"
    [isOpen]="true"
    [config]="{
      title: dialog.title,
      message: dialog.message,
      confirmText: dialog.confirmText,
      cancelText: dialog.cancelText,
      confirmVariant: dialog.confirmVariant,
      cancelVariant: dialog.cancelVariant,
      icon: dialog.icon,
      showCancel: dialog.showCancel,
      size: dialog.size,
      closable: dialog.closable
    }"
    (confirm)="onConfirm(dialog)"
    (cancelAction)="onCancel(dialog)"
    (dialogClose)="onClose(dialog)"
  />
</div>
```

```typescript
// ========== 5. BaseConfirmDialogComponent 显示 ==========
// base-confirm-dialog.component.ts

onConfirm(): void {
  this.confirm.emit();      // → DialogContainerComponent.onConfirm()
  this.dialogClose.emit();
}

onCancel(): void {
  this.cancelAction.emit(); // → DialogContainerComponent.onCancel()
  this.dialogClose.emit();
}
```

## 🎯 关键点总结

### 1. Observable 的 emit 时机

- Observable 在 `DialogService.confirm()` 中创建
- `result$` Subject 保存在 `DialogData` 中
- 用户操作后，`DialogService.resolveDialog()` 调用 `result$.next()`
- Observable 发出值，`subscribe` 回调执行

### 2. 数据流向

```
DialogService.confirm()
    ↓ 创建 DialogData (包含 result$ Subject)
    ↓ 推送到 dialogsSubject
    ↓ dialogs$ Observable 发出新值
DialogContainerComponent 订阅
    ↓ 更新 dialogs 数组
    ↓ Angular 检测变化
    ↓ *ngFor 创建 BaseConfirmDialogComponent
BaseConfirmDialogComponent 显示
    ↓ 用户交互
    ↓ 发出事件
DialogContainerComponent 处理事件
    ↓ 调用 DialogService.resolveDialog()
    ↓ 调用 dialog.result$.next()
    ↓ Observable 发出值
业务组件 subscribe 回调执行
```

### 3. 为什么需要 DialogContainerComponent？

- **解耦**: 业务组件不需要知道对话框如何渲染
- **统一管理**: 所有对话框在一个地方管理
- **Observable 支持**: 通过服务层实现 Observable 接口
- **全局可用**: 放在 app.component 中，任何地方都能使用

### 4. 为什么 BaseConfirmDialogComponent 不能直接使用 Observable？

- 组件是展示层，不应该处理 Observable
- 通过事件（@Output）与父组件通信
- DialogContainerComponent 负责连接服务和组件

### 5. Observable vs Promise 的优势

- **可取消**: 使用 `takeUntil()` 可以取消订阅
- **可组合**: 可以使用 RxJS 操作符（`filter`, `switchMap`, `mergeMap` 等）
- **更 Angular**: 完全符合 Angular 的响应式编程模式
- **内存管理**: 自动清理，防止内存泄漏

## 🔍 实际调用示例

### 示例 1: 简单删除确认

```typescript
// 在任意组件中
onDeleteItem() {
  this.dialogService.confirmDelete('确定删除吗？')
    .pipe(
      take(1),
      takeUntil(this.destroy$),
      filter(confirmed => confirmed)
    )
    .subscribe(() => {
      // 删除逻辑
    });
}
```

### 示例 2: 自定义确认对话框

```typescript
onCustomAction() {
  this.dialogService.confirm({
    title: '自定义标题',
    message: '这是自定义消息',
    confirmText: '确定',
    cancelText: '取消',
    confirmVariant: 'warning',
    icon: 'info',
  })
    .pipe(
      take(1),
      takeUntil(this.destroy$),
      filter(confirmed => confirmed)
    )
    .subscribe(() => {
      // 执行操作
    });
}
```

### 示例 3: 保存确认（与 RxJS 操作符组合）

```typescript
onSaveData() {
  this.dialogService.confirmSave('确定要保存更改吗？')
    .pipe(
      take(1),
      takeUntil(this.destroy$),
      filter(confirmed => confirmed),
      switchMap(() => this.dataService.save()) // 组合其他 Observable
    )
    .subscribe({
      next: (result) => {
        this.toastService.success('保存成功', '数据已保存');
      },
      error: (error) => {
        this.toastService.error('保存失败', error.message);
      }
    });
}
```

### 示例 4: 批量操作（使用 concatMap）

```typescript
onBulkDelete(selectedItems: Item[]) {
  this.dialogService.confirm({
    title: '批量删除',
    message: `确定要删除 ${selectedItems.length} 个项目吗？`,
    confirmText: '删除',
    cancelText: '取消',
  })
    .pipe(
      take(1),
      takeUntil(this.destroy$),
      filter(confirmed => confirmed),
      switchMap(() => from(selectedItems)),
      concatMap(item => this.dataService.delete(item.id)),
      finalize(() => {
        this.toastService.success('删除完成', '所有项目已删除');
      })
    )
    .subscribe();
}
```

## 🎨 视觉流程

```
┌─────────────────────────────────────────┐
│  用户点击删除按钮                         │
└──────────────┬──────────────────────────┘
               │
               ↓
┌─────────────────────────────────────────┐
│  dialogService.confirmDelete()           │
│  → 创建 Observable<boolean>             │
│  → 创建 DialogData { result$: Subject } │
│  → dialogsSubject.next([dialogData])    │
└──────────────┬──────────────────────────┘
               │
               ↓ (Observable 发出新值)
┌─────────────────────────────────────────┐
│  DialogContainerComponent               │
│  → dialogs$ 订阅收到新值                 │
│  → this.dialogs = [dialogData]          │
│  → *ngFor 创建 BaseConfirmDialog        │
└──────────────┬──────────────────────────┘
               │
               ↓ (组件渲染)
┌─────────────────────────────────────────┐
│  BaseConfirmDialogComponent             │
│  → 显示对话框 UI                         │
│  → 显示消息和按钮                        │
└──────────────┬──────────────────────────┘
               │
               ↓ (用户点击确认)
┌─────────────────────────────────────────┐
│  onConfirm() → confirm.emit()            │
│  → DialogContainer.onConfirm()          │
│  → dialogService.resolveDialog(id, true) │
│  → dialog.result$.next(true)            │
│  → Observable 发出 true                 │
└──────────────┬──────────────────────────┘
               │
               ↓ (Observable emit)
┌─────────────────────────────────────────┐
│  subscribe 回调执行                      │
│  if (confirmed) { ... }                 │
└─────────────────────────────────────────┘
```

## 💡 设计优势

1. **关注点分离**
   - DialogService: 状态管理和 Observable 创建
   - DialogContainer: 连接层
   - BaseConfirmDialog: UI 展示

2. **可复用性**
   - BaseConfirmDialog 可以独立使用
   - DialogService 可以在任何地方调用

3. **类型安全**
   - 完整的 TypeScript 类型支持
   - Observable<boolean> 明确返回值

4. **响应式**
   - 使用 RxJS Observable
   - 自动响应状态变化
   - 支持所有 RxJS 操作符

5. **内存管理**
   - 使用 `takeUntil()` 自动取消订阅
   - 使用 `finalize()` 确保清理
   - 防止内存泄漏

## 🔧 RxJS 操作符使用技巧

### 1. 基本用法

```typescript
this.dialogService.confirmDelete('...')
  .pipe(take(1))
  .subscribe(confirmed => { ... });
```

### 2. 只处理确认的情况

```typescript
this.dialogService.confirmDelete('...')
  .pipe(
    take(1),
    filter(confirmed => confirmed) // 只处理 true
  )
  .subscribe(() => { ... });
```

### 3. 组合其他 Observable

```typescript
this.dialogService
  .confirmSave('...')
  .pipe(
    take(1),
    filter(confirmed => confirmed),
    switchMap(() => this.saveData()) // 组合保存操作
  )
  .subscribe();
```

### 4. 错误处理

```typescript
this.dialogService.confirmDelete('...')
  .pipe(
    take(1),
    catchError(error => {
      this.toastService.error('错误', error.message);
      return of(false);
    })
  )
  .subscribe(confirmed => { ... });
```

### 5. 自动取消订阅

```typescript
export class MyComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  ngOnInit() {
    this.dialogService.confirmDelete('...')
      .pipe(
        take(1),
        takeUntil(this.destroy$) // 组件销毁时自动取消
      )
      .subscribe(confirmed => { ... });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

## 📚 总结

DialogService 现在完全基于 Observable/RxJS 模式，提供了：

- ✅ **更好的 Angular 集成** - 与 RxJS 生态系统无缝集成
- ✅ **更灵活的组合** - 支持所有 RxJS 操作符
- ✅ **更好的内存管理** - 自动清理和取消订阅
- ✅ **类型安全** - 完整的 TypeScript 支持
- ✅ **可取消** - 可以随时取消订阅

这是 Angular 现代应用的最佳实践！
