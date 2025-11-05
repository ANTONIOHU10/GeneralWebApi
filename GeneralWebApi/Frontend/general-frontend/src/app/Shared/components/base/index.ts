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
export { BaseTextareaComponent } from './base-textarea/base-textarea.component';
export { BaseDatepickerComponent } from './base-datepicker/base-datepicker.component';
export { BaseFileUploadComponent } from './base-file-upload/base-file-upload.component';
export { BaseRadioComponent } from './base-radio/base-radio.component';
export { BaseSwitchComponent } from './base-switch/base-switch.component';

// Display Components
export { BaseBadgeComponent } from './base-badge/base-badge.component';
export { BaseTagComponent } from './base-tag/base-tag.component';
export { BaseAvatarComponent } from './base-avatar/base-avatar.component';
export { BaseListComponent } from './base-list/base-list.component';
export { BaseTimelineComponent } from './base-timeline/base-timeline.component';

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
export { BaseDrawerComponent } from './base-drawer/base-drawer.component';
export { BaseBreadcrumbComponent } from './base-breadcrumb/base-breadcrumb.component';

// Loading Components
export { BaseSkeletonComponent } from './base-skeleton/base-skeleton.component';

// Advanced Components
export { BaseDropdownComponent } from './base-dropdown/base-dropdown.component';
export { BasePopoverComponent } from './base-popover/base-popover.component';
export { BaseTooltipComponent } from './base-tooltip/base-tooltip.component';
export { BaseConfirmDialogComponent } from './base-confirm-dialog/base-confirm-dialog.component';

// Type Exports
export type {
  TableColumn,
  TableAction,
  TableConfig,
} from './base-table/base-table.component';
export type { SelectOption } from './base-select/base-select.component';
export type { RadioOption, RadioConfig } from './base-radio/base-radio.component';
export type { FileData } from './base-file-upload/base-file-upload.component';
export type { BadgeVariant, BadgeSize, BadgeShape } from './base-badge/base-badge.component';
export type { TagVariant, TagSize } from './base-tag/base-tag.component';
export type { AvatarSize, AvatarShape, AvatarStatus } from './base-avatar/base-avatar.component';
export type { ListItem, ListSize, ListLayout } from './base-list/base-list.component';
export type { TimelineItem, TimelineLayout, TimelineMode } from './base-timeline/base-timeline.component';
export type { DrawerConfig } from './base-drawer/base-drawer.component';
export type { BreadcrumbItem } from './base-breadcrumb/base-breadcrumb.component';
export type { SkeletonVariant } from './base-skeleton/base-skeleton.component';
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
export type {
  DropdownItem,
  DropdownPlacement,
  DropdownTrigger,
} from './base-dropdown/base-dropdown.component';
export type {
  PopoverPlacement,
  PopoverTrigger,
} from './base-popover/base-popover.component';
export type {
  TooltipPlacement,
  TooltipTrigger,
} from './base-tooltip/base-tooltip.component';
export type { ConfirmDialogConfig } from './base-confirm-dialog/base-confirm-dialog.component';
