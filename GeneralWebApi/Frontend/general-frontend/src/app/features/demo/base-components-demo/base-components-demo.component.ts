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
  BaseSwitchComponent,
  BaseTagComponent,
  BaseTextareaComponent,
  BaseAvatarComponent,
  BaseBadgeComponent,
  BaseDatepickerComponent,
  BaseDrawerComponent,
  BaseFileUploadComponent,
  BaseListComponent,
  BaseModalComponent,
  BaseRadioComponent,
  BaseSkeletonComponent,
  BaseTimelineComponent,
  SelectOption,
  TableColumn,
  TableAction,
  RadioOption,
  ListItem,
  TimelineItem
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
    BaseTabsComponent,
    BaseSwitchComponent,
    BaseTagComponent,
    BaseTextareaComponent,
    BaseAvatarComponent,
    BaseBadgeComponent,
    BaseDatepickerComponent,
    BaseDrawerComponent,
    BaseFileUploadComponent,
    BaseListComponent,
    BaseModalComponent,
    BaseRadioComponent,
    BaseSkeletonComponent,
    BaseTimelineComponent
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
  switchValue = false;
  textareaValue = '';
  radioValue = 'option1';
  dateValue = '';

  // Select options
  selectOptions: SelectOption[] = [
    { label: 'Option 1', value: 'option1' },
    { label: 'Option 2', value: 'option2' },
    { label: 'Option 3', value: 'option3' }
  ];

  // Radio options
  radioOptions: RadioOption[] = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' }
  ];

  // List items
  listItems: ListItem[] = [
    { id: 1, title: 'Item 1', description: 'Description for item 1', icon: 'folder' },
    { id: 2, title: 'Item 2', description: 'Description for item 2', icon: 'file' },
    { id: 3, title: 'Item 3', description: 'Description for item 3', icon: 'image' }
  ];

  // Timeline items
  timelineItems: TimelineItem[] = [
    { id: 1, title: 'Project Created', description: 'Initial repository setup', time: '09:00', icon: 'folder' },
    { id: 2, title: 'First Commit', description: 'Add base components', time: '10:30', icon: 'commit' },
    { id: 3, title: 'Build Passed', description: 'CI pipeline success', time: '11:15', icon: 'check_circle' },
    { id: 4, title: 'Demo Ready', description: 'Development demo prepared', time: '14:00', icon: 'rocket_launch' }
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

  // Modal & Drawer states
  isModalOpen = false;
  isDrawerOpen = false;

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

  onSelectChange(option: SelectOption | SelectOption[]): void {
    const selectedOption = Array.isArray(option) ? option[0] : option;
    this.selectValue = selectedOption.value as string;
    this.notificationService.info('Selection Changed', `Selected: ${selectedOption.label}`);
  }

  onSearchChange(value: string): void {
    this.searchValue = value;
    console.log('Search:', value);
  }

  onCheckboxChange(value: boolean): void {
    this.notificationService.info('Checkbox Changed', `Value: ${value}`);
  }

  onSwitchChange(value: boolean): void {
    this.notificationService.info('Switch Changed', `Value: ${value}`);
  }

  onTextareaChange(value: string): void {
    this.notificationService.info('Textarea Changed', value);
  }

  onTagClose(): void {
    this.notificationService.info('Tag Closed', 'Tag was closed');
  }

  onRadioChange(value: string | number): void {
    this.notificationService.info('Radio Changed', `Value: ${value}`);
  }

  onDateChange(value: string): void {
    this.dateValue = value;
    this.notificationService.info('Date Changed', value);
  }

  onDrawerClose(): void {
    this.isDrawerOpen = false;
  }

  onModalClose(): void {
    this.isModalOpen = false;
  }

  openDrawer(): void {
    this.isDrawerOpen = true;
  }

  openModal(): void {
    this.isModalOpen = true;
  }

  onListItemClick(item: ListItem): void {
    this.notificationService.info('List Item Clicked', `Clicked ${item.title}`);
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
