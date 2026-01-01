// Path: GeneralWebApi/Frontend/general-frontend/src/app/shared/components/base/base-pagination/base-pagination.component.ts
import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@core/pipes/translate.pipe';

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
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './base-pagination.component.html',
  styleUrls: ['./base-pagination.component.scss'],
})
export class BasePaginationComponent implements OnChanges {
  @Input() currentPage = 1;
  @Input() totalPages = 1;
  @Input() totalItems = 0;
  @Input() pageSize = 25;
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
    return this.totalItems === 0
      ? 0
      : (this.currentPage - 1) * this.pageSize + 1;
  }

  get endItem(): number {
    return Math.min(this.currentPage * this.pageSize, this.totalItems);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['currentPage'] || changes['totalPages'] || changes['config'] || changes['pageSize']) {
      this.updateVisiblePages();
      console.log('currentPage', this.currentPage);
      console.log('totalPages', this.totalPages);
      console.log('config', this.config);
      console.log('pageSize', this.pageSize);
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
    const newPageSize = parseInt(target.value,10);
    console.log('onPageSizeChange', this.currentPage, this.pageSize);
    this.pageSize = newPageSize;
    //this.currentPage = 1;
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
