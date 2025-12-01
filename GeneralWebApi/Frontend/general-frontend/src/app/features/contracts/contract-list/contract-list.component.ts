// Path: GeneralWebApi/Frontend/general-frontend/src/app/features/contracts/contract-list/contract-list.component.ts
import { Component, signal, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, Observable, BehaviorSubject } from 'rxjs';
import { takeUntil, filter, take, catchError } from 'rxjs/operators';
import { ContractCardComponent } from '../contract-card/contract-card.component';
import { AddContractComponent } from '../add-contract/add-contract.component';
import { ContractDetailComponent } from '../contract-detail/contract-detail.component';
import { SearchContractComponent } from '../search-contract/search-contract.component';
import { SubmitContractApprovalComponent } from '../submit-contract-approval/submit-contract-approval.component';
import {
  BasePrivatePageContainerComponent,
  BaseSearchComponent,
  BaseAsyncStateComponent,
  TabItem,
} from '../../../Shared/components/base';
import { Contract } from 'app/contracts/contracts/contract.model';
import {
  DialogService,
  NotificationService,
} from '../../../Shared/services';
import { ContractService } from '../../../core/services/contract.service';
import { of } from 'rxjs';

@Component({
  selector: 'app-contract-list',
  standalone: true,
  imports: [
    CommonModule,
    ContractCardComponent,
    AddContractComponent,
    ContractDetailComponent,
    SearchContractComponent,
    SubmitContractApprovalComponent,
    BasePrivatePageContainerComponent,
    BaseSearchComponent,
    BaseAsyncStateComponent,
  ],
  templateUrl: './contract-list.component.html',
  styleUrls: ['./contract-list.component.scss'],
})
export class ContractListComponent implements OnInit, OnDestroy {
  private dialogService = inject(DialogService);
  private notificationService = inject(NotificationService);
  private contractService = inject(ContractService);
  private destroy$ = new Subject<void>();

  // Local state
  contracts$ = new BehaviorSubject<Contract[]>([]);
  loading$ = new BehaviorSubject<boolean>(false);
  error$ = new BehaviorSubject<string | null>(null);

  // Local state
  activeTab = signal<'list' | 'add' | 'search' | 'submit-approval'>('list');
  selectedContractForDetail: Contract | null = null;
  isDetailModalOpen = false;
  detailMode: 'edit' | 'view' = 'view';
  searchTerm = signal<string>('');

  // Tab configuration
  tabs: TabItem[] = [
    { id: 'list', label: 'Contract List', icon: 'list' },
    { id: 'add', label: 'Add Contract', icon: 'add' },
    { id: 'submit-approval', label: 'Submit for Approval', icon: 'check_circle' },
    { id: 'search', label: 'Search Contract', icon: 'search' },
  ];

  ngOnInit() {
    this.loadContracts();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadContracts(searchTerm?: string) {
    console.log('🔄 Loading contracts...');
    this.loading$.next(true);
    this.error$.next(null);

    const params = {
      pageNumber: 1,
      pageSize: 100, // Load first 100 contracts
      ...(searchTerm && searchTerm.trim() ? { searchTerm: searchTerm.trim() } : {}),
    };

    this.contractService.getContracts(params).pipe(
      takeUntil(this.destroy$),
      catchError(error => {
        const errorMessage = error.message || 'Failed to load contracts';
        this.error$.next(errorMessage);
        this.loading$.next(false);
        this.notificationService.error(
          'Load Failed',
          errorMessage,
          { duration: 5000, persistent: false, autoClose: true }
        );
        return of(null);
      })
    ).subscribe({
      next: (response) => {
        if (response?.data) {
          this.contracts$.next(response.data);
          this.loading$.next(false);
          console.log('✅ Contracts loaded:', response.data.length);
        } else {
          this.contracts$.next([]);
          this.loading$.next(false);
        }
      }
    });
  }

  onEditContract(contract: Contract) {
    this.selectedContractForDetail = contract;
    this.detailMode = 'edit';
    this.isDetailModalOpen = true;
  }

  onDeleteContract(contract: Contract) {
    const employeeName = contract.employeeName || 'Unknown';

    const confirm$: Observable<boolean> = this.dialogService.confirm({
      title: 'Confirm Delete',
      message: `Are you sure you want to delete the contract for ${employeeName}? This action cannot be undone.`,
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
      this.loading$.next(true);

      this.contractService.deleteContract(contract.id).pipe(
        takeUntil(this.destroy$),
        catchError(error => {
          this.loading$.next(false);
          this.notificationService.error(
            'Delete Failed',
            error.message || 'Failed to delete contract',
            { duration: 5000, persistent: false, autoClose: true }
          );
          return of(null);
        })
      ).subscribe({
        next: () => {
          // Reload contracts after successful deletion
          this.loadContracts(this.searchTerm());
          this.notificationService.success(
            'Contract Deleted',
            `Contract for ${employeeName} has been deleted successfully`,
            { duration: 3000, autoClose: true }
          );
        }
      });
    });
  }

  onViewContract(contract: Contract) {
    this.selectedContractForDetail = contract;
    this.detailMode = 'view';
    this.isDetailModalOpen = true;
  }

  onCloseDetailModal() {
    this.isDetailModalOpen = false;
    this.selectedContractForDetail = null;
    this.detailMode = 'view';
  }

  onContractUpdated(contract: Contract) {
    // Update contract in local state
    const currentContracts = this.contracts$.value;
    const updatedContracts = currentContracts.map(c =>
      c.id === contract.id ? contract : c
    );
    this.contracts$.next(updatedContracts);
  }

  onContractCreated() {
    // Reload contracts
    this.loadContracts();
    // Switch to list tab
    this.setActiveTab('list');
  }

  setActiveTab(tab: 'list' | 'add' | 'search' | 'submit-approval'): void {
    this.activeTab.set(tab);
  }

  onTabChange(tabId: string): void {
    const newTab = tabId as 'list' | 'add' | 'search' | 'submit-approval';
    this.setActiveTab(newTab);
  }

  onApprovalSubmitted(): void {
    // Reload contracts to reflect status changes
    this.loadContracts();
    // Switch to list tab
    this.setActiveTab('list');
  }

  onSearchChange(searchTerm: string) {
    this.searchTerm.set(searchTerm);
    // Reload contracts with search term from backend
    this.loadContracts(searchTerm);
  }

  clearError() {
    this.error$.next(null);
  }

  onRetryLoad = () => {
    this.loadContracts();
  };

  onEmptyActionClick = () => {
    this.setActiveTab('add');
  };
}
