// Path: GeneralWebApi/Frontend/general-frontend/src/app/core/services/notification-providers/task-notification.provider.ts
import { Injectable, inject } from '@angular/core';
import { firstValueFrom, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { NotificationService } from '../notification.service';
import { 
  Notification, 
  NotificationProvider, 
  NotificationType,
  NotificationPriority 
} from 'app/contracts/notifications/notification.model';
import { TaskService } from '../task.service';
import { Task } from 'app/contracts/tasks/task.model';

/**
 * Task Notification Provider
 * Provides notifications for task reminders and updates
 */
@Injectable({
  providedIn: 'root',
})
export class TaskNotificationProvider implements NotificationProvider {
  private taskService = inject(TaskService);
  private notificationService = inject(NotificationService);

  getType(): NotificationType {
    return 'task';
  }

  async getNotifications(): Promise<Notification[]> {
    try {
      const response = await firstValueFrom(
        this.taskService.getTasks({ pageNumber: 1, pageSize: 100 })
      );

      if (!response?.data || response.data.length === 0) {
        return [];
      }

      const notifications: Notification[] = [];
      const now = new Date();

      response.data.forEach((task) => {
        // Task due soon (within 3 days)
        if (task.dueDate && task.status !== 'Completed' && task.status !== 'Cancelled') {
          const dueDate = new Date(task.dueDate);
          const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          
          if (daysUntilDue <= 3 && daysUntilDue >= 0) {
            notifications.push(this.createDueSoonNotification(task, daysUntilDue));
          } else if (daysUntilDue < 0) {
            notifications.push(this.createOverdueNotification(task, Math.abs(daysUntilDue)));
          }
        }

        // High priority pending tasks
        if (task.status === 'Pending' && (task.priority === 'High' || task.priority === 'Urgent')) {
          notifications.push(this.createHighPriorityNotification(task));
        }
      });

      return notifications;
    } catch (error) {
      console.error('Failed to fetch task notifications:', error);
      return [];
    }
  }

  /**
   * Create notification for task due soon
   */
  private createDueSoonNotification(task: Task, daysUntilDue: number): Notification {
    const priority: NotificationPriority = daysUntilDue === 0 ? 'urgent' : daysUntilDue === 1 ? 'high' : 'medium';
    
    return {
      id: `task-due-${task.id}`,
      type: 'task',
      priority,
      status: 'unread',
      title: `Task Due Soon: ${task.title}`,
      message: `Your task "${task.title}" is due in ${daysUntilDue} day${daysUntilDue !== 1 ? 's' : ''}.`,
      icon: 'schedule',
      createdAt: new Date().toISOString(),
      actionUrl: `/private/tasks`,
      actionLabel: 'View Task',
      actionData: {
        taskId: task.id,
      },
      sourceType: 'Task',
      sourceId: task.id,
      metadata: {
        taskTitle: task.title,
        dueDate: task.dueDate,
        daysUntilDue,
      },
    };
  }

  /**
   * Create notification for overdue task
   */
  private createOverdueNotification(task: Task, daysOverdue: number): Notification {
    return {
      id: `task-overdue-${task.id}`,
      type: 'task',
      priority: 'urgent',
      status: 'unread',
      title: `Overdue Task: ${task.title}`,
      message: `Your task "${task.title}" is ${daysOverdue} day${daysOverdue !== 1 ? 's' : ''} overdue.`,
      icon: 'warning',
      createdAt: new Date().toISOString(),
      actionUrl: `/private/tasks`,
      actionLabel: 'View Task',
      actionData: {
        taskId: task.id,
      },
      sourceType: 'Task',
      sourceId: task.id,
      metadata: {
        taskTitle: task.title,
        dueDate: task.dueDate,
        daysOverdue,
      },
    };
  }

  /**
   * Create notification for high priority task
   */
  private createHighPriorityNotification(task: Task): Notification {
    return {
      id: `task-priority-${task.id}`,
      type: 'task',
      priority: task.priority === 'Urgent' ? 'urgent' : 'high',
      status: 'unread',
      title: `High Priority Task: ${task.title}`,
      message: `You have a ${task.priority.toLowerCase()} priority task "${task.title}" that needs attention.`,
      icon: 'priority_high',
      createdAt: new Date().toISOString(),
      actionUrl: `/private/tasks`,
      actionLabel: 'View Task',
      actionData: {
        taskId: task.id,
      },
      sourceType: 'Task',
      sourceId: task.id,
      metadata: {
        taskTitle: task.title,
        priority: task.priority,
      },
    };
  }

  async markAsRead(notificationId: string): Promise<void> {
    const id = parseInt(notificationId, 10);
    if (!isNaN(id)) {
      // Notification exists in backend, call API
      await firstValueFrom(
        this.notificationService.markAsRead(id).pipe(
          catchError(error => {
            console.error('Failed to mark notification as read:', error);
            return of(void 0);
          })
        )
      );
    }
    // If ID is not numeric, it's a temporary ID - nothing to persist
  }

  async getUnreadCount(): Promise<number> {
    try {
      const response = await firstValueFrom(
        this.taskService.getTasks({ pageNumber: 1, pageSize: 100 })
      );

      if (!response?.data) return 0;

      const now = new Date();
      let count = 0;

      response.data.forEach((task) => {
        if (task.dueDate && task.status !== 'Completed' && task.status !== 'Cancelled') {
          const dueDate = new Date(task.dueDate);
          const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          if (daysUntilDue <= 3) count++;
        }
        if (task.status === 'Pending' && (task.priority === 'High' || task.priority === 'Urgent')) {
          count++;
        }
      });

      return count;
    } catch (error) {
      return 0;
    }
  }
}

