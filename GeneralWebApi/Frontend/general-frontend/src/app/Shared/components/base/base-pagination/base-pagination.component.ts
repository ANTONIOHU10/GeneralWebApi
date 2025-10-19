// Path: GeneralWebApi/Frontend/general-frontend/src/app/shared/components/base/base-pagination/base-pagination.component.ts
import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface PaginationConfig {
  showFirstLast?: boolean;
  showPrevNext?: boolean;
  showPageNumbers?: boolean;
  maxVisiblePages?: number;
  showInfo?: boolean;
  showPageSize?: boolean;
  pageSizeOptions?: number[];
  size?: 'small' | 'medium' | 'large';
}

@Component({
  selector: 'app-base-pagination',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="base-pagination" [class]="paginationClass">
      <!-- Pagination Info -->
      <div class="pagination-info" *ngIf="config.showInfo">
        <span class="info-text">
          Showing {{ startItem }} to {{ endItem }} of {{ totalItems }} entries
        </span>
      </div>

      <!-- Page Size Selector -->
      <div class="page-size-selector" *ngIf="config.showPageSize">
        <label class="page-size-label" for="page-size-select">Show:</label>
        <select
          id="page-size-select"
          [value]="pageSize"
          (change)="onPageSizeChange($event)"
          class="page-size-select"
        >
          <option *ngFor="let size of config.pageSizeOptions" [value]="size">
            {{ size }}
          </option>
        </select>
        <span class="page-size-text">per page</span>
      </div>

      <!-- Pagination Controls -->
      <div class="pagination-controls">
        <!-- First Page Button -->
        <button
          *ngIf="config.showFirstLast"
          class="page-btn first-btn"
          [disabled]="currentPage === 1"
          (click)="goToPage(1)"
          [attr.aria-label]="'Go to first page'"
        >
          <span class="material-icons">first_page</span>
        </button>

        <!-- Previous Page Button -->
        <button
          *ngIf="config.showPrevNext"
          class="page-btn prev-btn"
          [disabled]="currentPage === 1"
          (click)="goToPage(currentPage - 1)"
          [attr.aria-label]="'Go to previous page'"
        >
          <span class="material-icons">chevron_left</span>
        </button>

        <!-- Page Numbers -->
        <div class="page-numbers" *ngIf="config.showPageNumbers">
          <button
            *ngFor="let page of visiblePages"
            class="page-btn page-number"
            [class.active]="page === currentPage"
            [class.ellipsis]="page === '...'"
            [disabled]="page === '...'"
            (click)="goToPage(page)"
            [attr.aria-label]="page === '...' ? 'More pages' : 'Go to page ' + page"
          >
            {{ page }}
          </button>
        </div>

        <!-- Next Page Button -->
        <button
          *ngIf="config.showPrevNext"
          class="page-btn next-btn"
          [disabled]="currentPage === totalPages"
          (click)="goToPage(currentPage + 1)"
          [attr.aria-label]="'Go to next page'"
        >
          <span class="material-icons">chevron_right</span>
        </button>

        <!-- Last Page Button -->
        <button
          *ngIf="config.showFirstLast"
          class="page-btn last-btn"
          [disabled]="currentPage === totalPages"
          (click)="goToPage(totalPages)"
          [attr.aria-label]="'Go to last page'"
        >
          <span class="material-icons">last_page</span>
        </button>
      </div>

      <!-- Quick Jump -->
      <div class="quick-jump" *ngIf="showQuickJump">
        <label class="jump-label" for="jump-input">Go to:</label>
        <input
          id="jump-input"
          type="number"
          [min]="1"
          [max]="totalPages"
          [(ngModel)]="jumpPage"
          (keydown.enter)="jumpToPage()"
          class="jump-input"
          [attr.aria-label]="'Jump to page'"
        />
        <button
          class="jump-btn"
          (click)="jumpToPage()"
          [disabled]="!isValidJumpPage()"
        >
          Go
        </button>
      </div>
    </div>
  `,
  styles: [
    `
      .base-pagination {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
        padding: 1rem;
        background: var(--bg-surface);
        border: 1px solid var(--border-primary);
        border-radius: var(--border-radius-lg);
        flex-wrap: wrap;
      }

      .pagination-info {
        .info-text {
          font-size: 0.875rem;
          color: var(--text-secondary);
        }
      }

      .page-size-selector {
        display: flex;
        align-items: center;
        gap: 0.5rem;

        .page-size-label {
          font-size: 0.875rem;
          color: var(--text-secondary);
        }

        .page-size-select {
          padding: 0.5rem;
          border: 1px solid var(--border-primary);
          border-radius: var(--border-radius-sm);
          background: var(--input-bg);
          color: var(--text-primary);
          font-size: 0.875rem;

          &:focus {
            outline: none;
            border-color: var(--border-focus);
            box-shadow: 0 0 0 3px rgba(var(--color-primary-500), 0.1);
          }
        }

        .page-size-text {
          font-size: 0.875rem;
          color: var(--text-secondary);
        }
      }

      .pagination-controls {
        display: flex;
        align-items: center;
        gap: 0.25rem;
      }

      .page-numbers {
        display: flex;
        align-items: center;
        gap: 0.25rem;
      }

      .page-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        min-width: 2.5rem;
        height: 2.5rem;
        padding: 0.5rem;
        border: 1px solid var(--border-primary);
        border-radius: var(--border-radius-sm);
        background: var(--bg-surface);
        color: var(--text-primary);
        font-size: 0.875rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
        text-decoration: none;

        &:hover:not(:disabled) {
          background: var(--bg-secondary);
          border-color: var(--border-focus);
          transform: translateY(-1px);
          box-shadow: var(--shadow-sm);
        }

        &:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        &.active {
          background: var(--color-primary-500);
          color: var(--color-white);
          border-color: var(--color-primary-500);
          font-weight: 600;
        }

        &.ellipsis {
          cursor: default;
          background: transparent;
          border: none;
          font-weight: bold;
          color: var(--text-tertiary);

          &:hover {
            background: transparent;
            transform: none;
            box-shadow: none;
          }
        }

        .material-icons {
          font-size: 1.2rem;
        }
      }

      .quick-jump {
        display: flex;
        align-items: center;
        gap: 0.5rem;

        .jump-label {
          font-size: 0.875rem;
          color: var(--text-secondary);
        }

        .jump-input {
          width: 4rem;
          padding: 0.5rem;
          border: 1px solid var(--border-primary);
          border-radius: var(--border-radius-sm);
          background: var(--input-bg);
          color: var(--text-primary);
          font-size: 0.875rem;
          text-align: center;

          &:focus {
            outline: none;
            border-color: var(--border-focus);
            box-shadow: 0 0 0 3px rgba(var(--color-primary-500), 0.1);
          }
        }

        .jump-btn {
          padding: 0.5rem 1rem;
          border: 1px solid var(--color-primary-500);
          border-radius: var(--border-radius-sm);
          background: var(--color-primary-500);
          color: var(--color-white);
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;

          &:hover:not(:disabled) {
            background: var(--color-primary-600);
            border-color: var(--color-primary-600);
            transform: translateY(-1px);
            box-shadow: var(--shadow-sm);
          }

          &:disabled {
            opacity: 0.5;
            cursor: not-allowed;
            transform: none;
            box-shadow: none;
          }
        }
      }

      /* Pagination sizes */
      .base-pagination.small {
        padding: 0.75rem;
        gap: 0.75rem;

        .page-btn {
          min-width: 2rem;
          height: 2rem;
          font-size: 0.8rem;
        }

        .pagination-info .info-text,
        .page-size-selector .page-size-label,
        .page-size-selector .page-size-text,
        .quick-jump .jump-label {
          font-size: 0.8rem;
        }
      }

      .base-pagination.large {
        padding: 1.25rem;
        gap: 1.25rem;

        .page-btn {
          min-width: 3rem;
          height: 3rem;
          font-size: 1rem;
        }

        .pagination-info .info-text,
        .page-size-selector .page-size-label,
        .page-size-selector .page-size-text,
        .quick-jump .jump-label {
          font-size: 1rem;
        }
      }

      /* Responsive design */
      @media (max-width: 768px) {
        .base-pagination {
          flex-direction: column;
          align-items: stretch;
          gap: 1rem;

          .pagination-controls {
            justify-content: center;
          }

          .page-numbers {
            flex-wrap: wrap;
            justify-content: center;
          }

          .quick-jump {
            justify-content: center;
          }
        }
      }

      @media (max-width: 480px) {
        .base-pagination {
          .page-numbers {
            .page-btn {
              min-width: 2rem;
              height: 2rem;
              font-size: 0.8rem;
            }
          }

          .quick-jump {
            flex-direction: column;
            gap: 0.5rem;
          }
        }
      }
    `,
  ],
})
export class BasePaginationComponent implements OnChanges {
  @Input() currentPage = 1;
  @Input() totalPages = 1;
  @Input() totalItems = 0;
  @Input() pageSize = 10;
  @Input() config: PaginationConfig = {
    showFirstLast: true,
    showPrevNext: true,
    showPageNumbers: true,
    maxVisiblePages: 5,
    showInfo: true,
    showPageSize: true,
    pageSizeOptions: [5, 10, 25, 50, 100],
    size: 'medium',
  };
  @Input() showQuickJump = true;
  @Input() customClass = '';

  @Output() pageChange = new EventEmitter<number>();
  @Output() pageSizeChange = new EventEmitter<number>();

  jumpPage = 1;
  visiblePages: (number | string)[] = [];

  get paginationClass(): string {
    const classes = [
      'base-pagination',
      this.config.size !== 'medium' ? this.config.size : '',
      this.customClass,
    ].filter(Boolean);

    return classes.join(' ');
  }

  get startItem(): number {
    return this.totalItems === 0 ? 0 : (this.currentPage - 1) * this.pageSize + 1;
  }

  get endItem(): number {
    return Math.min(this.currentPage * this.pageSize, this.totalItems);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['currentPage'] || changes['totalPages'] || changes['config']) {
      this.updateVisiblePages();
    }
  }

  goToPage(page: number | string): void {
    if (typeof page === 'string' || page < 1 || page > this.totalPages) return;

    this.currentPage = page;
    this.pageChange.emit(page);
    this.updateVisiblePages();
  }

  onPageSizeChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const newPageSize = parseInt(target.value, 10);
    
    this.pageSize = newPageSize;
    this.currentPage = 1;
    this.pageSizeChange.emit(newPageSize);
    this.pageChange.emit(1);
  }

  jumpToPage(): void {
    if (this.isValidJumpPage()) {
      this.goToPage(this.jumpPage);
    }
  }

  isValidJumpPage(): boolean {
    return this.jumpPage >= 1 && this.jumpPage <= this.totalPages;
  }

  private updateVisiblePages(): void {
    if (!this.config.showPageNumbers) {
      this.visiblePages = [];
      return;
    }

    const maxVisible = this.config.maxVisiblePages || 5;
    const pages: (number | string)[] = [];

    if (this.totalPages <= maxVisible) {
      // Show all pages if total is less than max visible
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Calculate start and end pages
      let start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
      const end = Math.min(this.totalPages, start + maxVisible - 1);

      // Adjust start if we're near the end
      if (end - start + 1 < maxVisible) {
        start = Math.max(1, end - maxVisible + 1);
      }

      // Add first page and ellipsis if needed
      if (start > 1) {
        pages.push(1);
        if (start > 2) {
          pages.push('...');
        }
      }

      // Add visible pages
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      // Add ellipsis and last page if needed
      if (end < this.totalPages) {
        if (end < this.totalPages - 1) {
          pages.push('...');
        }
        pages.push(this.totalPages);
      }
    }

    this.visiblePages = pages;
  }
}
