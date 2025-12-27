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
import { TranslatePipe } from '@core/pipes/translate.pipe';

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
    TranslatePipe,
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
   * Navigate to appropriate page based on notification type
   */
  onNotificationItemClick(notification: Notification): void {
    this.isOpen = false;
    this.notificationItemClick.emit(notification);
    
    // Handle navigation based on notification type
    if (notification.type === 'approval') {
      // For approval notifications, navigate to approval detail page
      const approvalId = this.getApprovalId(notification);
      if (approvalId) {
        this.router.navigate(['/private/approvals', approvalId]);
      } else if (notification.actionUrl) {
        // Fallback to actionUrl if approvalId is not available
        const normalizedUrl = this.normalizeActionUrl(notification.actionUrl);
        if (normalizedUrl) {
          this.router.navigateByUrl(normalizedUrl);
        }
      }
    } else if (notification.actionUrl) {
      // For other notification types, normalize and use actionUrl if available
      const normalizedUrl = this.normalizeActionUrl(notification.actionUrl);
      if (normalizedUrl) {
        this.router.navigateByUrl(normalizedUrl);
      }
    }
  }

  /**
   * Normalize action URL to handle routes that don't exist
   * Converts detail routes to list routes when detail route doesn't exist
   */
  private normalizeActionUrl(actionUrl: string): string {
    if (!actionUrl) return actionUrl;
    
    // Handle contracts detail routes - frontend doesn't have /private/contracts/:id route
    // Convert to list route
    const contractsDetailMatch = actionUrl.match(/^\/private\/contracts\/(\d+)$/);
    if (contractsDetailMatch) {
      return '/private/contracts';
    }
    
    // Handle other potential detail routes that don't exist
    // Add more patterns here if needed
    
    return actionUrl;
  }

  /**
   * Get approval ID from notification
   * Checks sourceId, actionData.approvalId, or extracts from actionUrl
   */
  private getApprovalId(notification: Notification): string | null {
    // First, try to get from sourceId
    if (notification.sourceId) {
      return notification.sourceId;
    }
    
    // Second, try to get from actionData
    if (notification.actionData && typeof notification.actionData === 'object') {
      const approvalId = (notification.actionData as Record<string, unknown>)['approvalId'];
      if (approvalId) {
        return String(approvalId);
      }
    }
    
    // Third, try to extract from metadata
    if (notification.metadata && typeof notification.metadata === 'object') {
      const approvalId = (notification.metadata as Record<string, unknown>)['approvalId'];
      if (approvalId) {
        return String(approvalId);
      }
    }
    
    // Fourth, try to extract from actionUrl if it contains an ID
    if (notification.actionUrl) {
      const match = notification.actionUrl.match(/(?:approvalId=|approvals\/)(\d+)/);
      if (match && match[1]) {
        return match[1];
      }
    }
    
    return null;
  }


  ngOnInit(): void {
    // Component initialization if needed
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

