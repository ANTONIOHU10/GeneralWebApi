import { Routes } from '@angular/router';
import { authGuard } from '@core/guards/auth.guard';
import { LoginComponent } from '@features/auth/login.component';
import { PrivateLayoutComponent } from '@layout/private-layout.component';
import { PublicLayoutComponent } from '@layout/public-layout.component';

export const routes: Routes = [
    {
        //auth/login
        path: '',
        component: PublicLayoutComponent,
        children: [
            {path: '', redirectTo: 'login', pathMatch: 'full'},
            {path: 'login', component: LoginComponent}
        ],
    },
    {
        path: 'private',
        component: PrivateLayoutComponent,
        canActivate: [authGuard],
        children: [
            //protected routes
        ]
    }
];
