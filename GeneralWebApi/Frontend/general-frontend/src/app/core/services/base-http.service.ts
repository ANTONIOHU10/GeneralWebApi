// Path: GeneralWebApi/Frontend/general-frontend/src/app/core/services/base-http.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '@environments/environment';
import { ApiResponse } from 'app/contracts/common/api-response';

/**
 * Base HTTP Service - Provides common HTTP operations with unified response handling
 * 
 * Features:
 * - Automatic ApiResponse unwrapping
 * - Unified error handling
 * - Query parameter building
 * - Type-safe requests
 * 
 * Usage:
 * ```typescript
 * @Injectable({ providedIn: 'root' })
 * export class MyService extends BaseHttpService {
 *   private readonly endpoint = `${this.baseUrl}/my-resource`;
 * 
 *   getItems(): Observable<Item[]> {
 *     return this.get<Item[]>(this.endpoint);
 *   }
 * 
 *   getItemById(id: string): Observable<Item> {
 *     return this.get<Item>(`${this.endpoint}/${id}`);
 *   }
 * 
 *   createItem(item: Item): Observable<Item> {
 *     return this.post<Item>(this.endpoint, item);
 *   }
 * }
 * ```
 */
@Injectable({
  providedIn: 'root',
})
export class BaseHttpService {
  protected http = inject(HttpClient);
  protected baseUrl = environment.apiUrl;

  /**
   * Build query parameters from object
   * Automatically filters out null, undefined, and empty string values
   * Supports array values
   */
  protected buildQueryParams(params: Record<string, unknown>): HttpParams {
    let httpParams = new HttpParams();
    
    Object.keys(params).forEach(key => {
      const value = params[key];
      if (value !== null && value !== undefined && value !== '') {
        if (Array.isArray(value)) {
          value.forEach(item => {
            httpParams = httpParams.append(key, item.toString());
          });
        } else {
          httpParams = httpParams.set(key, value.toString());
        }
      }
    });
    
    return httpParams;
  }

  /**
   * Extract data from ApiResponse
   * Validates response.success and throws error if not successful
   * Throws error if data is undefined
   */
  protected extractData<T>(): (source: Observable<ApiResponse<T>>) => Observable<T> {
    return map((response: ApiResponse<T>) => {
      if (!response.success) {
        throw new Error(response.message || response.error || 'Request failed');
      }
      if (response.data === undefined || response.data === null) {
        throw new Error(response.message || 'Response data is missing');
      }
      return response.data;
    });
  }

  /**
   * Handle errors uniformly
   * Note: HTTP interceptor already extracts error messages from HttpErrorResponse
   */
  protected handleError(defaultMessage = 'An error occurred') {
    return catchError((error: unknown) => {
      // HTTP interceptor already extracted the message
      // Just get the message from the Error object
      const message = (error as Error)?.message || defaultMessage;
      return throwError(() => new Error(message)) as Observable<never>;
    });
  }

