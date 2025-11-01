// Path: GeneralWebApi/Frontend/general-frontend/src/app/shared/components/base/base-breadcrumb/base-breadcrumb.component.ts
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

export interface BreadcrumbItem {
  label: string;
  path: string;
  icon?: string;
  active?: boolean;
}

@Component({
  selector: 'app-base-breadcrumb',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './base-breadcrumb.component.html',
  styleUrls: ['./base-breadcrumb.component.scss'],
})
export class BaseBreadcrumbComponent {
  @Input() items: BreadcrumbItem[] = [];
  @Input() separator: 'icon' | 'text' = 'icon';
  @Input() separatorText = '/';
  @Input() compact = false;
  @Input() customClass = '';

  get breadcrumbClass(): string {
    const classes = ['breadcrumb'];
    if (this.compact) classes.push('compact');
    if (this.customClass) classes.push(this.customClass);
    return classes.join(' ');
  }
}







