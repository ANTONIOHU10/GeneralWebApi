import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NotificationContainerComponent } from './Shared/components/notification-container/notification-container.component';
import { DialogContainerComponent } from './Shared/components/dialog-container/dialog-container.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NotificationContainerComponent, DialogContainerComponent],
  template: `
    <!--<h1>Welcome to {{ title }}!</h1>-->

    <router-outlet />

    <!-- Global notification container -->
    <app-notification-container></app-notification-container>

    <!-- Global dialog container -->
    <app-dialog-container></app-dialog-container>
  `,
  styles: [],
})
export class AppComponent {
  title = 'general-frontend';
}
