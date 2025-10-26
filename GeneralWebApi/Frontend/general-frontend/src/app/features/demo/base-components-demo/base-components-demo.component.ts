import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  BaseButtonComponent,
  BaseInputComponent,
  BaseSelectComponent,
  BaseCheckboxComponent,
  BaseSearchComponent,
  BaseCardComponent,
  BaseContainerComponent,
  BasePageHeaderComponent,
  BaseGridComponent,
  BaseTableComponent,
  BasePaginationComponent,
  BaseLoadingComponent,
  BaseErrorComponent,
  BaseEmptyComponent,
  BaseTabsComponent,
  SelectOption,
  TableColumn,
  TableAction
} from '../../../Shared/components/base';
import { NotificationService } from '../../../Shared/services/notification.service';
import { HttpClient } from '@angular/common/http';

interface DemoTableData {
  id: number;
  name: string;
  status: string;
  email: string;
}

@Component({
  selector: 'app-base-components-demo',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    BaseButtonComponent,
    BaseInputComponent,
    BaseSelectComponent,
    BaseCheckboxComponent,
    BaseSearchComponent,
    BaseCardComponent,
    BaseContainerComponent,
    BasePageHeaderComponent,
    BaseGridComponent,
    BaseTableComponent,
    BasePaginationComponent,
    BaseLoadingComponent,
    BaseErrorComponent,
    BaseEmptyComponent,
    BaseTabsComponent
  ],
  templateUrl: './base-components-demo.component.html',
  styleUrls: ['./base-components-demo.component.scss']
})
export class BaseComponentsDemoComponent {
  // Form inputs
  inputValue = '';
  selectValue = '';
  searchValue = '';
  checkboxValue = false;

  // Select options
  selectOptions: SelectOption[] = [
    { label: 'Option 1', value: 'option1' },
    { label: 'Option 2', value: 'option2' },
    { label: 'Option 3', value: 'option3' }
  ];

  // Table data
  tableData: DemoTableData[] = [
    { id: 1, name: 'John Doe', status: 'Active', email: 'john@example.com' },
    { id: 2, name: 'Jane Smith', status: 'Inactive', email: 'jane@example.com' },
    { id: 3, name: 'Bob Johnson', status: 'Active', email: 'bob@example.com' }
  ];

  tableColumns: TableColumn[] = [
    { key: 'id', label: 'ID', sortable: true },
    { key: 'name', label: 'Name', sortable: true },
    { key: 'status', label: 'Status' },
    { key: 'email', label: 'Email' }
  ];

  tableActions: TableAction[] = [
    {
      label: 'Edit',
      icon: 'edit',
      onClick: (row: unknown) => {
        const data = row as DemoTableData;
        this.notificationService.info('Edit', `Editing ${data.name}`);
      }
    },
    {
      label: 'Delete',
      icon: 'delete',
      onClick: (row: unknown) => {
        const data = row as DemoTableData;
        this.notificationService.warning('Delete', `Deleting ${data.name}`);
      },
      variant: 'danger'
    }
  ];

  // Pagination
  currentPage = 1;
  totalPages = 10;
  pageSize = 10;

  // Loading states
  isLoading = false;
  showError = false;
  showEmpty = false;

  // Tabs
  selectedTab = 0;
  tabs = [
    { id: 'form', label: 'Form Components', icon: 'edit_square' },
    { id: 'layout', label: 'Layout Components', icon: 'dashboard' },
    { id: 'data', label: 'Data Display', icon: 'table_chart' },
    { id: 'feedback', label: 'Feedback', icon: 'feedback' }
  ];

  private notificationService = inject(NotificationService);
  private http = inject(HttpClient);

  // Button actions
  onButtonClick(variant: string): void {
    this.notificationService.success('Button Clicked', `Clicked ${variant} button`);
  }

  // Form actions
  onInputChange(value: string): void {
    this.notificationService.info('Input Changed', value);
  }

  onSelectChange(value: string): void {
    this.notificationService.info('Selection Changed', `Selected: ${value}`);
  }

  onSearchChange(value: string): void {
    console.log('Search:', value);
  }

  onCheckboxChange(value: boolean): void {
    this.notificationService.info('Checkbox Changed', `Value: ${value}`);
  }

  // Table actions
  onPageChange(page: number): void {
    this.currentPage = page;
    this.notificationService.info('Page Changed', `Page ${page}`);
  }

  // Loading demo
  async showLoading(): Promise<void> {
    this.isLoading = true;
    setTimeout(() => {
      this.isLoading = false;
      this.notificationService.success('Loading Complete', 'Data loaded successfully');
    }, 2000);
  }

  // Error demo
  showErrorState(): void {
    this.showError = true;
    setTimeout(() => {
      this.showError = false;
    }, 3000);
  }

  // Empty state demo
  showEmptyState(): void {
    this.showEmpty = true;
    setTimeout(() => {
      this.showEmpty = false;
    }, 3000);
  }

  // Tab change
  onTabChange(index: number): void {
    this.selectedTab = index;
  }

  onTabChangeFromId(tabId: string): void {
    const index = this.tabs.findIndex(t => t.id === tabId);
    if (index !== -1) {
      this.selectedTab = index;
    }
  }

  get activeTabId(): string {
    return this.tabs[this.selectedTab]?.id || '';
  }

  // API simulation
  async simulateApiCall(): Promise<void> {
    this.isLoading = true;
    try {
      // 模拟 API 调用
      await new Promise(resolve => setTimeout(resolve, 2000));
      this.notificationService.success('API Call', 'Successfully completed API call');
    } catch {
      this.notificationService.error('API Error', 'Failed to complete API call');
    } finally {
      this.isLoading = false;
    }
  }
}
