import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
  HostBinding,
  AfterViewInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  trigger,
  state,
  style,
  transition,
  animate,
} from '@angular/animations';
import {
  NotificationData,
  NotificationAction,
} from '../../../services/notification.service';

@Component({
  selector: 'app-base-notification',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './base-notification.component.html',
  styleUrls: ['./base-notification.component.scss'],
  animations: [
    trigger('slideIn', [
      state('in', style({ transform: 'translateX(0)', opacity: 1 })),
      transition('void => *', [
        style({ transform: 'translateX(100%)', opacity: 0 }),
        animate(
          '300ms cubic-bezier(0.4, 0, 0.2, 1)',
          style({ transform: 'translateX(0)', opacity: 1 })
        ),
      ]),
      transition('* => void', [
        animate(
          '300ms cubic-bezier(0.4, 0, 0.2, 1)',
          style({ transform: 'translateX(100%)', opacity: 0 })
        ),
      ]),
    ]),
    trigger('fadeIn', [
      state('in', style({ opacity: 1, transform: 'scale(1)' })),
      transition('void => *', [
        style({ opacity: 0, transform: 'scale(0.8)' }),
        animate('200ms ease-out', style({ opacity: 1, transform: 'scale(1)' })),
      ]),
      transition('* => void', [
        animate(
          '200ms ease-in',
          style({ opacity: 0, transform: 'scale(0.8)' })
        ),
      ]),
    ]),
  ],
})
export class BaseNotificationComponent
  implements OnInit, OnDestroy, AfterViewInit
{
  @Input() notification!: NotificationData;
  // index = Z index
  @Input() index = 0;
  @Input() total = 1;
  @Output() notificationClose = new EventEmitter<string>();
  @Output() actionClick = new EventEmitter<NotificationAction>();
  @Output() notificationClick = new EventEmitter<NotificationData>();
  @Output() dismiss = new EventEmitter<string>();

  @HostBinding('class')
  get hostClass(): string {
    return [
      'base-notification',
      `base-notification--${this.notification.type}`,
      `base-notification--${this.notification.priority || 'normal'}`,
      this.notification.closable ? 'base-notification--closable' : '',
      this.notification.clickable ? 'base-notification--clickable' : '',
      this.notification.persistent ? 'base-notification--persistent' : '',
      this.notification.customClass || '',
    ]
      .filter(Boolean)
      .join(' ');
  }

  @HostBinding('style.max-width')
  get maxWidth(): string {
    return this.notification.maxWidth || '400px';
  }

  @HostBinding('style.z-index')
  get zIndex(): number {
    return 1000 + this.index;
  }

  private timer?: ReturnType<typeof setTimeout>;
  protected isHovered = false;
  protected isDismissed = false;
  private actionLoadingStates = new Map<string, boolean>();
  private timerStartTime?: number;
  private remainingDuration?: number;

  ngOnInit(): void {
    this.setupAutoClose();
  }

  ngAfterViewInit(): void {
    // Removed IntersectionObserver as it conflicts with hover logic
  }

  ngOnDestroy(): void {
    this.clearTimers();
  }

  private setupAutoClose(): void {
    if (
      this.notification.autoClose !== false &&
      this.notification.duration &&
      this.notification.duration > 0 &&
      !this.notification.persistent
    ) {
      this.startTimer(this.notification.duration);
    }
  }

  private startTimer(duration: number): void {
    this.clearTimers();
    this.timerStartTime = Date.now();
    this.remainingDuration = duration;
    
    this.timer = setTimeout(() => {
      this.closeNotification();
    }, duration);
  }

  private pauseTimers(): void {
    if (this.timer && this.timerStartTime && this.remainingDuration) {
      // Calculate remaining time
      const elapsed = Date.now() - this.timerStartTime;
      this.remainingDuration = Math.max(0, this.remainingDuration - elapsed);
      this.clearTimers();
      this.timerStartTime = undefined;
    }
  }

  private resumeTimers(): void {
    if (
      this.remainingDuration !== undefined &&
      this.remainingDuration > 0 &&
      !this.isDismissed &&
      !this.notification.persistent
    ) {
      this.startTimer(this.remainingDuration);
    }
  }

  private clearTimers(): void {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = undefined;
    }
    this.timerStartTime = undefined;
  }

  closeNotification(): void {
    this.isDismissed = true;
    this.clearTimers();
    this.notificationClose.emit(this.notification.id);
  }

  dismissNotification(): void {
    this.isDismissed = true;
    this.clearTimers();
    this.dismiss.emit(this.notification.id);
  }

  async executeAction(action: NotificationAction): Promise<void> {
    if (action.disabled || this.isActionLoading(action.id)) return;

    this.actionLoadingStates.set(action.id, true);
    this.actionClick.emit(action);

    try {
      await action.action();
    } catch (error) {
      console.error('Action execution failed:', error);
    } finally {
      this.actionLoadingStates.set(action.id, false);
    }
  }

  onNotificationClick(): void {
    if (this.notification.clickable) {
      this.notificationClick.emit(this.notification);
    }
  }

  onMouseEnter(): void {
    this.isHovered = true;
    this.pauseTimers();
  }

  onMouseLeave(): void {
    this.isHovered = false;
    if (!this.isDismissed) {
      this.resumeTimers();
    }
  }

  getNotificationIcon(): string {
    if (this.notification.icon) {
      return this.notification.icon;
    }

    const iconMap = {
      success: 'check_circle',
      error: 'error',
      warning: 'warning',
      info: 'info',
    };

    return iconMap[this.notification.type] || 'info';
  }

  getActionClass(action: NotificationAction): string {
    const classes = [
      'notification__action',
      `notification__action--${action.variant || 'secondary'}`,
      action.disabled ? 'notification__action--disabled' : '',
      this.actionLoadingStates.get(action.id)
        ? 'notification__action--loading'
        : '',
    ].filter(Boolean);

    return classes.join(' ');
  }

  isActionLoading(actionId: string): boolean {
    return this.actionLoadingStates.get(actionId) || false;
  }
}
