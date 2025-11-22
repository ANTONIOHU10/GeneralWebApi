// Path: GeneralWebApi/Frontend/general-frontend/src/app/features/positions/position-list/position-list.component.ts
import { Component, signal, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, Observable } from 'rxjs';
import { takeUntil, filter, take } from 'rxjs/operators';
import { PositionCardComponent } from '../position-card/position-card.component';
import { AddPositionComponent } from '../add-position/add-position.component';
import { PositionDetailComponent } from '../position-detail/position-detail.component';
import { SearchPositionComponent } from '../search-position/search-position.component';
import {
  BasePrivatePageContainerComponent,
  BaseSearchComponent,
  BaseAsyncStateComponent,
  TabItem,
} from '../../../Shared/components/base';
import { PositionFacade } from '@store/position/position.facade';
import { Position } from 'app/contracts/positions/position.model';
import {
  DialogService,
  NotificationService,
  OperationNotificationService,
} from '../../../Shared/services';

@Component({
  selector: 'app-position-list',
  standalone: true,
  imports: [
    CommonModule,
    PositionCardComponent,
    AddPositionComponent,
    PositionDetailComponent,
    SearchPositionComponent,
    BasePrivatePageContainerComponent,
    BaseSearchComponent,
    BaseAsyncStateComponent,
  ],
  templateUrl: './position-list.component.html',
  styleUrls: ['./position-list.component.scss'],
})
export class PositionListComponent implements OnInit, OnDestroy {
  private positionFacade = inject(PositionFacade);
  private dialogService = inject(DialogService);
  private notificationService = inject(NotificationService);
  private operationNotification = inject(OperationNotificationService);
  private destroy$ = new Subject<void>();

  // Observable streams from NgRx store
  positions$ = this.positionFacade.filteredPositions$;
  loading$ = this.positionFacade.loading$;
  error$ = this.positionFacade.error$;
  pagination$ = this.positionFacade.pagination$;
  filters$ = this.positionFacade.filters$;
  operationInProgress$ = this.positionFacade.operationInProgress$;

  // Local state
  activeTab = signal<'list' | 'add' | 'search'>('list');
  selectedPositionForDetail: Position | null = null;
  isDetailModalOpen = false;
  detailMode: 'edit' | 'view' = 'view';

  // Tab configuration
  tabs: TabItem[] = [
    { id: 'list', label: 'Position List', icon: 'list' },
    { id: 'add', label: 'Add Position', icon: 'add' },
    { id: 'search', label: 'Search Position', icon: 'search' },
  ];

  ngOnInit() {
    this.loadPositions();
    this.setupOperationListeners();
  }

  private setupOperationListeners(): void {
    this.operationNotification.setup({
      error$: this.positionFacade.error$,
      operationInProgress$: this.positionFacade.operationInProgress$,
      destroy$: this.destroy$,
      autoShowLoading: true,
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadPositions() {
    console.log('🔄 Loading positions...');
    this.positionFacade.loadPositions();
  }

  onEditPosition(position: Position) {
    this.positionFacade.selectPosition(position);
    this.selectedPositionForDetail = position;
    this.detailMode = 'edit';
    this.isDetailModalOpen = true;
  }

  onDeletePosition(position: Position) {
    const positionTitle = position.title;

    const confirm$: Observable<boolean> = this.dialogService.confirm({
      title: 'Confirm Delete',
      message: `Are you sure you want to delete position ${positionTitle}? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      confirmVariant: 'danger',
      icon: 'warning',
    });

    confirm$.pipe(
      take(1),
      takeUntil(this.destroy$),
      filter((confirmed: boolean) => confirmed)
    ).subscribe(() => {
      this.operationNotification.trackOperation({
        type: 'delete',
        employeeName: positionTitle,
      });

      this.positionFacade.deletePosition(position.id);
    });
  }

  onViewPosition(position: Position) {
    this.positionFacade.selectPosition(position);
    this.selectedPositionForDetail = position;
    this.detailMode = 'view';
    this.isDetailModalOpen = true;
  }

  onCloseDetailModal() {
    this.isDetailModalOpen = false;
    this.selectedPositionForDetail = null;
    this.detailMode = 'view';
  }

  onPositionUpdated(position: Position) {
    // Effect will handle reload automatically
  }

  onPositionCreated() {
    // Don't reload - the store automatically adds the new position to the list
  }

  setActiveTab(tab: 'list' | 'add' | 'search'): void {
    this.activeTab.set(tab);
  }

  onTabChange(tabId: string): void {
    const newTab = tabId as 'list' | 'add' | 'search';
    this.setActiveTab(newTab);

    if (newTab === 'list') {
      this.operationInProgress$.pipe(take(1)).subscribe(operation => {
        if (!operation.loading) {
          this.clearError();
        }
      });
    }
  }

  onSearchChange(searchTerm: string) {
    this.positionFacade.setFilters({ searchTerm });
  }

  clearFilters() {
    this.positionFacade.clearFilters();
  }

  clearError() {
    this.positionFacade.clearError();
  }

  onRetryLoad = () => {
    this.loadPositions();
  };

  onEmptyActionClick = () => {
    this.setActiveTab('add');
  };
}
