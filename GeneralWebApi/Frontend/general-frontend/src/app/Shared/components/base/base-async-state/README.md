# BaseAsyncStateComponent

A unified component for handling async data states (loading, error, empty) in a simplified way.

## 🎯 Purpose

Instead of importing and managing three separate components (`BaseLoadingComponent`, `BaseErrorComponent`, `BaseEmptyComponent`) in every feature component, you can now use a single `BaseAsyncStateComponent` that handles all three states automatically.

## ✨ Benefits

- **Reduced Imports**: Only import one component instead of three
- **Less Template Code**: Eliminates repetitive conditional logic
- **Consistent Behavior**: Unified state management across all features
- **Easy Configuration**: Simple props for customization

## 📖 Usage

### Basic Example with Observables

```typescript
import { BaseAsyncStateComponent } from '@shared/components/base';

@Component({
  template: `
    <app-base-async-state
      [loading$]="loading$"
      [error$]="error$"
      [data$]="employees$"
      loadingMessage="Loading employees..."
      emptyTitle="No employees found"
      [onRetry]="onRetryLoad"
      [onEmptyAction]="onEmptyActionClick"
    >
      <!-- Success content -->
      <div class="employee-grid">
        <app-employee-card
          *ngFor="let employee of employees$ | async"
          [employee]="employee"
        ></app-employee-card>
      </div>
    </app-base-async-state>
  `,
  imports: [BaseAsyncStateComponent],
})
export class EmployeeListComponent {
  loading$ = this.facade.loading$;
  error$ = this.facade.error$;
  employees$ = this.facade.employees$;

  onRetryLoad = () => {
    this.facade.loadEmployees();
  };

  onEmptyActionClick = () => {
    this.navigateToAdd();
  };
}
```

### With Direct Values

```typescript
@Component({
  template: `
    <app-base-async-state
      [loading]="isLoading"
      [error]="errorMessage"
      [data]="items"
      [isEmpty]="items.length === 0"
      [onRetry]="onRetry"
    >
      <div *ngFor="let item of items">
        {{ item.name }}
      </div>
    </app-base-async-state>
  `,
})
export class MyComponent {
  isLoading = false;
  errorMessage: string | null = null;
  items: Item[] = [];
}
```

### With Custom Configuration

```typescript
@Component({
  template: `
    <app-base-async-state
      [loading$]="loading$"
      [error$]="error$"
      [data$]="data$"
      [config]="stateConfig"
      loadingMessage="Fetching data..."
      emptyTitle="Nothing here"
      emptyDescription="Try refreshing the page"
    >
      <!-- Content -->
    </app-base-async-state>
  `,
})
export class MyComponent {
  stateConfig: AsyncStateConfig = {
    loading: {
      type: 'dots',
      size: 'lg',
    },
    error: {
      showRetryButton: true,
      retryButtonText: 'Try Again',
    },
    empty: {
      type: 'search',
      showActionButton: false,
    },
  };
}
```

## 📋 API

### Inputs

| Property | Type | Description |
|----------|------|-------------|
| `loading$` | `Observable<boolean>` | Observable for loading state |
| `error$` | `Observable<string \| null>` | Observable for error state |
| `data$` | `Observable<T[] \| null>` | Observable for data array |
| `loading` | `boolean` | Direct loading value (alternative to Observable) |
| `error` | `string \| null` | Direct error value (alternative to Observable) |
| `data` | `T[] \| null` | Direct data array (alternative to Observable) |
| `isEmpty` | `boolean` | Direct empty state flag |
| `config` | `AsyncStateConfig` | Configuration object for all states |
| `loadingMessage` | `string` | Custom loading message |
| `emptyTitle` | `string` | Custom empty state title |
| `emptyDescription` | `string` | Custom empty state description |
| `emptyActionText` | `string` | Custom empty action button text |
| `onRetry` | `() => void` | Retry callback function |
| `onEmptyAction` | `() => void` | Empty action callback function |

### Configuration Interface

```typescript
interface AsyncStateConfig {
  loading?: Partial<LoadingConfig>;
  error?: Partial<ErrorConfig>;
  empty?: Partial<EmptyConfig>;
}
```

## 🔄 Migration from Separate Components

### Before (Old Way)

```html
<!-- Multiple imports needed -->
<app-base-loading *ngIf="loading$ | async" [config]="loadingConfig"></app-base-loading>
<app-base-error *ngIf="error$ | async as error" [message]="error" [config]="errorConfig" (retry)="onRetry()"></app-base-error>
<app-base-empty *ngIf="(data$ | async)?.length === 0" [config]="emptyConfig"></app-base-empty>
<div *ngIf="(loading$ | async) === false && (error$ | async) === null && (data$ | async)?.length! > 0">
  <!-- Content -->
</div>
```

```typescript
import {
  BaseLoadingComponent,
  BaseErrorComponent,
  BaseEmptyComponent,
} from '@shared/components/base';
```

### After (New Way)

```html
<!-- Single component -->
<app-base-async-state
  [loading$]="loading$"
  [error$]="error$"
  [data$]="data$"
  [onRetry]="onRetry"
>
  <!-- Content -->
</app-base-async-state>
```

```typescript
import { BaseAsyncStateComponent } from '@shared/components/base';
```

## 🎨 Customization

All three underlying components (`BaseLoadingComponent`, `BaseErrorComponent`, `BaseEmptyComponent`) can still be customized through the `config` prop:

```typescript
const config: AsyncStateConfig = {
  loading: {
    type: 'spinner',
    size: 'md',
    message: 'Loading...',
  },
  error: {
    type: 'error',
    showRetryButton: true,
    retryButtonText: 'Retry',
  },
  empty: {
    type: 'data',
    showActionButton: true,
    actionButtonText: 'Add New',
  },
};
```

## 📝 Notes

- Use **Observable-based** approach when working with NgRx or RxJS streams
- Use **direct value** approach for simple local state management
- The component automatically handles state priority: loading → error → empty → success
- Content projection (`ng-content`) is only rendered when data is successfully loaded

