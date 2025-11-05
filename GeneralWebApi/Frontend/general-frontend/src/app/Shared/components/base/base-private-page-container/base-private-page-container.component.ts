// Path: GeneralWebApi/Frontend/general-frontend/src/app/shared/components/base/base-private-page-container/base-private-page-container.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseTabsComponent, TabItem } from '../base-tabs/base-tabs.component';

@Component({
  selector: 'app-base-private-page-container',
  standalone: true,
  imports: [CommonModule, BaseTabsComponent],
  templateUrl: './base-private-page-container.component.html',
  styleUrls: ['./base-private-page-container.component.scss'],
})
export class BasePrivatePageContainerComponent {
  @Input() title = '';
  @Input() subtitle = '';
  @Input() icon = '';
  @Input() tabs: TabItem[] = [];
  @Input() activeTabId = '';
  @Input() showTabs = false;
  @Input() showSearch = false;
  @Input() searchPlaceholder = 'Search...';
  @Input() searchValue = '';
  @Input() customClass = '';

  @Output() tabChange = new EventEmitter<string>();
  @Output() searchChange = new EventEmitter<string>();

  onTabChange(tabId: string): void {
    this.tabChange.emit(tabId);
  }

  onSearchChange(value: string): void {
    this.searchChange.emit(value);
  }
}
