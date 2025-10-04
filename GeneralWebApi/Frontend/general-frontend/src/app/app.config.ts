import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';

//import angular material
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  // global dependencies injection for app.component.ts 
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    //provide angular material

    // provide animations for angular material, async loading
    provideAnimationsAsync(), 
    
    // provide http client for angular
    provideHttpClient(),
  ],
};
