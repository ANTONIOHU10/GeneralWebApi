import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NotificationContainerComponent } from './Shared/components/notification-container/notification-container.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NotificationContainerComponent],
  template: `
    <!--<h1>Welcome to {{ title }}!</h1>-->

    <router-outlet />
    
    <!-- Global notification container -->
    <app-notification-container></app-notification-container>
  `,
  styles: [],
})
export class AppComponent {
  title = 'general-frontend';
}
