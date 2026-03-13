// Path: GeneralWebApi/Frontend/general-frontend/src/app/features/contract-templates/contract-template-list/contract-template-list.component.ts
import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BehaviorSubject, Subject, of } from 'rxjs';
import { first, catchError, filter, take, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import {
  BasePrivatePageContainerComponent,
  BaseAsyncStateComponent,
  BaseTableComponent,
  BaseCardComponent,
  BaseBadgeComponent,
  BaseSearchComponent,
  BaseFilterContainerComponent,
  type BaseFilterField,
  TabItem,
  TableColumn,
  TableAction,
  BadgeVariant,
} from '../../../Shared/components/base';
import { NotificationService, DialogService } from '../../../Shared/services';
import { TranslationService } from '@core/services/translation.service';
import { ContractTemplateService } from '@core/services/contract-template.service';
import { TranslatePipe } from '@core/pipes/translate.pipe';
import { ContractTemplate } from 'app/contracts/contract-templates/contract-template.model';
import { ContractTemplateDetailComponent } from '../contract-template-detail/contract-template-detail.component';
import { AddContractTemplateComponent } from '../add-contract-template/add-contract-template.component';

@Component({
  selector: 'app-contract-template-list',
  standalone: true,
  imports: [
    CommonModule,
    BasePrivatePageContainerComponent,
    BaseAsyncStateComponent,
    BaseTableComponent,
    BaseCardComponent,
    BaseBadgeComponent,
    BaseSearchComponent,
    BaseFilterContainerComponent,
    ContractTemplateDetailComponent,
    AddContractTemplateComponent,
    TranslatePipe,
  ],
  templateUrl: './contract-template-list.component.html',
  styleUrls: ['./contract-template-list.component.scss'],
})
export class ContractTemplateListComponent implements OnInit, OnDestroy {
  private notificationService = inject(NotificationService);
  private dialogService = inject(DialogService);
  private translationService = inject(TranslationService);
  private contractTemplateService = inject(ContractTemplateService);
  private destroy$ = new Subject<void>();

  templates = signal<ContractTemplate[]>([]);
  loading$ = new BehaviorSubject<boolean>(false);
  templatesData$ = new BehaviorSubject<ContractTemplate[] | null>(null);
  activeFilter = signal<'all' | 'active' | 'inactive' | 'default'>('all');
  searchTerm = signal<string>('');
  activeTab = signal<'list' | 'add'>('list');
  currentPage = signal(1);
  pageSize = signal(10);
  totalCount = signal(0);
  totalPages = signal(1);
  loadingDetail = signal(false);

  selectedTemplate: ContractTemplate | null = null;
  isDetailModalOpen = false;
  detailMode: 'edit' | 'view' = 'view';

  filterOptions: ('all' | 'active' | 'inactive' | 'default')[] = ['all', 'active', 'inactive', 'default'];
  tabs: TabItem[] = [];
  tableColumns: TableColumn[] = [];
  tableActions: TableAction[] = [];

  // Filter configuration
  templateFilterFields: BaseFilterField[] = [];
  templateFilterValue: Record<string, unknown> = { status: 'all' };

  /**
   * Get translated filter label
   */
  getFilterLabel(filter: string): string {
    return this.translationService.translate(`contractTemplates.filterOptions.${filter}`);
  }

  /**
   * Initialize tabs with translations
   */
  private initializeTabs(): void {
    this.tabs = [
      { id: 'list', label: this.translationService.translate('contractTemplates.tabs.list'), icon: 'list' },
      { id: 'add', label: this.translationService.translate('contractTemplates.tabs.add'), icon: 'add' },
    ];
  }

  /**
   * Initialize table config with translations
   */
  private initializeTableConfig(): void {
    this.tableColumns = [
      { key: 'name', label: this.translationService.translate('contractTemplates.columns.name'), sortable: true, width: '200px' },
      { key: 'description', label: this.translationService.translate('contractTemplates.columns.description'), sortable: false, width: '200px' },
      { key: 'contractType', label: this.translationService.translate('contractTemplates.columns.contractType'), sortable: true, width: '120px' },
      { key: 'category', label: this.translationService.translate('contractTemplates.columns.category'), sortable: true, width: '120px' },
      { key: 'usageCount', label: this.translationService.translate('contractTemplates.columns.usageCount'), sortable: true, type: 'number', width: '100px' },
      { key: 'isActive', label: this.translationService.translate('contractTemplates.columns.status'), sortable: true, width: '100px' },
      { key: 'isDefault', label: this.translationService.translate('contractTemplates.columns.default'), sortable: true, width: '100px' },
    ];

    this.tableActions = [
      { label: this.translationService.translate('contractTemplates.actions.view'), icon: 'visibility', variant: 'ghost', showLabel: false, onClick: (item) => this.onView(item as ContractTemplate) },
      { label: this.translationService.translate('contractTemplates.actions.edit'), icon: 'edit', variant: 'primary', showLabel: false, onClick: (item) => this.onEdit(item as ContractTemplate) },
      { label: this.translationService.translate('contractTemplates.actions.delete'), icon: 'delete', variant: 'danger', showLabel: false, onClick: (item) => this.onDelete(item as ContractTemplate) },
    ];
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Computed statistics from current page/filter result
  activeCount = computed(() => this.templates().filter(t => t.isActive).length);
  inactiveCount = computed(() => this.templates().filter(t => !t.isActive).length);
  defaultCount = computed(() => this.templates().filter(t => t.isDefault).length);

  ngOnInit(): void {
    // Wait for translations to load before initializing tabs and table
    this.translationService.getTranslationsLoaded$().pipe(
      distinctUntilChanged(),
      filter(loaded => loaded),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.initializeTabs();
      this.initializeTableConfig();
      this.updateTemplateFilterFields();
    });

    this.initializeFilter();
    this.loadTemplates();
  }

  /**
   * Initialize filter field configuration
   */
  private initializeFilter(): void {
    this.updateTemplateFilterFields();
    this.templateFilterValue = { status: this.activeFilter() };
  }

  /**
   * Update filter fields with latest counts (from current result set / total from API)
   */
  private updateTemplateFilterFields(): void {
    this.templateFilterFields = [
      {
        key: 'status',
        type: 'segment',
        options: [
          { value: 'all', label: this.getFilterLabel('all'), count: this.totalCount() },
          { value: 'active', label: this.getFilterLabel('active'), count: this.activeCount() },
          { value: 'inactive', label: this.getFilterLabel('inactive'), count: this.inactiveCount() },
          { value: 'default', label: this.getFilterLabel('default'), count: this.defaultCount() },
        ],
      },
    ];
  }

  /**
   * Handle filter change from base filter container
   */
  onTemplateFilterChange(value: Record<string, unknown>): void {
    const status = (value['status'] as 'all' | 'active' | 'inactive' | 'default') || 'all';
    this.templateFilterValue = { status };
    this.onFilterChange(status);
  }

  loadTemplates(): void {
    this.loading$.next(true);
    const filter = this.activeFilter();
    const params = {
      pageNumber: this.currentPage(),
      pageSize: this.pageSize(),
      searchTerm: this.searchTerm() || undefined,
      isActive: filter === 'all' ? undefined : filter === 'active' ? true : filter === 'inactive' ? false : undefined,
      isDefault: filter === 'default' ? true : undefined,
      sortBy: 'createdAt',
      sortDescending: true,
    };
    this.contractTemplateService.getContractTemplates(params).pipe(
      takeUntil(this.destroy$),
      catchError(err => {
        this.loading$.next(false);
        this.notificationService.error('Load Failed', err.message || 'Failed to load templates', { duration: 5000 });
        return of({
          items: [] as ContractTemplate[],
          totalCount: 0,
          pageNumber: 1,
          pageSize: this.pageSize(),
          totalPages: 0,
        });
      })
    ).subscribe(result => {
      this.templates.set(result.items);
      this.templatesData$.next(result.items);
      this.totalCount.set(result.totalCount);
      this.totalPages.set(result.totalPages);
      this.loading$.next(false);
      this.updateTemplateFilterFields();
    });
  }

  onFilterChange(filter: 'all' | 'active' | 'inactive' | 'default'): void {
    this.activeFilter.set(filter);
    this.currentPage.set(1);
    this.loadTemplates();
  }

  onSearchChange(searchTerm: string): void {
    this.searchTerm.set(searchTerm);
    this.currentPage.set(1);
    this.loadTemplates();
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
    this.loadTemplates();
  }

  getStatusVariant(isActive: boolean): BadgeVariant {
    return isActive ? 'success' : 'secondary';
  }

  getDefaultVariant(isDefault: boolean): BadgeVariant {
    return isDefault ? 'primary' : 'secondary';
  }

  getFilterCount(filter: string): number {
    if (filter === 'active') return this.activeCount();
    if (filter === 'inactive') return this.inactiveCount();
    if (filter === 'default') return this.defaultCount();
    return this.totalCount();
  }

  onView(template: ContractTemplate): void {
    this.loadingDetail.set(true);
    this.contractTemplateService.getContractTemplateById(template.id).pipe(
      takeUntil(this.destroy$),
      catchError(err => {
        this.loadingDetail.set(false);
        this.notificationService.error('Load Failed', err.message || 'Failed to load template', { duration: 5000 });
        return of(null);
      })
    ).subscribe(full => {
      this.loadingDetail.set(false);
      if (full) {
        this.selectedTemplate = full;
        this.detailMode = 'view';
        this.isDetailModalOpen = true;
      }
    });
  }

  onEdit(template: ContractTemplate): void {
    this.loadingDetail.set(true);
    this.contractTemplateService.getContractTemplateById(template.id).pipe(
      takeUntil(this.destroy$),
      catchError(err => {
        this.loadingDetail.set(false);
        this.notificationService.error('Load Failed', err.message || 'Failed to load template', { duration: 5000 });
        return of(null);
      })
    ).subscribe(full => {
      this.loadingDetail.set(false);
      if (full) {
        this.selectedTemplate = full;
        this.detailMode = 'edit';
        this.isDetailModalOpen = true;
      }
    });
  }

  onDuplicate(template: ContractTemplate): void {
    this.dialogService.confirm({
      title: 'Duplicate Template',
      message: `Create a copy of "${template.name}"?`,
      confirmText: 'Duplicate',
      cancelText: 'Cancel',
      confirmVariant: 'primary',
      icon: 'content_copy',
    }).pipe(first(), filter(c => c)).subscribe(() => {
      this.contractTemplateService.getContractTemplateById(template.id).pipe(
        takeUntil(this.destroy$),
        catchError(err => {
          this.notificationService.error('Load Failed', err.message || 'Failed to load template for duplication', { duration: 5000 });
          return of(null);
        })
      ).subscribe(full => {
        if (!full) return;
        this.contractTemplateService.createContractTemplate({
          name: `Copy of ${full.name}`,
          description: full.description,
          contractType: full.contractType,
          templateContent: full.templateContent,
          variables: full.variables || undefined,
          category: full.category ?? undefined,
          isActive: full.isActive,
          isDefault: false,
          tags: full.tags ?? undefined,
          legalRequirements: full.legalRequirements ?? undefined,
          approvalWorkflow: full.approvalWorkflow ?? undefined,
        }).pipe(
          takeUntil(this.destroy$),
          catchError(err => {
            this.notificationService.error('Duplicate Failed', err.message || 'Failed to duplicate template', { duration: 5000 });
            return of(null);
          })
        ).subscribe(created => {
          if (created) {
            this.notificationService.success('Duplicated', `Template "${created.name}" has been created`, { duration: 3000 });
            this.loadTemplates();
          }
        });
      });
    });
  }

  onDelete(_template: ContractTemplate): void {
    this.notificationService.warning(
      this.translationService.translate('contractTemplates.delete.notSupportedTitle'),
      this.translationService.translate('contractTemplates.delete.notSupportedMessage'),
      { duration: 5000 }
    );
  }

  onTabChange(tabId: string): void {
    this.activeTab.set(tabId as 'list' | 'add');
  }

  onTemplateCreated(): void {
    this.loadTemplates();
    this.activeTab.set('list');
  }

  onTemplateUpdated(): void {
    this.loadTemplates();
    this.isDetailModalOpen = false;
    this.selectedTemplate = null;
  }

  onRowClick = (item: unknown) => this.onView(item as ContractTemplate);
  onRetryLoad = () => this.loadTemplates();
  onCloseDetailModal = () => { this.isDetailModalOpen = false; this.selectedTemplate = null; };
}