  /**
   * Build full URL from endpoint
   * If endpoint starts with http:// or https://, use it as-is
   * Otherwise, combine with baseUrl
   */
  protected buildUrl(endpoint: string): string {
    if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
      return endpoint;
    }
    // Remove leading slash from endpoint if baseUrl already ends with slash
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    // Remove trailing slash from baseUrl
    const cleanBaseUrl = this.baseUrl.endsWith('/') ? this.baseUrl.slice(0, -1) : this.baseUrl;
    return `${cleanBaseUrl}${cleanEndpoint}`;
  }

  /**
   * GET request with automatic ApiResponse unwrapping
   * 
   * @param endpoint - API endpoint (relative to baseUrl or full URL)
   * @param params - Query parameters object
   * @param options - Request options
   * @param options.extractData - Whether to extract data from ApiResponse (default: true)
   * @returns Observable with extracted data or full ApiResponse
   */
  protected get<T>(
    endpoint: string,
    params?: Record<string, unknown>,
    options?: { extractData?: boolean }
  ): Observable<T> {
    const httpParams = params ? this.buildQueryParams(params) : undefined;
    const extract = options?.extractData !== false; // Default to true
    const url = this.buildUrl(endpoint);

    const request$: Observable<ApiResponse<T>> = this.http.get<ApiResponse<T>>(url, {
      params: httpParams,
    });

    if (extract) {
      return request$.pipe(
        this.extractData<T>(),
        this.handleError('Failed to fetch data')
      ) as Observable<T>;
    }

    return request$.pipe(this.handleError('Failed to fetch data')) as Observable<T>;
  }

  /**
   * POST request with automatic ApiResponse unwrapping
   * 
   * @param endpoint - API endpoint
   * @param body - Request body
   * @param options - Request options
   * @param options.extractData - Whether to extract data from ApiResponse (default: true)
   * @param options.headers - Custom HTTP headers
   * @returns Observable with extracted data or full ApiResponse
   */
  protected post<T>(
    endpoint: string,
    body: unknown,
    options?: { extractData?: boolean; headers?: HttpHeaders }
  ): Observable<T> {
    const extract = options?.extractData !== false; // Default to true
    const url = this.buildUrl(endpoint);

    const request$: Observable<ApiResponse<T>> = this.http.post<ApiResponse<T>>(url, body, {
      headers: options?.headers,
    });

    if (extract) {
      return request$.pipe(
        this.extractData<T>(),
        this.handleError('Failed to create resource')
      ) as Observable<T>;
    }

    return request$.pipe(this.handleError('Failed to create resource')) as Observable<T>;
  }

  /**
   * PUT request with automatic ApiResponse unwrapping
   * 
   * @param endpoint - API endpoint
   * @param body - Request body
   * @param options - Request options
   * @param options.extractData - Whether to extract data from ApiResponse (default: true)
   * @param options.headers - Custom HTTP headers
   * @returns Observable with extracted data or full ApiResponse
   */
  protected put<T>(
    endpoint: string,
    body: unknown,
    options?: { extractData?: boolean; headers?: HttpHeaders }
  ): Observable<T> {
    const extract = options?.extractData !== false; // Default to true
    const url = this.buildUrl(endpoint);

    const request$: Observable<ApiResponse<T>> = this.http.put<ApiResponse<T>>(url, body, {
      headers: options?.headers,
    });

    if (extract) {
      return request$.pipe(
        this.extractData<T>(),
        this.handleError('Failed to update resource')
      ) as Observable<T>;
    }

    return request$.pipe(this.handleError('Failed to update resource')) as Observable<T>;
  }

  /**
   * DELETE request with automatic ApiResponse unwrapping
   * 
   * @param endpoint - API endpoint
   * @param options - Request options
   * @param options.extractData - Whether to extract data from ApiResponse (default: true)
   * @returns Observable with extracted data or full ApiResponse
   */
  protected delete<T = void>(
    endpoint: string,
    options?: { extractData?: boolean }
  ): Observable<T> {
    const extract = options?.extractData !== false; // Default to true
    const url = this.buildUrl(endpoint);

    const request$: Observable<ApiResponse<T>> = this.http.delete<ApiResponse<T>>(url);

    if (extract) {
      return request$.pipe(
        this.extractData<T>(),
        this.handleError('Failed to delete resource')
      ) as Observable<T>;
    }

    return request$.pipe(this.handleError('Failed to delete resource')) as Observable<T>;
  }

  /**
   * PATCH request with automatic ApiResponse unwrapping
   * 
   * @param endpoint - API endpoint
   * @param body - Request body
   * @param options - Request options
   * @param options.extractData - Whether to extract data from ApiResponse (default: true)
   * @param options.headers - Custom HTTP headers
   * @returns Observable with extracted data or full ApiResponse
   */
  protected patch<T>(
    endpoint: string,
    body: unknown,
    options?: { extractData?: boolean; headers?: HttpHeaders }
  ): Observable<T> {
    const extract = options?.extractData !== false; // Default to true
    const url = this.buildUrl(endpoint);

    const request$: Observable<ApiResponse<T>> = this.http.patch<ApiResponse<T>>(url, body, {
      headers: options?.headers,
    });

    if (extract) {
      return request$.pipe(
        this.extractData<T>(),
        this.handleError('Failed to update resource')
      ) as Observable<T>;
    }

    return request$.pipe(this.handleError('Failed to update resource')) as Observable<T>;
  }
}

 