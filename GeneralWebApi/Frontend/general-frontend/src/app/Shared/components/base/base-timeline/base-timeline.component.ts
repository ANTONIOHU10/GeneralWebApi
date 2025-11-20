// Path: GeneralWebApi/Frontend/general-frontend/src/app/shared/components/base/base-timeline/base-timeline.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface TimelineItem {
  id?: string | number;
  title: string;
  description?: string;
  time?: string;
  icon?: string;
  color?: string;
  last?: boolean;
  data?: unknown;
}

export type TimelineLayout = 'vertical' | 'horizontal';
export type TimelineMode = 'left' | 'right' | 'alternate';

@Component({
  selector: 'app-base-timeline',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './base-timeline.component.html',
  styleUrls: ['./base-timeline.component.scss'],
})
export class BaseTimelineComponent {
  @Input() items: TimelineItem[] = [];
  @Input() layout: TimelineLayout = 'vertical';
  @Input() mode: TimelineMode = 'left';
  @Input() customClass = '';

  @Output() itemClick = new EventEmitter<TimelineItem>();

  get timelineClass(): string {
    const classes = [
      'base-timeline',
      `layout-${this.layout}`,
      `mode-${this.mode}`,
      this.customClass,
    ].filter(Boolean);

    return classes.join(' ');
  }

  getItemClass(item: TimelineItem): string {
    const classes = ['timeline-item'];
    if (item.last) classes.push('last');
    return classes.join(' ');
  }

  onItemClick(item: TimelineItem): void {
    this.itemClick.emit(item);
  }
}
















