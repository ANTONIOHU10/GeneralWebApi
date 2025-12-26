// Path: GeneralWebApi/Frontend/general-frontend/src/app/features/contract-templates/contract-template-list/contract-template-list.component.ts
import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BehaviorSubject, delay, of, Subject } from 'rxjs';
import { first, catchError, filter, take, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import {
  BasePrivatePageContainerComponent,
  BaseAsyncStateComponent,
  BaseTableComponent,
  BaseCardComponent,
  BaseBadgeComponent,
  BaseSearchComponent,
  TabItem,
  TableColumn,
  TableAction,
  BadgeVariant,
} from '../../../Shared/components/base';
import { NotificationService, DialogService } from '../../../Shared/services';
import { TranslationService } from '@core/services/translation.service';
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
  private destroy$ = new Subject<void>();

  templates = signal<ContractTemplate[]>([]);
  loading$ = new BehaviorSubject<boolean>(false);
  templatesData$ = new BehaviorSubject<ContractTemplate[] | null>(null);
  activeFilter = signal<'all' | 'active' | 'inactive' | 'default'>('all');
  searchTerm = signal<string>('');
  activeTab = signal<'list' | 'add'>('list');

  selectedTemplate: ContractTemplate | null = null;
  isDetailModalOpen = false;
  detailMode: 'edit' | 'view' = 'view';

  filterOptions: ('all' | 'active' | 'inactive' | 'default')[] = ['all', 'active', 'inactive', 'default'];
  tabs: TabItem[] = [];
  tableColumns: TableColumn[] = [];
  tableActions: TableAction[] = [];

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

  // Computed statistics
  activeCount = computed(() => this.allTemplates.filter(t => t.isActive).length);
  inactiveCount = computed(() => this.allTemplates.filter(t => !t.isActive).length);
  defaultCount = computed(() => this.allTemplates.filter(t => t.isDefault).length);

  private allTemplates: ContractTemplate[] = [
    {
      id: 1,
      name: 'Standard Employment Contract',
      description: 'Standard full-time employment contract template',
      contractType: 'Indefinite',
      templateContent: 'This is a standard employment contract...',
      variables: '{"employeeName":"string","position":"string","salary":"number"}',
      category: 'Employment',
      isActive: true,
      isDefault: true,
      usageCount: 45,
      tags: '["standard","employment","full-time"]',
      legalRequirements: 'Must comply with local labor laws',
      approvalWorkflow: '{"steps":2}',
      version: 1,
      parentTemplateId: null,
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: null,
    },
    {
      id: 2,
      name: 'Fixed-Term Contract',
      description: 'Fixed-term employment contract template',
      contractType: 'Fixed',
      templateContent: 'This is a fixed-term contract...',
      variables: '{"employeeName":"string","position":"string","startDate":"date","endDate":"date"}',
      category: 'Employment',
      isActive: true,
      isDefault: false,
      usageCount: 23,
      tags: '["fixed-term","employment"]',
      legalRequirements: null,
      approvalWorkflow: null,
      version: 1,
      parentTemplateId: null,
      createdAt: '2024-02-01T10:00:00Z',
      updatedAt: null,
    },
    {
      id: 3,
      name: 'Part-Time Contract',
      description: 'Part-time employment contract template',
      contractType: 'PartTime',
      templateContent: 'This is a part-time contract...',
      variables: '{"employeeName":"string","position":"string","hoursPerWeek":"number"}',
      category: 'Employment',
      isActive: true,
      isDefault: false,
      usageCount: 12,
      tags: '["part-time","employment"]',
      legalRequirements: null,
      approvalWorkflow: null,
      version: 1,
      parentTemplateId: null,
      createdAt: '2024-03-10T10:00:00Z',
      updatedAt: null,
    },
    {
      id: 4,
      name: 'Consulting Agreement',
      description: 'Consulting services agreement template',
      contractType: 'Consulting',
      templateContent: 'This is a consulting agreement...',
      variables: '{"consultantName":"string","projectName":"string","rate":"number"}',
      category: 'Consulting',
      isActive: true,
      isDefault: false,
      usageCount: 8,
      tags: '["consulting","service"]',
      legalRequirements: null,
      approvalWorkflow: null,
      version: 1,
      parentTemplateId: null,
      createdAt: '2024-04-05T10:00:00Z',
      updatedAt: null,
    },
    {
      id: 5,
      name: 'NDA Template',
      description: 'Non-disclosure agreement template',
      contractType: 'NDA',
      templateContent: 'This is an NDA template...',
      variables: '{"partyName":"string","confidentialInfo":"string"}',
      category: 'NDA',
      isActive: false,
      isDefault: false,
      usageCount: 0,
      tags: '["nda","legal"]',
      legalRequirements: null,
      approvalWorkflow: null,
      version: 1,
      parentTemplateId: null,
      createdAt: '2024-05-01T10:00:00Z',
      updatedAt: '2024-05-15T10:00:00Z',
    },
  ];

  ngOnInit(): void {
    // Wait for translations to load before initializing tabs and table
    this.translationService.getTranslationsLoaded$().pipe(
      distinctUntilChanged(),
      filter(loaded => loaded),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.initializeTabs();
      this.initializeTableConfig();
    });

    this.loadTemplates();
  }

  loadTemplates(): void {
    this.loading$.next(true);
    of(this.allTemplates).pipe(delay(500), first(), catchError(err => {
      this.loading$.next(false);
      this.notificationService.error('Load Failed', err.message || 'Failed to load templates', { duration: 5000 });
      return of([]);
    })).subscribe(templates => {
      let filtered = templates;
      
      // Apply status filter
      const filter = this.activeFilter();
      if (filter === 'active') {
        filtered = filtered.filter(t => t.isActive);
      } else if (filter === 'inactive') {
        filtered = filtered.filter(t => !t.isActive);
      } else if (filter === 'default') {
        filtered = filtered.filter(t => t.isDefault);
      }

      // Apply search filter
      const search = this.searchTerm().toLowerCase();
      if (search) {
        filtered = filtered.filter(t =>
          t.name.toLowerCase().includes(search) ||
          t.description.toLowerCase().includes(search) ||
          t.contractType.toLowerCase().includes(search) ||
          t.category?.toLowerCase().includes(search)
        );
      }

      this.templates.set(filtered);
      this.templatesData$.next(filtered);
      this.loading$.next(false);
    });
  }

  onFilterChange(filter: 'all' | 'active' | 'inactive' | 'default'): void {
    this.activeFilter.set(filter);
    this.loadTemplates();
  }

  onSearchChange(searchTerm: string): void {
    this.searchTerm.set(searchTerm);
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
    return this.allTemplates.length;
  }

  onView(template: ContractTemplate): void {
    this.selectedTemplate = template;
    this.detailMode = 'view';
    this.isDetailModalOpen = true;
  }

  onEdit(template: ContractTemplate): void {
    this.selectedTemplate = template;
    this.detailMode = 'edit';
    this.isDetailModalOpen = true;
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
      this.notificationService.success('Duplicated', `Template "${template.name}" has been duplicated`, { duration: 3000 });
      this.loadTemplates();
    });
  }

  onDelete(template: ContractTemplate): void {
    this.dialogService.confirm({
      title: 'Delete Template',
      message: `Delete template "${template.name}"? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      confirmVariant: 'danger',
      icon: 'warning',
    }).pipe(first(), filter(c => c)).subscribe(() => {
      const updated = this.templates().filter(t => t.id !== template.id);
      this.templates.set(updated);
      this.templatesData$.next(updated);
      this.notificationService.success('Deleted', `Template "${template.name}" has been deleted`, { duration: 3000 });
    });
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
