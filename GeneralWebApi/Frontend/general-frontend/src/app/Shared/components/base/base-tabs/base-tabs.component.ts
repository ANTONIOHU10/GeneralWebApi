import { Component, EventEmitter, Input, Output, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface TabItem {
  id: string;
  label: string;
  icon?: string;
  disabled?: boolean;
  badge?: string | number;
}

export type TabSize = 'sm' | 'md' | 'lg';
export type TabVariant = 'default' | 'pills' | 'underline' | 'cards';

export interface TabConfig {
  size?: TabSize;
  variant?: TabVariant;
  showIcons?: boolean;
  showBadges?: boolean;
  centered?: boolean;
  fullWidth?: boolean;
  scrollable?: boolean;
}

@Component({
  selector: 'app-base-tabs',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './base-tabs.component.html',
  styleUrls: ['./base-tabs.component.scss']
})
export class BaseTabsComponent implements OnInit {
  @Input() tabs: TabItem[] = [];
  @Input() activeTabId = '';
  @Input() config: TabConfig = {
    size: 'md',
    variant: 'default',
    showIcons: true,
    showBadges: true,
    centered: false,
    fullWidth: false,
    scrollable: false
  };

  @Input() size: TabSize = 'md';
  @Input() variant: TabVariant = 'default';
  @Input() showIcons = true;
  @Input() showBadges = true;
  @Input() centered = false;
  @Input() fullWidth = false;
  @Input() scrollable = false;

  @Output() tabChange = new EventEmitter<string>();
  @Output() tabClick = new EventEmitter<TabItem>();

  // Internal state
  internalActiveTabId = signal('');

  ngOnInit() {
    this.internalActiveTabId.set(this.activeTabId || (this.tabs.length > 0 ? this.tabs[0].id : ''));
  }

  get displaySize(): TabSize {
    return this.size || this.config.size || 'md';
  }

  get displayVariant(): TabVariant {
    return this.variant || this.config.variant || 'default';
  }

  get displayShowIcons(): boolean {
    return this.showIcons !== undefined ? this.showIcons : (this.config.showIcons ?? true);
  }

  get displayShowBadges(): boolean {
    return this.showBadges !== undefined ? this.showBadges : (this.config.showBadges ?? true);
  }

  get displayCentered(): boolean {
    return this.centered !== undefined ? this.centered : (this.config.centered ?? false);
  }

  get displayFullWidth(): boolean {
    return this.fullWidth !== undefined ? this.fullWidth : (this.config.fullWidth ?? false);
  }

  get displayScrollable(): boolean {
    return this.scrollable !== undefined ? this.scrollable : (this.config.scrollable ?? false);
  }

  get currentActiveTabId(): string {
    return this.internalActiveTabId();
  }

  onTabClick(tab: TabItem) {
    if (tab.disabled) {
      return;
    }

    this.internalActiveTabId.set(tab.id);
    this.tabChange.emit(tab.id);
    this.tabClick.emit(tab);
  }

  isTabActive(tabId: string): boolean {
    return this.currentActiveTabId === tabId;
  }

  getTabClass(tab: TabItem): string {
    const classes = ['tab-button'];
    
    if (this.isTabActive(tab.id)) {
      classes.push('active');
    }
    
    if (tab.disabled) {
      classes.push('disabled');
    }
    
    classes.push(`size-${this.displaySize}`);
    classes.push(`variant-${this.displayVariant}`);
    
    return classes.join(' ');
  }
}
