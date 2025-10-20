import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';

//import angular material
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

//import primeNG v19
import { providePrimeNG } from 'primeng/config';

//import ngrx
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { provideRouterStore } from '@ngrx/router-store';
import { reducers } from './store/app.store';
import { authInterceptor } from '@core/interceptors/auth.interceptor';
import { httpErrorInterceptor } from '@core/interceptors/http-error.interceptor';
import { EmployeeEffects } from './store/employee/employee.effects';

export const appConfig: ApplicationConfig = {
  // global dependencies injection for app.component.ts
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    //provide angular material for ng 19

    // provide animations for angular material, async loading
    provideAnimationsAsync(),

    // provide http client for angular + interceptor
    provideHttpClient(
      withInterceptors([authInterceptor, httpErrorInterceptor])
    ),

    //primeNG for Ng19 (no preset configuration in v19)
    providePrimeNG(),

    //ngrx for Ng19
    provideStore(reducers),
    provideEffects([EmployeeEffects]),
    provideStoreDevtools({
      maxAge: 25,
      logOnly: false,
      autoPause: true,
      trace: true,
      traceLimit: 75,
    }),
    provideRouterStore(),
  ],
};
