// Path: GeneralWebApi/Frontend/general-frontend/src/app/features/departments/department-list/department-list.component.ts
import { Component, signal, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, Observable } from 'rxjs';
import { takeUntil, filter, take } from 'rxjs/operators';
import { DepartmentCardComponent } from '../department-card/department-card.component';
import { AddDepartmentComponent } from '../add-department/add-department.component';
import { DepartmentDetailComponent } from '../department-detail/department-detail.component';
import { SearchDepartmentComponent } from '../search-department/search-department.component';
import {
  BasePrivatePageContainerComponent,
  BaseSearchComponent,
  BaseAsyncStateComponent,
  TabItem,
} from '../../../Shared/components/base';
import { DepartmentFacade } from '@store/department/department.facade';
import { Department } from 'app/contracts/departments/department.model';
import {
  DialogService,
  NotificationService,
  OperationNotificationService,
} from '../../../Shared/services';

@Component({
  selector: 'app-department-list',
  standalone: true,
  imports: [
    CommonModule,
    DepartmentCardComponent,
    AddDepartmentComponent,
    DepartmentDetailComponent,
    SearchDepartmentComponent,
    BasePrivatePageContainerComponent,
    BaseSearchComponent,
    BaseAsyncStateComponent,
  ],
  templateUrl: './department-list.component.html',
  styleUrls: ['./department-list.component.scss'],
})
export class DepartmentListComponent implements OnInit, OnDestroy {
  private departmentFacade = inject(DepartmentFacade);
  private dialogService = inject(DialogService);
  private notificationService = inject(NotificationService);
  private operationNotification = inject(OperationNotificationService);
  private destroy$ = new Subject<void>();

  // Observable streams from NgRx store
  departments$ = this.departmentFacade.filteredDepartments$;
  loading$ = this.departmentFacade.loading$;
  error$ = this.departmentFacade.error$;
  pagination$ = this.departmentFacade.pagination$;
  filters$ = this.departmentFacade.filters$;
  operationInProgress$ = this.departmentFacade.operationInProgress$;

  // Local state
  activeTab = signal<'list' | 'add' | 'search'>('list');
  selectedDepartmentForDetail: Department | null = null;
  isDetailModalOpen = false;
  detailMode: 'edit' | 'view' = 'view';

  // Tab configuration
  tabs: TabItem[] = [
    { id: 'list', label: 'Department List', icon: 'list' },
    { id: 'add', label: 'Add Department', icon: 'add' },
    { id: 'search', label: 'Search Department', icon: 'search' },
  ];

  ngOnInit() {
    this.loadDepartments();
    this.setupOperationListeners();
  }

  private setupOperationListeners(): void {
    this.operationNotification.setup({
      error$: this.departmentFacade.error$,
      operationInProgress$: this.departmentFacade.operationInProgress$,
      destroy$: this.destroy$,
      autoShowLoading: true,
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadDepartments() {
    console.log('🔄 Loading departments...');
    this.departmentFacade.loadDepartments();
  }

  onEditDepartment(department: Department) {
    this.departmentFacade.selectDepartment(department);
    this.selectedDepartmentForDetail = department;
    this.detailMode = 'edit';
    this.isDetailModalOpen = true;
  }

  onDeleteDepartment(department: Department) {
    const departmentName = department.name;

    const confirm$: Observable<boolean> = this.dialogService.confirm({
      title: 'Confirm Delete',
      message: `Are you sure you want to delete ${departmentName}? This action cannot be undone.`,
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
        employeeName: departmentName,
      });

      this.departmentFacade.deleteDepartment(department.id);
    });
  }

  onViewDepartment(department: Department) {
    this.departmentFacade.selectDepartment(department);
    this.selectedDepartmentForDetail = department;
    this.detailMode = 'view';
    this.isDetailModalOpen = true;
  }

  onCloseDetailModal() {
    this.isDetailModalOpen = false;
    this.selectedDepartmentForDetail = null;
    this.detailMode = 'view';
  }

  onDepartmentUpdated(department: Department) {
    // Effect will handle reload automatically
  }

  onDepartmentCreated() {
    // Don't reload - the store automatically adds the new department to the list
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
    this.departmentFacade.setFilters({ searchTerm });
  }

  clearFilters() {
    this.departmentFacade.clearFilters();
  }

  clearError() {
    this.departmentFacade.clearError();
  }

  onRetryLoad = () => {
    this.loadDepartments();
  };

  onEmptyActionClick = () => {
    this.setActiveTab('add');
  };
}
