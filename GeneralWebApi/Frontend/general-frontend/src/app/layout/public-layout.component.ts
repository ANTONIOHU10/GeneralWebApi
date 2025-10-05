// Path: GeneralWebApi/Frontend/general-frontend/src/app/layout/public-layout.component.ts
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-public-layout',
  template: `<router-outlet />`,
  imports: [RouterOutlet],
})
export class PublicLayoutComponent {}