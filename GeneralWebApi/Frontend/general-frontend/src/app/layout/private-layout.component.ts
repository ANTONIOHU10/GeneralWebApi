// Path: GeneralWebApi/Frontend/general-frontend/src/app/layout/private-layout.component.ts
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-private-layout',
  template: `
    <header>App Header</header>
    <aside>Sidebar</aside>
    <main><router-outlet /></main>
    <footer>Footer</footer>
  `,
  imports: [RouterOutlet],
})
export class PrivateLayoutComponent {}