# Services Architecture Guide

## Overview

This document explains the architecture and usage patterns of the core services in the application, focusing on the relationship between `DialogService`, `LoadingService`, `ActionService`, and `OperationNotificationService`.

## Service Hierarchy

```
┌─────────────────────────────────────────────────────────┐
│              Feature Components                          │
│  (employee-list.component.ts, etc.)                      │
└──────────────────┬────────────────────────────────────┘
                   │
       ┌───────────┴───────────┐
       │                       │
┌──────▼──────────┐   ┌────────▼──────────────┐
│  ActionService  │   │ OperationNotification │
│  (HTTP + UX)    │   │ Service (State Monitor)│
└──────┬──────────┘   └────────┬──────────────┘
       │                       │
       │              ┌────────┴────────┐
       │              │                 │
┌──────▼──────────┐   │   ┌─────────────▼──────────┐
│ DialogService   │   │   │  LoadingService        │
│ (Confirmations) │   │   │  (Loading State)       │
└─────────────────┘   │   └─────────────────────────┘
                      │
              ┌───────▼────────┐
              │  ToastService  │
              │  (Notifications)│
              └────────────────┘
```

## Service Responsibilities

### 1. DialogService
**Location**: `app/Shared/services/dialog.service.ts`

**Purpose**: Manages confirmation dialogs using RxJS Observables

**Key Features**:
- Observable-based API (not Promise-based)
- Automatic cleanup and memory management
- Type-safe configuration
- Quick methods: `confirmDelete()`, `confirmSave()`, `confirmDiscard()`

**When to Use**:
- Standalone confirmation dialogs in components
- Custom confirmation flows
- Used automatically by `ActionService`

**Example**:
```typescript
this.dialogService.confirmDelete('Are you sure?')
  .pipe(take(1))
  .subscribe(confirmed => {
    if (confirmed) {
      // Delete logic
    }
  });
```

---

### 2. LoadingService
**Location**: `app/Shared/services/loading.service.ts`

**Purpose**: Manages global loading state with stack-based approach

**Key Features**:
- Stack-based loading (supports multiple concurrent operations)
- Reactive Observable streams
- Three usage patterns:
  1. Manual: `show()` / `hide()`
  2. Observable wrapper: `executeWithLoadingObservable()`
  3. Promise wrapper: `executeWithLoadingFromPromise()`

**When to Use**:
- **Manual control**: When you need conditional loading (e.g., after confirmation dialog)
  - Used by `ActionService` and `OperationNotificationService`
- **Observable wrapper**: For simple HTTP calls without confirmation
- **Promise wrapper**: For Promise-based operations

**Example**:
```typescript
// Manual control (used by ActionService)
const loadingId = this.loadingService.show('Loading...');
action$.pipe(
  finalize(() => this.loadingService.hide(loadingId))
).subscribe();

// Observable wrapper (simple cases)
this.loadingService.executeWithLoadingObservable(
  () => this.http.get('/api/data'),
  'Loading data...'
).subscribe(data => { /* ... */ });
```

---

### 3. ActionService
**Location**: `app/core/services/action.service.ts`

**Purpose**: Unified HTTP action execution with automatic UX handling

**Key Features**:
- Automatic confirmation dialogs (via DialogService)
- Automatic loading indicators (via LoadingService)
- Automatic success/error notifications (via ToastService)
- Type-safe API calls
- Used by domain services (e.g., EmployeeService)

**When to Use**:
- **Direct HTTP operations** that need confirmation + loading + notifications
- **Service layer convenience methods** (e.g., `deleteEmployeeWithConfirm()`)
- Best for: CRUD operations with user confirmation

**Example**:
```typescript
// In EmployeeService
deleteEmployeeWithConfirm(employee: Employee) {
  return this.actionService.execute({
    method: 'DELETE',
    endpoint: `${this.endpoint}/${employee.id}`,
    confirm: {
      message: `Delete ${employee.name}?`,
      title: 'Confirm Delete'
    },
    showSuccessToast: 'Employee deleted successfully',
    onSuccess: () => this.refreshList()
  });
}
```

**Relationship with OperationNotificationService**:
- If using both, set `autoShowLoading: false` in OperationNotificationService
- ActionService handles loading, OperationNotificationService handles state monitoring

---

### 4. OperationNotificationService
**Location**: `app/Shared/services/operation-notification.service.ts`

**Purpose**: Monitors operation state streams and shows notifications

**Key Features**:
- Monitors Observable streams (e.g., NgRx facades)
- Optional automatic loading management
- Automatic success/error notifications
- Tracks operation state

**When to Use**:
- **NgRx-based operations**: When using facades with `operationInProgress$` streams
- **State-based monitoring**: When operations are managed by state management
- Set `autoShowLoading: false` if using with `ActionService`

