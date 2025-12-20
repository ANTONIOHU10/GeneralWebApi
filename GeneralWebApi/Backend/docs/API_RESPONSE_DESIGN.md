# API Response Design - Error and Message Fields

## Overview

The `ApiResponse<T>` class uses two fields for error information: `Error` and `Message`. Understanding their distinct roles is crucial for consistent API design and frontend integration.

## Field Responsibilities

### `Error` Field (Error Title/Category)

**Purpose**: Short, technical identifier for error classification

**Characteristics**:
- **Short and concise**: Typically 2-5 words
- **Technical identifier**: Used for error classification and logging
- **Examples**: 
  - `"Invalid credentials"`
  - `"Validation failed"`
  - `"Resource not found"`
  - `"Unauthorized access"`

**Usage**:
- Error classification and categorization
- Logging and monitoring systems
- Developer debugging
- **Fallback** when `Message` is not provided
- **NOT** primarily intended for end-user display

### `Message` Field (Detailed User-Friendly Description)

**Purpose**: Detailed, user-friendly message for end-user display

**Characteristics**:
- **Detailed and helpful**: Provides context and guidance
- **User-friendly language**: Written for end users, not developers
- **Actionable**: Often includes suggestions on what to do next
- **Examples**:
  - `"Invalid username or password. Please check your credentials and try again"`
  - `"One or more validation errors occurred: Username is required, Email format is invalid"`
  - `"The requested resource could not be found. Please verify the ID and try again"`

**Usage**:
- **PRIMARY** field for displaying messages to end users in UI
- Success messages describing what was accomplished
- Error messages with detailed, helpful information
- Frontend notification systems should prioritize this field

## Usage Patterns

### Pattern 1: Simple Error (Error Only)

```csharp
// When message is not provided, error value is used for both fields
ApiResponse<User>.Unauthorized("Invalid credentials")
```

**Result**:
```json
{
  "success": false,
  "error": "Invalid credentials",
  "message": "Invalid credentials",  // Same as error
  "statusCode": 401
}
```

### Pattern 2: Detailed Error (Error + Message)

```csharp
// Provide both error (short) and message (detailed)
ApiResponse<User>.ErrorResult(
    error: "Invalid credentials",
    statusCode: 401,
    message: "Invalid username or password. Please check your credentials and try again"
)
```

**Result**:
```json
{
  "success": false,
  "error": "Invalid credentials",  // Short title for classification
  "message": "Invalid username or password. Please check your credentials and try again",  // Detailed for users
  "statusCode": 401
}
```

### Pattern 3: Validation Errors

```csharp
ApiResponse<User>.ErrorResult(
    error: "Validation failed",
    statusCode: 400,
    message: "One or more validation errors occurred: Username is required, Email format is invalid"
)
```

## Frontend Integration

### Priority Order

Frontend should extract error messages in this priority:

1. **`message`** (PRIMARY) - Use for user display
2. **`error`** (FALLBACK) - Use if message is not available or for logging
3. Validation errors from `errors` object (if present)
4. HTTP status text (last resort)

### Example: Frontend Error Interceptor

```typescript
// Priority 1: Check message field (detailed, user-friendly)
if (error.error.message && error.error.message.trim()) {
    displayMessage = error.error.message;
}
// Priority 2: Fallback to error field (short title)
else if (error.error.error) {
    displayMessage = error.error.error;
}
```

## Best Practices

### ✅ DO

- **Always provide `message`** for user-facing errors with detailed, helpful information
- Use `error` for short, consistent error classification
- Keep `error` values consistent across similar error types
- Make `message` user-friendly and actionable
- Use `ErrorMessages` constants for consistency

### ❌ DON'T

- Don't put technical details in `error` field (use `message` instead)
- Don't use `error` as the primary field for user display
- Don't duplicate the same text in both fields unnecessarily
- Don't use `error` for detailed error descriptions

## Examples from Codebase

### Authentication Error

```csharp
// Error: Short classification
// Message: Detailed, user-friendly
return Unauthorized(ApiResponse<LoginResponseData>.Unauthorized(
    ErrorMessages.Authentication.InvalidCredentials
));
// Results in:
// error: "Invalid credentials"
// message: "Invalid username or password. Please check your credentials and try again"
```

### Database Constraint Error

```csharp
ApiResponse<object>.ErrorResult(
    error: "Reference data not found",  // Short classification
    statusCode: 400,
    message: "The specified department does not exist. Please select a valid department"  // Detailed guidance
)
```

## Summary

| Field | Purpose | Length | Audience | Priority for UI |
|-------|---------|--------|----------|-----------------|
| `error` | Error classification | Short (2-5 words) | Developers/Logging | Secondary (fallback) |
| `message` | User-friendly details | Detailed (sentence) | End users | **Primary** |

**Key Takeaway**: Always prioritize `message` for displaying to end users. Use `error` for classification, logging, and as a fallback when `message` is not available.

