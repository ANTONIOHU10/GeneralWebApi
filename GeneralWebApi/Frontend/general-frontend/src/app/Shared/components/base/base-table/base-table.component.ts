// Path: GeneralWebApi/Frontend/general-frontend/src/app/shared/components/base/base-table/base-table.component.ts
import { Component, Input, Output, EventEmitter, TemplateRef, OnInit, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'outline' | 'ghost';
  disabled?: (item: unknown) => boolean;
  visible?: (item: unknown) => boolean;
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
  imports: [CommonModule, FormsModule],
  template: `
    <div class="base-table-container" [class]="containerClass">
      <!-- Table Header -->
      <div class="table-header" *ngIf="config.showHeader">
        <div class="table-title">
          <h3 *ngIf="title">{{ title }}</h3>
          <p *ngIf="subtitle" class="table-subtitle">{{ subtitle }}</p>
        </div>
        
        <div class="table-actions" *ngIf="config.showActions">
          <div class="search-container" *ngIf="config.showSearch">
            <input
              type="text"
              placeholder="Search..."
              [(ngModel)]="searchQuery"
              (input)="onSearchChange()"
              class="search-input"
            />
            <span class="search-icon material-icons">search</span>
          </div>
          
          <ng-content select="[slot=actions]"></ng-content>
        </div>
      </div>

      <!-- Table Content -->
      <div class="table-content">
        <div class="table-wrapper" [class]="wrapperClass">
          <table class="base-table" [class]="tableClass">
            <thead *ngIf="columns.length > 0">
              <tr>
                <th
                  *ngFor="let column of columns"
                  [style.width]="column.width"
                  [style.text-align]="column.align || 'left'"
                  [class.sortable]="column.sortable"
                  [class.sorted]="sortColumn === column.key"
                  (click)="onSort(column)"
                >
                  <div class="th-content">
                    <span class="th-label">{{ column.label }}</span>
                    <span *ngIf="column.sortable" class="sort-icon material-icons">
                      {{ getSortIcon(column.key) }}
                    </span>
                  </div>
                </th>
                <th *ngIf="actions.length > 0" class="actions-column">Actions</th>
              </tr>
            </thead>
            
            <tbody>
              <tr *ngFor="let item of paginatedData; let i = index" [class]="getRowClass(item, i)">
                <td
                  *ngFor="let column of columns"
                  [style.text-align]="column.align || 'left'"
                >
                  <ng-container [ngSwitch]="column.type">
                    <!-- Custom Template -->
                    <ng-container *ngSwitchCase="'custom'">
                      <ng-container *ngTemplateOutlet="column.template || null; context: { $implicit: item, column: column }"></ng-container>
                    </ng-container>
                    
                    <!-- Boolean Type -->
                    <ng-container *ngSwitchCase="'boolean'">
                      <span class="boolean-value" [class.true]="getValue(item, column.key)">
                        {{ getValue(item, column.key) ? 'Yes' : 'No' }}
                      </span>
                    </ng-container>
                    
                    <!-- Date Type -->
                    <ng-container *ngSwitchCase="'date'">
                      {{ formatDate(getValue(item, column.key)) }}
                    </ng-container>
                    
                    <!-- Number Type -->
                    <ng-container *ngSwitchCase="'number'">
                      {{ formatNumber(getValue(item, column.key)) }}
                    </ng-container>
                    
                    <!-- Default Text Type -->
                    <ng-container *ngSwitchDefault>
                      {{ getValue(item, column.key) }}
                    </ng-container>
                  </ng-container>
                </td>
                
                <!-- Actions Column -->
                <td *ngIf="actions.length > 0" class="actions-cell">
                  <div class="action-buttons">
                    <button
                      *ngFor="let action of getVisibleActions(item)"
                      [class]="getActionClass(action)"
                      [disabled]="action.disabled?.(item)"
                      (click)="action.onClick(item)"
                    >
                      <span *ngIf="action.icon" class="material-icons">{{ action.icon }}</span>
                      {{ action.label }}
                    </button>
                  </div>
                </td>
              </tr>
              
              <!-- Empty State -->
              <tr *ngIf="filteredData.length === 0 && !config.loading">
                <td [attr.colspan]="totalColumns" class="empty-state">
                  <div class="empty-content">
                    <span class="material-icons">inbox</span>
                    <p>{{ config.emptyMessage || 'No data available' }}</p>
                  </div>
                </td>
              </tr>
              
              <!-- Loading State -->
              <tr *ngIf="config.loading">
                <td [attr.colspan]="totalColumns" class="loading-state">
                  <div class="loading-content">
                    <div class="loading-spinner"></div>
                    <p>Loading...</p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Table Footer -->
      <div class="table-footer" *ngIf="config.showFooter">
        <div class="table-info">
          <span>Showing {{ startIndex + 1 }} to {{ endIndex }} of {{ filteredData.length }} entries</span>
        </div>
        
        <div class="table-pagination" *ngIf="config.showPagination && totalPages > 1">
          <button
            class="page-btn"
            [disabled]="currentPage === 1"
            (click)="goToPage(1)"
          >
            First
          </button>
          
          <button
            class="page-btn"
            [disabled]="currentPage === 1"
            (click)="goToPage(currentPage - 1)"
          >
            Previous
          </button>
          
          <div class="page-numbers">
            <button
              *ngFor="let page of visiblePages"
              class="page-btn"
              [class.active]="page === currentPage"
              (click)="goToPage(page)"
            >
              {{ page }}
            </button>
          </div>
          
          <button
            class="page-btn"
            [disabled]="currentPage === totalPages"
            (click)="goToPage(currentPage + 1)"
          >
            Next
          </button>
          
          <button
            class="page-btn"
            [disabled]="currentPage === totalPages"
            (click)="goToPage(totalPages)"
          >
            Last
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .base-table-container {
        background: var(--bg-surface);
        border: 1px solid var(--border-primary);
        border-radius: var(--border-radius-lg);
        overflow: hidden;
        box-shadow: var(--shadow-base);
      }

      .table-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1.5rem;
        border-bottom: 1px solid var(--border-primary);
        background: var(--bg-surface);

        .table-title {
          h3 {
            margin: 0 0 0.25rem 0;
            font-size: 1.25rem;
            font-weight: 600;
            color: var(--text-primary);
          }

          .table-subtitle {
            margin: 0;
            font-size: 0.9rem;
            color: var(--text-secondary);
          }
        }

        .table-actions {
          display: flex;
          align-items: center;
          gap: 1rem;

          .search-container {
            position: relative;
            display: flex;
            align-items: center;

            .search-input {
              padding: 0.5rem 2.5rem 0.5rem 0.75rem;
              border: 1px solid var(--border-primary);
              border-radius: var(--border-radius-base);
              background: var(--input-bg);
              color: var(--text-primary);
              font-size: 0.875rem;
              width: 200px;

              &:focus {
                outline: none;
                border-color: var(--border-focus);
                box-shadow: 0 0 0 3px rgba(var(--color-primary-500), 0.1);
              }
            }

            .search-icon {
              position: absolute;
              right: 0.75rem;
              color: var(--text-tertiary);
              font-size: 1.2rem;
            }
          }
        }
      }

      .table-content {
        overflow-x: auto;
      }

      .table-wrapper {
        min-width: 100%;
      }

      .base-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 0.9rem;

        th {
          background: var(--bg-secondary);
          color: var(--text-primary);
          font-weight: 600;
          padding: 1rem 0.75rem;
          text-align: left;
          border-bottom: 2px solid var(--border-primary);
          position: sticky;
          top: 0;
          z-index: 10;

          &.sortable {
            cursor: pointer;
            user-select: none;
            transition: background-color 0.2s ease;

            &:hover {
              background: var(--bg-tertiary);
            }
          }

          &.sorted {
            background: var(--color-primary-50);
            color: var(--color-primary-700);
          }

          .th-content {
            display: flex;
            align-items: center;
            gap: 0.5rem;

            .sort-icon {
              font-size: 1rem;
              transition: transform 0.2s ease;
            }
          }
        }

        td {
          padding: 0.75rem;
          border-bottom: 1px solid var(--border-primary);
          color: var(--text-secondary);
          vertical-align: middle;

          .boolean-value {
            padding: 0.25rem 0.5rem;
            border-radius: var(--border-radius-sm);
            font-size: 0.8rem;
            font-weight: 500;

            &.true {
              background: var(--color-success-50);
              color: var(--color-success-700);
            }

            &:not(.true) {
              background: var(--color-error-50);
              color: var(--color-error-700);
            }
          }
        }

        tr {
          transition: background-color 0.2s ease;

          &:hover {
            background: var(--bg-secondary);
          }

          &.striped:nth-child(even) {
            background: var(--bg-tertiary);
          }
        }

        .actions-column {
          width: 120px;
          text-align: center;
        }

        .actions-cell {
          text-align: center;

          .action-buttons {
            display: flex;
            gap: 0.5rem;
            justify-content: center;
            flex-wrap: wrap;

            button {
              padding: 0.25rem 0.5rem;
              border: 1px solid var(--border-primary);
              border-radius: var(--border-radius-sm);
              background: var(--bg-surface);
              color: var(--text-primary);
              font-size: 0.8rem;
              cursor: pointer;
              transition: all 0.2s ease;
              display: flex;
              align-items: center;
              gap: 0.25rem;

              &:hover:not(:disabled) {
                background: var(--bg-secondary);
                border-color: var(--border-focus);
              }

              &:disabled {
                opacity: 0.5;
                cursor: not-allowed;
              }

              &.primary {
                background: var(--color-primary-500);
                color: var(--color-white);
                border-color: var(--color-primary-500);
              }

              &.danger {
                background: var(--color-error);
                color: var(--color-white);
                border-color: var(--color-error);
              }
            }
          }
        }

        .empty-state,
        .loading-state {
          text-align: center;
          padding: 3rem 1rem;

          .empty-content,
          .loading-content {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 1rem;
            color: var(--text-tertiary);

            .material-icons {
              font-size: 3rem;
              opacity: 0.5;
            }

            .loading-spinner {
              width: 2rem;
              height: 2rem;
              border: 3px solid var(--border-primary);
              border-top: 3px solid var(--color-primary-500);
              border-radius: 50%;
              animation: spin 1s linear infinite;
            }
          }
        }
      }

      .table-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem 1.5rem;
        border-top: 1px solid var(--border-primary);
        background: var(--bg-secondary);

        .table-info {
          font-size: 0.875rem;
          color: var(--text-secondary);
        }

        .table-pagination {
          display: flex;
          align-items: center;
          gap: 0.5rem;

          .page-btn {
            padding: 0.5rem 0.75rem;
            border: 1px solid var(--border-primary);
            border-radius: var(--border-radius-sm);
            background: var(--bg-surface);
            color: var(--text-primary);
            cursor: pointer;
            transition: all 0.2s ease;
            font-size: 0.875rem;

            &:hover:not(:disabled) {
              background: var(--bg-secondary);
              border-color: var(--border-focus);
            }

            &:disabled {
              opacity: 0.5;
              cursor: not-allowed;
            }

            &.active {
              background: var(--color-primary-500);
              color: var(--color-white);
              border-color: var(--color-primary-500);
            }
          }

          .page-numbers {
            display: flex;
            gap: 0.25rem;
          }
        }
      }

      /* Table sizes */
      .base-table-container.small {
        .base-table {
          font-size: 0.8rem;

          th, td {
            padding: 0.5rem;
          }
        }
      }

      .base-table-container.large {
        .base-table {
          font-size: 1rem;

          th, td {
            padding: 1.25rem;
          }
        }
      }

      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }

      @media (max-width: 768px) {
        .table-header {
          flex-direction: column;
          gap: 1rem;
          align-items: stretch;

          .table-actions {
            justify-content: space-between;

            .search-container .search-input {
              width: 150px;
            }
          }
        }

        .table-footer {
          flex-direction: column;
          gap: 1rem;
          align-items: stretch;

          .table-pagination {
            justify-content: center;
          }
        }
      }
    `,
  ],
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
    bordered: true,
    size: 'medium',
    loading: false,
    emptyMessage: 'No data available',
  };
  @Input() pageSize = 10;
  @Input() customClass = '';

  @Output() rowClick = new EventEmitter<unknown>();
  @Output() sortChange = new EventEmitter<{ column: string; direction: 'asc' | 'desc' }>();
  @Output() pageChange = new EventEmitter<number>();

  searchQuery = '';
  sortColumn = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  currentPage = 1;
  filteredData: unknown[] = [];
  paginatedData: unknown[] = [];

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
    ].filter(Boolean);

    return classes.join(' ');
  }

  get tableClass(): string {
    const classes = [
      'base-table',
      this.config.striped ? 'striped' : '',
      this.config.hoverable ? 'hoverable' : '',
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
    this.updateData();
    this.currentPage = 1;
  }

  onSort(column: TableColumn): void {
    if (!column.sortable) return;

    if (this.sortColumn === column.key) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column.key;
      this.sortDirection = 'asc';
    }

    this.sortChange.emit({ column: this.sortColumn, direction: this.sortDirection });
    this.updateData();
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;

    this.currentPage = page;
    this.pageChange.emit(page);
    this.updateData();
  }

  getValue(item: unknown, key: string): unknown {
    return key.split('.').reduce((obj: unknown, k) => (obj as Record<string, unknown>)?.[k], item);
  }

  formatDate(value: unknown): string {
    if (!value) return '';
    if (typeof value === 'string' || typeof value === 'number' || value instanceof Date) {
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
    return this.sortDirection === 'asc' ? 'keyboard_arrow_up' : 'keyboard_arrow_down';
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
    return classes.join(' ');
  }

  private updateData(): void {
    // Filter data
    this.filteredData = this.data.filter(item => {
      if (!this.searchQuery) return true;
      const query = this.searchQuery.toLowerCase();
      return this.columns.some(column => {
        const value = this.getValue(item, column.key);
        return String(value).toLowerCase().includes(query);
      });
    });

    // Sort data
    if (this.sortColumn) {
      this.filteredData.sort((a, b) => {
        const aValue = this.getValue(a, this.sortColumn);
        const bValue = this.getValue(b, this.sortColumn);
        
        // Handle null/undefined values
        if (aValue == null && bValue == null) return 0;
        if (aValue == null) return this.sortDirection === 'asc' ? -1 : 1;
        if (bValue == null) return this.sortDirection === 'asc' ? 1 : -1;
        
        // Type-safe comparison
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          const comparison = aValue.localeCompare(bValue);
          return this.sortDirection === 'asc' ? comparison : -comparison;
        }
        
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          if (aValue < bValue) return this.sortDirection === 'asc' ? -1 : 1;
          if (aValue > bValue) return this.sortDirection === 'asc' ? 1 : -1;
          return 0;
        }
        
        // Fallback to string comparison
        const aStr = String(aValue);
        const bStr = String(bValue);
        const comparison = aStr.localeCompare(bStr);
        return this.sortDirection === 'asc' ? comparison : -comparison;
      });
    }

    // Paginate data
    const start = this.startIndex;
    const end = this.endIndex;
    this.paginatedData = this.filteredData.slice(start, end);
  }
}
