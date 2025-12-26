// Path: GeneralWebApi/Frontend/general-frontend/src/app/Shared/components/header/components/notification-dropdown/notification-dropdown.component.ts
import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, inject, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NotificationService } from '@core/services/notification.service';
import { Notification } from 'app/contracts/notifications/notification.model';
import { catchError, of } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { NotificationItemComponent } from './components/notification-item/notification-item.component';
import { BaseLoadingComponent } from '../../../base/base-loading/base-loading.component';
import { BaseEmptyComponent } from '../../../base/base-empty/base-empty.component';

@Component({
  standalone: true,
  selector: 'app-notification-dropdown',
  templateUrl: './notification-dropdown.component.html',
  styleUrls: ['./notification-dropdown.component.scss'],
  imports: [
    CommonModule,
    NotificationItemComponent,
    BaseLoadingComponent,
    BaseEmptyComponent,
  ],
})
export class NotificationDropdownComponent implements OnInit, OnDestroy {
  @Input() notificationCount = 0;
  @Output() viewAllClick = new EventEmitter<void>();
  @Output() notificationItemClick = new EventEmitter<Notification>();

  private notificationService = inject(NotificationService);
  private router = inject(Router);
  private elementRef = inject(ElementRef);
  private destroy$ = new Subject<void>();

  isOpen = false;
  recentNotifications: Notification[] = [];
  isLoadingNotifications = false;

  /**
   * Toggle dropdown open/close
   */
  toggleDropdown(event: Event): void {
    event.stopPropagation();
    this.isOpen = !this.isOpen;
    
    if (this.isOpen) {
      this.loadRecentNotifications();
    }
  }

  /**
   * Close dropdown when clicking outside
   */
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.isOpen && !this.elementRef.nativeElement.contains(event.target)) {
      this.isOpen = false;
    }
  }

  /**
   * Load recent notifications (last 5 unread or recent)
   */
  private loadRecentNotifications(): void {
    if (this.isLoadingNotifications) return;
    
    this.isLoadingNotifications = true;
    this.notificationService.getNotifications({
      pageNumber: 1,
      pageSize: 5,
      includeExpired: false,
    }).pipe(
      takeUntil(this.destroy$),
      catchError((error) => {
        console.error('Failed to load recent notifications:', error);
        this.isLoadingNotifications = false;
        return of({ items: [], totalCount: 0, pageNumber: 1, pageSize: 5 });
      })
    ).subscribe({
      next: (response) => {
        this.recentNotifications = response.items.map(item => 
          this.notificationService.transformToNotification(item)
        );
        this.isLoadingNotifications = false;
      }
    });
  }

  /**
   * Handle view all notifications click
   */
  onViewAllClick(): void {
    this.isOpen = false;
    this.viewAllClick.emit();
    this.router.navigate(['/private/notifications']);
  }

  /**
   * Handle notification item click
   */
  onNotificationItemClick(notification: Notification): void {
    this.isOpen = false;
    this.notificationItemClick.emit(notification);
    if (notification.actionUrl) {
      this.router.navigate([notification.actionUrl]);
    }
  }


  ngOnInit(): void {
    // Component initialization if needed
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

