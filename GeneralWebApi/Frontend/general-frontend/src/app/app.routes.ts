import { Routes } from '@angular/router';
import { authGuard } from '@core/guards/auth.guard';
import { LoginComponent } from '@features/auth/login/login.component';
import { EmployeeListComponent } from '@features/employees/employee-list/employee-list.component';
import { PrivateLayoutComponent } from '@layout/privatePage';
import { PublicLayoutComponent } from '@layout/publicPage';

export const routes: Routes = [
  {
    //auth/login
    path: '',
    component: PublicLayoutComponent,
    children: [
      { path: '', redirectTo: 'login', pathMatch: 'full' },
      { path: 'login', component: LoginComponent },
    ],
  },
  {
    path: 'private',
    component: PrivateLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'employees', pathMatch: 'full' },
      { path: 'employees', component: EmployeeListComponent },
    ],
  },
];
