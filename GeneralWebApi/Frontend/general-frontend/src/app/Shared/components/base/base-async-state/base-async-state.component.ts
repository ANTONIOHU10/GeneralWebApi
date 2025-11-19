// Path: GeneralWebApi/Frontend/general-frontend/src/app/Shared/components/base/base-async-state/base-async-state.component.ts
import { Component, Input, TemplateRef, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, combineLatest, of, Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import {
  BaseLoadingComponent,
  LoadingConfig,
} from '../base-loading/base-loading.component';
import {
  BaseErrorComponent,
  ErrorConfig,
} from '../base-error/base-error.component';
import {
  BaseEmptyComponent,
  EmptyConfig,
} from '../base-empty/base-empty.component';

export interface AsyncStateConfig {
  loading?: Partial<LoadingConfig>;
  error?: Partial<ErrorConfig>;
  empty?: Partial<EmptyConfig>;
}

/**
 * Component for handling async data states (loading, error, empty)
 * Simplifies the common pattern of showing different states based on Observable data
 */
@Component({
  selector: 'app-base-async-state',
  standalone: true,
  imports: [
    CommonModule,
    BaseLoadingComponent,
    BaseErrorComponent,
    BaseEmptyComponent,
  ],
  templateUrl: './base-async-state.component.html',
  styleUrls: ['./base-async-state.component.scss'],
})
export class BaseAsyncStateComponent<T> implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Observable inputs
  @Input() loading$?: Observable<boolean>;
  @Input() error$?: Observable<string | null>;
  @Input() data$?: Observable<T[] | null>;
  @Input() data?: T[] | null;

  // Direct boolean inputs (alternative to Observables)
  @Input() loading?: boolean;
  @Input() error?: string | null;
  @Input() isEmpty?: boolean;

  // Combined state Observable
  combinedState$!: Observable<{
    loading: boolean;
    error: string | null;
    data: T[] | null;
  }>;

  // Configuration
  @Input() config?: AsyncStateConfig;

  // Custom messages
  @Input() loadingMessage = 'Loading...';
  @Input() emptyTitle = 'No data available';
  @Input() emptyDescription?: string;
  @Input() emptyActionText?: string;

  // Custom templates
  @Input() loadingTemplate?: TemplateRef<unknown>;
  @Input() errorTemplate?: TemplateRef<unknown>;
  @Input() emptyTemplate?: TemplateRef<unknown>;

  // Events
  @Input() onRetry?: () => void;
  @Input() onEmptyAction?: () => void;

  ngOnInit(): void {
    // Create combined state Observable
    if (this.loading$ || this.error$ || this.data$) {
      // Observable-based mode
      // Use default values if Observable is not provided
      const loading$ = this.loading$ ?? of(false);
      const error$ = this.error$ ?? of(null);
      const data$ = this.data$ ?? of(null);

      // Combine all Observables to ensure synchronized state
      this.combinedState$ = combineLatest({
        loading: loading$,
        error: error$,
        data: data$,
      }).pipe(
        map(({ loading, error, data }) => ({
          loading: loading ?? false,
          error: error ?? null,
          data: data ?? null,
        })),
        takeUntil(this.destroy$)
      );
    } else {
      // Direct value mode - convert to Observable
      this.combinedState$ = of({
        loading: this.loading ?? false,
        error: this.error ?? null,
        data: this.data ?? null,
      }).pipe(takeUntil(this.destroy$));
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Default configs
  get defaultLoadingConfig(): LoadingConfig {
    return {
      size: 'md',
      type: 'spinner',
      message: this.loadingMessage,
      overlay: false,
      centered: true,
      fullHeight: false,
      ...this.config?.loading,
    };
  }

  get defaultErrorConfig(): ErrorConfig {
    return {
      type: 'error',
      size: 'md',
      showIcon: true,
      showRetryButton: !!this.onRetry,
      showDismissButton: false,
      retryButtonText: 'Retry',
      centered: true,
      fullWidth: false,
      ...this.config?.error,
    };
  }

  get defaultEmptyConfig(): EmptyConfig {
    return {
      type: 'data',
      size: 'md',
      showIcon: true,
      showActionButton: !!this.onEmptyAction,
      actionButtonText: this.emptyActionText || 'Add New',
      centered: true,
      fullHeight: false,
      ...this.config?.empty,
    };
  }

  handleRetry(): void {
    if (this.onRetry) {
      this.onRetry();
    }
  }

  handleEmptyAction(): void {
    if (this.onEmptyAction) {
      this.onEmptyAction();
    }
  }
}

