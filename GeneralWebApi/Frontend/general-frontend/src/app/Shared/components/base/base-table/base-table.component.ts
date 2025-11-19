// Path: GeneralWebApi/Frontend/general-frontend/src/app/shared/components/base/base-table/base-table.component.ts
import {
  Component,
  Input,
  Output,
  EventEmitter,
  TemplateRef,
  OnInit,
  OnChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseSearchComponent } from '../base-search/base-search.component';
import { BaseLoadingComponent } from '../base-loading/base-loading.component';
import { BaseEmptyComponent } from '../base-empty/base-empty.component';
import { BasePaginationComponent } from '../base-pagination/base-pagination.component';

export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  type?: 'text' | 'number' | 'date' | 'boolean' | 'custom';
  template?: TemplateRef<unknown>;
}

export interface TableAction {
  label: string;
  icon?: string;
  variant?:
    | 'primary'
    | 'secondary'
    | 'success'
    | 'warning'
    | 'danger'
    | 'outline'
    | 'ghost';
  disabled?: (item: unknown) => boolean;
  visible?: (item: unknown) => boolean;
  showLabel?: boolean; // Whether to show label text (default: false for icon-only buttons)
  onClick: (item: unknown) => void;
}

export interface TableConfig {
  showHeader?: boolean;
  showFooter?: boolean;
  showPagination?: boolean;
  showSearch?: boolean;
  showActions?: boolean;
  striped?: boolean;
  hoverable?: boolean;
  bordered?: boolean;
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  emptyMessage?: string;
}

@Component({
  selector: 'app-base-table',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    BaseSearchComponent,
    BaseLoadingComponent,
    BaseEmptyComponent,
    BasePaginationComponent,
  ],
  templateUrl: './base-table.component.html',
  styleUrls: ['./base-table.component.scss'],
})
export class BaseTableComponent implements OnInit, OnChanges {
  @Input() title = '';
  @Input() subtitle = '';
  @Input() data: unknown[] = [];
  @Input() columns: TableColumn[] = [];
  @Input() actions: TableAction[] = [];
  @Input() config: TableConfig = {
    showHeader: true,
    showFooter: true,
    showPagination: true,
    showSearch: true,
    showActions: true,
    striped: false,
    hoverable: true,
    bordered: false,
    size: 'medium',
    loading: false,
    emptyMessage: 'No data available',
  };
  @Input() pageSize = 10;
  @Input() customClass = '';

  @Output() rowClick = new EventEmitter<unknown>();
  @Output() sortChange = new EventEmitter<{
    column: string;
    direction: 'asc' | 'desc';
  }>();
  @Output() pageChange = new EventEmitter<number>();

  searchQuery = '';
  sortColumn = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  currentPage = 1;
  filteredData: unknown[] = [];
  paginatedData: unknown[] = [];

  // Configuration objects for child components
  searchConfig = {
    placeholder: 'Search table...',
    debounceTime: 300,
    minLength: 1,
    showClearButton: true,
    showSearchButton: false,
    disabled: false,
  };

  loadingConfig = {
    size: 'md' as const,
    type: 'spinner' as const,
    message: 'Loading...',
    overlay: false,
    centered: true,
    fullHeight: false,
  };

  emptyConfig = {
    type: 'data' as const,
    size: 'md' as const,
    showIcon: true,
    showActionButton: false,
    actionButtonText: 'Add New',
    centered: true,
    fullHeight: false,
  };

  paginationConfig = {
    showFirstLast: true,
    showPrevNext: true,
    showPageNumbers: true,
    maxVisiblePages: 5,
    showInfo: true,
    showPageSize: true,
    pageSizeOptions: [5, 10, 25, 50, 100],
    size: 'medium' as const,
  };

  get containerClass(): string {
    const classes = [
      'base-table-container',
      this.config.size !== 'medium' ? this.config.size : '',
      this.customClass,
    ].filter(Boolean);

    return classes.join(' ');
  }

  get wrapperClass(): string {
    const classes = [
      'table-wrapper',
      this.config.bordered ? 'bordered' : '',
      this.config.striped ? 'striped' : '',
      this.config.hoverable ? 'hoverable' : '',
    ].filter(Boolean);

    return classes.join(' ');
  }

  get tableClass(): string {
    const classes = [
      'base-table',
      this.config.size !== 'medium' ? this.config.size : '',
      this.config.striped ? 'striped' : '',
      this.config.hoverable ? 'hoverable' : '',
      this.config.bordered ? 'bordered' : '',
    ].filter(Boolean);

    return classes.join(' ');
  }

