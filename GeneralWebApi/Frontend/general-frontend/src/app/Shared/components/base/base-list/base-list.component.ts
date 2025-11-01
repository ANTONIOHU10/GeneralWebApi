// Path: GeneralWebApi/Frontend/general-frontend/src/app/shared/components/base/base-list/base-list.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseAvatarComponent } from '../base-avatar/base-avatar.component';

export interface ListItem {
  id?: string | number;
  title: string;
  description?: string;
  icon?: string;
  avatar?: string;
  badge?: string | number;
  actionIcon?: string;
  meta?: string[];
  disabled?: boolean;
  last?: boolean;
  data?: unknown;
}

export type ListSize = 'small' | 'medium' | 'large';
export type ListLayout = 'default' | 'comfortable' | 'compact';

@Component({
  selector: 'app-base-list',
  standalone: true,
  imports: [CommonModule, BaseAvatarComponent],
  templateUrl: './base-list.component.html',
  styleUrls: ['./base-list.component.scss'],
})
export class BaseListComponent {
  @Input() items: ListItem[] = [];
  @Input() size: ListSize = 'medium';
  @Input() layout: ListLayout = 'default';
  @Input() showAvatar = false;
  @Input() divider = true;
  @Input() clickable = false;
  @Input() customClass = '';

  @Output() itemClick = new EventEmitter<ListItem>();

  get listClass(): string {
    const classes = [
      'base-list',
      this.size !== 'medium' ? this.size : '',
      this.layout !== 'default' ? this.layout : '',
      this.divider ? 'with-divider' : '',
      this.clickable ? 'clickable' : '',
      this.customClass,
    ].filter(Boolean);

    return classes.join(' ');
  }

  getItemClass(item: ListItem): string {
    const classes = ['list-item'];
    if (item.disabled) classes.push('disabled');
    if (item.last) classes.push('last');
    return classes.join(' ');
  }

  onItemClick(item: ListItem): void {
    if (item.disabled || !this.clickable) return;
    this.itemClick.emit(item);
  }
}



