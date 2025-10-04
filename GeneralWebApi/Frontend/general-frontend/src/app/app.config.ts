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
  })
  ],
};