**Example**:
```typescript
// In component with NgRx facade
ngOnInit() {
  this.operationNotification.setup({
    error$: this.facade.error$,
    operationInProgress$: this.facade.operationInProgress$,
    destroy$: this.destroy$,
    autoShowLoading: true // Show loading automatically
  });
}

onDelete(employee: Employee) {
  this.operationNotification.trackOperation({
    type: 'delete',
    employeeName: `${employee.firstName} ${employee.lastName}`
  });
  this.facade.deleteEmployee(employee.id); // NgRx action
}
```

**When using with ActionService**:
```typescript
ngOnInit() {
  this.operationNotification.setup({
    error$: this.facade.error$,
    operationInProgress$: this.facade.operationInProgress$,
    destroy$: this.destroy$,
    autoShowLoading: false // ActionService handles loading
  });
}
```

---

## Usage Patterns

### Pattern 1: ActionService Only (Recommended for HTTP operations)
```typescript
// In service layer
deleteEmployeeWithConfirm(employee: Employee) {
  return this.actionService.execute({
    method: 'DELETE',
    endpoint: `${this.endpoint}/${employee.id}`,
    confirm: { message: `Delete ${employee.name}?` },
    showSuccessToast: 'Deleted successfully'
  });
}

// In component
this.employeeService.deleteEmployeeWithConfirm(employee)
  .pipe(take(1))
  .subscribe();
```

### Pattern 2: OperationNotificationService Only (For NgRx)
```typescript
// In component
ngOnInit() {
  this.operationNotification.setup({
    error$: this.facade.error$,
    operationInProgress$: this.facade.operationInProgress$,
    destroy$: this.destroy$
  });
}

onDelete(employee: Employee) {
  this.operationNotification.trackOperation({
    type: 'delete',
    employeeName: employee.name
  });
  this.facade.deleteEmployee(employee.id);
}
```

### Pattern 3: Both Services (ActionService + OperationNotificationService)
```typescript
// In component
ngOnInit() {
  this.operationNotification.setup({
    error$: this.facade.error$,
    operationInProgress$: this.facade.operationInProgress$,
    destroy$: this.destroy$,
    autoShowLoading: false // ActionService handles loading
  });
}

onDelete(employee: Employee) {
  this.operationNotification.trackOperation({
    type: 'delete',
    employeeName: employee.name
  });
  // ActionService handles dialog, loading, and HTTP
  this.employeeService.deleteEmployeeWithConfirm(employee)
    .pipe(take(1))
    .subscribe();
}
```

---

## Folder Structure Analysis

### Current Structure
```
app/
├── core/
│   └── services/
│       ├── action.service.ts          ✅ Correct (business operation service)
│       ├── employee.service.ts         ✅ Correct (domain service)
│       └── base-http.service.ts        ✅ Correct (base HTTP service)
│
└── Shared/
    └── services/
        ├── dialog.service.ts           ✅ Correct (UI service)
        ├── loading.service.ts          ✅ Correct (UI service)
        ├── operation-notification.service.ts  ✅ Correct (UI service)
        └── toast.service.ts            ✅ Correct (UI service)
```

### Rationale
- **`core/services/`**: Business logic and domain services
  - `ActionService`: Business operation orchestration
  - `EmployeeService`: Domain-specific business logic
  - `BaseHttpService`: Core HTTP infrastructure

- **`Shared/services/`**: UI-related shared services
  - `DialogService`: UI component (dialog)
  - `LoadingService`: UI state (loading indicator)
  - `OperationNotificationService`: UI state monitoring
  - `ToastService`: UI component (toast notification)

### Recommendation
✅ **Current structure is well-organized and follows Angular best practices:**
- Clear separation between business logic (`core`) and UI services (`Shared`)
- `ActionService` in `core` is appropriate as it orchestrates business operations
- UI services in `Shared` are correctly placed

---

## Best Practices

1. **Use ActionService for HTTP operations** that need confirmation + loading + notifications
2. **Use OperationNotificationService for NgRx-based operations** that need state monitoring
3. **Set `autoShowLoading: false`** when using both services together
4. **Use LoadingService directly** only for custom loading scenarios
5. **Use DialogService directly** only for custom confirmation flows
6. **Keep business logic in `core/services/`** and UI services in `Shared/services/`

---

## Summary

| Service | Location | Purpose | When to Use |
|---------|----------|---------|-------------|
| DialogService | Shared/services | Confirmation dialogs | Standalone confirmations or via ActionService |
| LoadingService | Shared/services | Loading state | Manual control or automatic wrapping |
| ActionService | core/services | HTTP + UX orchestration | HTTP operations with confirmation |
| OperationNotificationService | Shared/services | State monitoring + notifications | NgRx-based operations |

