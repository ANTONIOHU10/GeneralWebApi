// Path: GeneralWebApi/Frontend/general-frontend/src/app/shared/components/base/base-skeleton/base-skeleton.component.ts
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type SkeletonVariant = 'default' | 'text' | 'avatar' | 'button' | 'image' | 'card';

@Component({
  selector: 'app-base-skeleton',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './base-skeleton.component.html',
  styleUrls: ['./base-skeleton.component.scss'],
})
export class BaseSkeletonComponent {
  @Input() variant: SkeletonVariant = 'default';
  @Input() lines = 3;
  @Input() textLines = 4;
  @Input() animate = true;
  @Input() customClass = '';

  get skeletonClass(): string {
    const classes = ['skeleton', this.variant, this.customClass].filter(Boolean);
    return classes.join(' ');
  }

  get linesArray(): number[] {
    return Array(this.lines).fill(0).map((_, i) => i);
  }

  get textLinesArray(): number[] {
    return Array(this.textLines).fill(0).map((_, i) => i);
  }
}

