import { Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { RuntimeConfig } from './runtime-config';

@Injectable({ providedIn: 'root' })
export class RuntimeConfigService {
  private _config: RuntimeConfig = { apiUrl: environment.apiUrl };

  get config(): RuntimeConfig {
    return this._config;
  }

  /**
   * Loads runtime configuration from the hosting server.
   * Expected endpoint: GET /app-config
   */
  async load(): Promise<void> {
    try {
      const res = await fetch('/app-config', {
        method: 'GET',
        cache: 'no-store',
        headers: { Accept: 'application/json' },
      });

      if (!res.ok) {
        // Keep environment fallback if endpoint not available.
        return;
      }

      const json = (await res.json()) as Partial<RuntimeConfig> | null;
      if (json?.apiUrl && typeof json.apiUrl === 'string') {
        this._config = {
          apiUrl: json.apiUrl,
          environment: json.environment,
          timestampUtc: json.timestampUtc,
        };
      }
    } catch {
      // Keep environment fallback on network failures.
    }
  }
}

