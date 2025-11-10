import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

export const httpErrorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      console.log('🔴 HTTP Interceptor caught error:', {
        status: error.status,
        statusText: error.statusText,
        errorBody: error.error,
        url: error.url
      });

      let message = 'Request error';

      // Extract error message from various formats
      if (error?.error) {
        // Check for ASP.NET Core validation errors
        if (error.error.errors && typeof error.error.errors === 'object') {
          const validationErrors = Object.entries(error.error.errors)
            .map(([field, messages]) => {
              const msgArray = Array.isArray(messages) ? messages : [messages];
              return `${field}: ${msgArray.join(', ')}`;
            })
            .join('; ');
          message = validationErrors;
          console.log('✅ Extracted validation errors:', message);
        }
        // Check for ApiResponse error format
        else if (error.error.error) {
          message = error.error.error;
          console.log('✅ Extracted from error.error.error:', message);
        }
        // Check for standard message format
        else if (error.error.message) {
          message = error.error.message;
          console.log('✅ Extracted from error.error.message:', message);
        }
        // Fallback to statusText
        else if (error.statusText) {
          message = error.statusText;
          console.log('✅ Using statusText:', message);
        }
      }

      console.log('📤 HTTP Interceptor throwing error with message:', message);
      return throwError(() => new Error(message));
    })
  );
};
