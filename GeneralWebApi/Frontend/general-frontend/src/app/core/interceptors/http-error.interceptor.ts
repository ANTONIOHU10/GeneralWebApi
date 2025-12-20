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
      // Priority: message (detailed) > error (title) > validation errors > statusText
      // Backend follows consistent format: error = short title, message = detailed errors
      // After backend update: message defaults to error value if not explicitly provided
      if (error?.error) {
        // Priority 1: Check for ApiResponse message format (detailed error information)
        // Backend now consistently puts detailed errors in message field
        // If message is the old default "Operation failed", fallback to error field
        if (error.error.message && error.error.message.trim()) {
          const messageValue = error.error.message.trim();
          // Check if message is the old default value, use error field instead
          if (messageValue === 'Operation failed' && error.error.error && error.error.error.trim()) {
            message = error.error.error.trim();
            console.log('✅ Message is default, using error field:', message);
          } else {
            message = messageValue;
            console.log('✅ Extracted from error.error.message (priority - detailed):', message);
          }
        }
        // Priority 2: Check for ASP.NET Core validation errors
        else if (error.error.errors && typeof error.error.errors === 'object') {
          const validationErrors = Object.entries(error.error.errors)
            .map(([field, messages]) => {
              const msgArray = Array.isArray(messages) ? messages : [messages];
              return `${field}: ${msgArray.join(', ')}`;
            })
            .join('; ');
          message = validationErrors;
          console.log('✅ Extracted validation errors:', message);
        }
        // Priority 3: Check for ApiResponse error format (short title/type)
        // Use error field as fallback if message is not available
        else if (error.error.error && error.error.error.trim()) {
          message = error.error.error.trim();
          console.log('✅ Extracted from error.error.error (fallback - title):', message);
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
