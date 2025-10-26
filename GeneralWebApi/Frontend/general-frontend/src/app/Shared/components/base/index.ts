// Path: GeneralWebApi/Frontend/general-frontend/src/app/shared/components/base/index.ts

// Layout Components
export { BasePageHeaderComponent } from './base-page-header/base-page-header.component';
export { BaseCardComponent } from './base-card/base-card.component';
export { BaseContainerComponent } from './base-container/base-container.component';
export { BaseGridComponent } from './base-grid/base-grid.component';

// Form Components
export { BaseButtonComponent } from './base-button/base-button.component';
export { BaseInputComponent } from './base-input/base-input.component';
export { BaseSelectComponent } from './base-select/base-select.component';
export { BaseCheckboxComponent } from './base-checkbox/base-checkbox.component';
export { BaseSearchComponent } from './base-search/base-search.component';

// Data Display Components
export { BaseTableComponent } from './base-table/base-table.component';
export { BasePaginationComponent } from './base-pagination/base-pagination.component';

// Feedback Components
export { BaseLoadingComponent } from './base-loading/base-loading.component';
export { BaseErrorComponent } from './base-error/base-error.component';
export { BaseEmptyComponent } from './base-empty/base-empty.component';
export { BaseModalComponent } from './base-modal/base-modal.component';
export { BaseToastComponent } from './base-toast/base-toast.component';
export { BaseNotificationComponent } from './base-notification/base-notification.component';

// Navigation Components
export { BaseTabsComponent } from './base-tabs/base-tabs.component';

// Type Exports
export type {
  TableColumn,
  TableAction,
  TableConfig,
} from './base-table/base-table.component';
export type { SelectOption } from './base-select/base-select.component';
export type {
  ToastConfig,
  ToastData,
  ToastAction,
} from './base-toast/base-toast.component';
export type { ModalConfig } from './base-modal/base-modal.component';
export type { ContainerConfig } from './base-container/base-container.component';
export type { GridConfig } from './base-grid/base-grid.component';
export type { SearchConfig } from './base-search/base-search.component';
export type { TabItem } from './base-tabs/base-tabs.component';
export type { CheckboxConfig } from './base-checkbox/base-checkbox.component';
export type {
  LoadingConfig,
  LoadingSize,
  LoadingType,
} from './base-loading/base-loading.component';
export type {
  ErrorConfig,
  ErrorType,
  ErrorSize,
} from './base-error/base-error.component';
export type {
  EmptyConfig,
  EmptySize,
  EmptyType,
} from './base-empty/base-empty.component';
export type {
  NotificationData,
  NotificationAction,
} from '../../services/notification.service';
