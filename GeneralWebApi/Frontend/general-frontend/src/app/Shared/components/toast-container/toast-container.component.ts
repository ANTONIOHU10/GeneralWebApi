// Path: GeneralWebApi/Frontend/general-frontend/src/app/Shared/components/toast-container/toast-container.component.ts
import { Component, OnInit, OnDestroy, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ToastService } from '../../services/toast.service';
import { ToastData } from '../base/base-toast/base-toast.component';
import { BaseToastComponent } from '../base/base-toast/base-toast.component';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule, BaseToastComponent],
  templateUrl: './toast-container.component.html',
  styleUrls: ['./toast-container.component.scss'],
})
export class ToastContainerComponent implements OnInit, OnDestroy {
  @ViewChild(BaseToastComponent) toastComponent!: BaseToastComponent;
  
  private subscription?: Subscription;
  private toastService = inject(ToastService);

  ngOnInit(): void {
    // Subscribe to toast service and sync with BaseToastComponent
    this.subscription = this.toastService.toasts$.subscribe(toasts => {
      if (this.toastComponent) {
        // Clear existing toasts
        this.toastComponent.clearAllToasts();
        
        // Add all toasts from service
        toasts.forEach(toast => {
          this.toastComponent.addToast({
            title: toast.title,
            message: toast.message,
            type: toast.type,
            icon: toast.icon,
            duration: toast.duration,
            closable: toast.closable,
            actions: toast.actions,
          });
        });
      }
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }
}

