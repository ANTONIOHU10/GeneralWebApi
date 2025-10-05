import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';

//import angular material
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient } from '@angular/common/http';

//import primeNG v19
import { providePrimeNG } from 'primeng/config';
//example theme
import Aura from '@primeng/themes/aura';

//import ngrx
import { provideStore } from "@ngrx/store";
import { provideEffects } from "@ngrx/effects";
import { provideStoreDevtools } from "@ngrx/store-devtools";
import { provideRouterStore } from "@ngrx/router-store";
import { reducers } from "./store/app.store";

export const appConfig: ApplicationConfig = {
  // global dependencies injection for app.component.ts 
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    //provide angular material for ng 19

    // provide animations for angular material, async loading
    provideAnimationsAsync(), 
    
    // provide http client for angular
    provideHttpClient(),

    //primeNG for Ng19
    providePrimeNG({
      theme: {
          preset: Aura
      }
    }),

    //ngrx for Ng19
    provideStore(reducers),
    provideEffects([]),
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