  get totalColumns(): number {
    return this.columns.length + (this.actions.length > 0 ? 1 : 0);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredData.length / this.pageSize);
  }

  get startIndex(): number {
    return (this.currentPage - 1) * this.pageSize;
  }

  get endIndex(): number {
    return Math.min(this.startIndex + this.pageSize, this.filteredData.length);
  }

  get visiblePages(): number[] {
    const pages: number[] = [];
    const maxVisible = 5;
    const start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
    const end = Math.min(this.totalPages, start + maxVisible - 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  }

  ngOnInit(): void {
    this.updateData();
  }

  ngOnChanges(): void {
    this.updateData();
  }

  onSearchChange(): void {
    this.currentPage = 1;
    this.updateData();
  }

  onSort(column: TableColumn): void {
    if (!column.sortable) return;

    if (this.sortColumn === column.key) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column.key;
      this.sortDirection = 'asc';
    }

    this.sortChange.emit({
      column: this.sortColumn,
      direction: this.sortDirection,
    });
    this.updateData();
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;

    this.currentPage = page;
    this.pageChange.emit(page);
    this.updateData();
  }

  getValue(item: unknown, key: string): unknown {
    return key
      .split('.')
      .reduce((obj: unknown, k) => (obj as Record<string, unknown>)?.[k], item);
  }

  formatDate(value: unknown): string {
    if (!value) return '';
    if (
      typeof value === 'string' ||
      typeof value === 'number' ||
      value instanceof Date
    ) {
      return new Date(value).toLocaleDateString();
    }
    return '';
  }

  formatNumber(value: unknown): string {
    if (value == null) return '';
    return Number(value).toLocaleString();
  }

  getSortIcon(columnKey: string): string {
    if (this.sortColumn !== columnKey) return 'unfold_more';
    return this.sortDirection === 'asc'
      ? 'keyboard_arrow_up'
      : 'keyboard_arrow_down';
  }

  getRowClass(item: unknown, index: number): string {
    const classes = [];
    if (this.config.striped && index % 2 === 1) classes.push('striped');
    return classes.join(' ');
  }

  getVisibleActions(item: unknown): TableAction[] {
    return this.actions.filter(action => action.visible?.(item) !== false);
  }

  getActionClass(action: TableAction): string {
    const classes = ['action-btn'];
    if (action.variant) classes.push(action.variant);
    // Add icon-only class if label is not shown
    if (!action.showLabel) classes.push('icon-only');
    return classes.join(' ');
  }

  getHeaderClass(column: TableColumn): string {
    const classes = ['table-header-cell'];
    if (column.sortable) {
      classes.push('sortable');
    }
    return classes.join(' ');
  }

  getCellClass(column: TableColumn): string {
    const classes = ['table-cell'];
    if (column.type) {
      classes.push(`type-${column.type}`);
    }
    return classes.join(' ');
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  trackByFn(index: number, _item: unknown): number {
    return index;
  }

  onRowClick(item: unknown): void {
    this.rowClick.emit(item);
  }

  get actionsWidth(): string {
    // Calculate width based on icon-only buttons (more compact)
    const iconButtonWidth = 40; // Width per icon button
    const padding = 16; // Cell padding
    return `${this.actions.length * iconButtonWidth + padding}px`;
  }

  private updateData(): void {
    // Filter data based on search query
    this.filteredData = this.data.filter(item => {
      if (!this.searchQuery) return true;

      return this.columns.some(column => {
        const value = this.getValue(item, column.key);
        return String(value)
          .toLowerCase()
          .includes(this.searchQuery.toLowerCase());
      });
    });

    // Sort data
    if (this.sortColumn) {
      this.filteredData.sort((a, b) => {
        const aValue = this.getValue(a, this.sortColumn);
        const bValue = this.getValue(b, this.sortColumn);

        // Convert to comparable values
        const aComparable = aValue == null ? '' : String(aValue);
        const bComparable = bValue == null ? '' : String(bValue);

        if (aComparable < bComparable)
          return this.sortDirection === 'asc' ? -1 : 1;
        if (aComparable > bComparable)
          return this.sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    // Paginate data
    const start = this.startIndex;
    const end = this.endIndex;
    this.paginatedData = this.filteredData.slice(start, end);
  }
}
