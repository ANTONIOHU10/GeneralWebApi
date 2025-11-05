// Path: GeneralWebApi/Frontend/general-frontend/src/app/features/demo/private-page-container-demo/private-page-container-demo.component.ts
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  BasePrivatePageContainerComponent,
  BaseSearchComponent,
  BaseButtonComponent,
  BaseCardComponent,
  BaseGridComponent,
  BaseTableComponent,
  BaseInputComponent,
  BaseSwitchComponent,
  TabItem,
  TableColumn,
} from '../../../Shared/components/base';
import { NotificationService } from '../../../Shared/services/notification.service';

interface DemoTableData {
  id: number;
  name: string;
  status: string;
  email: string;
}

@Component({
  selector: 'app-private-page-container-demo',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    BasePrivatePageContainerComponent,
    BaseSearchComponent,
    BaseButtonComponent,
    BaseCardComponent,
    BaseGridComponent,
    BaseTableComponent,
    BaseInputComponent,
    BaseSwitchComponent,
  ],
  templateUrl: './private-page-container-demo.component.html',
  styleUrls: ['./private-page-container-demo.component.scss'],
})
export class PrivatePageContainerDemoComponent {
  private notificationService = inject(NotificationService);

  // Tab configuration
  tabs: TabItem[] = [
    { id: 'overview', label: 'Overview', icon: 'dashboard' },
    { id: 'details', label: 'Details', icon: 'info' },
    { id: 'settings', label: 'Settings', icon: 'settings' },
    { id: 'reports', label: 'Reports', icon: 'assessment' },
  ];
  activeTab = 'overview';

  // Table data for demo
  tableData: DemoTableData[] = [
    { id: 1, name: 'John Doe', status: 'Active', email: 'john@example.com' },
    { id: 2, name: 'Jane Smith', status: 'Inactive', email: 'jane@example.com' },
    { id: 3, name: 'Bob Johnson', status: 'Active', email: 'bob@example.com' },
    { id: 4, name: 'Alice Brown', status: 'Pending', email: 'alice@example.com' },
  ];

  tableColumns: TableColumn[] = [
    { key: 'id', label: 'ID', sortable: true },
    { key: 'name', label: 'Name', sortable: true },
    { key: 'status', label: 'Status' },
    { key: 'email', label: 'Email' },
  ];

  // Search value
  searchValue = '';

  // Settings form values
  setting1 = '';
  setting2 = '';
  featureEnabled = false;

  onTabChange(tabId: string): void {
    this.activeTab = tabId;
    this.notificationService.info('Tab Changed', `Switched to ${tabId} tab`);
  }

  onSearchChange(value: string): void {
    this.searchValue = value;
    console.log('Search:', value);
    this.notificationService.info('Search', `Searching for: ${value}`);
  }

  onAddNew(): void {
    this.notificationService.success('Add New', 'Add new item clicked');
  }

  onExport(): void {
    this.notificationService.info('Export', 'Export data clicked');
  }

  onSaveSettings(): void {
    this.notificationService.success('Settings Saved', 'Your settings have been saved');
  }
}



