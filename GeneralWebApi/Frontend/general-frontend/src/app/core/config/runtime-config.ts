import { InjectionToken } from '@angular/core';

export interface RuntimeConfig {
  apiUrl: string;
  environment?: string;
  timestampUtc?: string;
}

export const RUNTIME_CONFIG = new InjectionToken<RuntimeConfig>('RUNTIME_CONFIG');

