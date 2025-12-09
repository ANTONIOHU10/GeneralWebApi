// Path: GeneralWebApi/Backend/src/1-Presentation/GeneralWebApi.WebApi/Middleware/AuditMiddleware.cs
using GeneralWebApi.Application.Services;
using GeneralWebApi.Domain.Entities.Audit;
using GeneralWebApi.Identity.Helpers;
using GeneralWebApi.Integration.Context;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System.Security.Claims;
using System.Text.Json;

namespace GeneralWebApi.Middleware;

/// <summary>
/// Middleware to automatically log audit events for CREATE, UPDATE, DELETE operations
/// </summary>
public class AuditMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<AuditMiddleware> _logger;
    private readonly IServiceProvider _serviceProvider;

    // HTTP methods that should be audited
    private static readonly HashSet<string> AuditableMethods = new(StringComparer.OrdinalIgnoreCase)
    {
        "POST",   // CREATE
        "PUT",    // UPDATE
        "PATCH",  // UPDATE (partial)
        "DELETE"  // DELETE
    };

    // Routes that should be excluded from auditing (e.g., login, health checks)
    private static readonly HashSet<string> ExcludedPaths = new(StringComparer.OrdinalIgnoreCase)
    {
        "/api/v1/auth/login",
        "/api/v1/auth/refresh-token",
        "/api/v1/auth/logout",
        "/health",
        "/api/v1/audit-logs", // Don't audit audit log queries
    };

    public AuditMiddleware(
        RequestDelegate next,
        ILogger<AuditMiddleware> logger,
        IServiceProvider serviceProvider)
    {
        _next = next;
        _logger = logger;
        _serviceProvider = serviceProvider;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        // Only audit CREATE, UPDATE, DELETE operations
        if (!ShouldAudit(context))
        {
            await _next(context);
            return;
        }

        var startTime = DateTime.UtcNow;
        var requestPath = context.Request.Path.Value ?? string.Empty;
        var httpMethod = context.Request.Method;
        var ipAddress = GetClientIpAddress(context);
        var userAgent = context.Request.Headers["User-Agent"].ToString();

        // Get user information from claims
        var userId = GetUserId(context.User);
        var userName = GetUserName(context.User);

        // Extract entity information from route
        var (entityType, entityId) = ExtractEntityInfo(requestPath);

        // Determine action based on HTTP method
        var action = MapHttpMethodToAction(httpMethod);

        // For UPDATE/DELETE operations, try to get old values from database before processing
        string? oldValues = null;
        if ((action == "Update" || action == "Delete") && !string.IsNullOrEmpty(entityId) && entityId != "N/A")
        {
            try
            {
                oldValues = await GetOldValuesFromDatabaseAsync(entityType, entityId);
            }
            catch (Exception ex)
            {
                // Log but don't fail - old values are optional
                _logger.LogWarning(ex, "Failed to retrieve old values for {EntityType}:{EntityId}", entityType, entityId);
            }
        }

        // Capture request body for UPDATE/CREATE operations (new values)
        string? requestBody = null;
        if (httpMethod == "POST" || httpMethod == "PUT" || httpMethod == "PATCH")
        {
            // Enable buffering to allow reading request body multiple times
            context.Request.EnableBuffering();
            requestBody = await ReadRequestBodyAsync(context.Request);
            // Reset stream position for next middleware
            context.Request.Body.Position = 0;
        }

        // Track if the request was successful
        bool isSuccess = false;
        string? errorMessage = null;
        int statusCode = 0;
        string? responseBody = null;

        try
        {
            // Capture response body for successful operations
            var originalBodyStream = context.Response.Body;
            using var responseBodyStream = new MemoryStream();
            context.Response.Body = responseBodyStream;

            // Execute the next middleware in the pipeline
            await _next(context);

            // Read response body if successful
            if (context.Response.StatusCode >= 200 && context.Response.StatusCode < 400)
            {
                responseBodyStream.Seek(0, SeekOrigin.Begin);
                responseBody = await new StreamReader(responseBodyStream).ReadToEndAsync();
                responseBodyStream.Seek(0, SeekOrigin.Begin);

                // Copy response body back to original stream
                await responseBodyStream.CopyToAsync(originalBodyStream);
            }
            else
            {
                // For error responses, copy the stream as is
                responseBodyStream.Seek(0, SeekOrigin.Begin);
                await responseBodyStream.CopyToAsync(originalBodyStream);
            }

            statusCode = context.Response.StatusCode;
            // Consider 2xx and 3xx as success
            isSuccess = statusCode >= 200 && statusCode < 400;

            // Determine new values based on operation type
            string? newValues = null;

            if (action == "Update" || action == "Create")
            {
                // For UPDATE/CREATE, request body contains new values
                newValues = requestBody;
                // For UPDATE, response body may contain the updated entity
                if (isSuccess && !string.IsNullOrEmpty(responseBody))
                {
                    // Try to extract meaningful data from response
                    newValues = responseBody;
                }
            }
            // For DELETE, oldValues was already retrieved before processing

            // Log audit event asynchronously (fire and forget to avoid blocking the response)
            _ = Task.Run(async () =>
            {
                try
                {
                    await LogAuditEventAsync(
                        action: action,
                        entityType: entityType,
                        entityId: entityId,
                        entityName: entityType, // Could be enhanced to fetch actual entity name
                        userId: userId ?? "System",
                        userName: userName ?? "System",
                        ipAddress: ipAddress,
                        requestPath: requestPath,
                        httpMethod: httpMethod,
                        userAgent: userAgent,
                        details: $"HTTP {httpMethod} {requestPath} - Status: {statusCode}",
                        oldValues: oldValues,
                        newValues: newValues,
                        severity: isSuccess ? "Info" : "Warning",
                        isSuccess: isSuccess,
                        errorMessage: isSuccess ? null : $"HTTP {statusCode}",
                        durationMs: (long)(DateTime.UtcNow - startTime).TotalMilliseconds
                    );
                }
                catch (Exception ex)
                {
                    // Log the error but don't fail the request
                    _logger.LogError(ex, "Failed to log audit event for {Method} {Path}", httpMethod, requestPath);
                }
            });
        }
        catch (Exception ex)
        {
            // Request failed with exception
            isSuccess = false;
            errorMessage = ex.Message;
            statusCode = 500;

            // Log audit event for failed request
            _ = Task.Run(async () =>
            {
                try
                {
                    await LogAuditEventAsync(
                        action: action,
                        entityType: entityType,
                        entityId: entityId,
                        entityName: entityType,
                        userId: userId ?? "System",
                        userName: userName ?? "System",
                        ipAddress: ipAddress,
                        requestPath: requestPath,
                        httpMethod: httpMethod,
                        userAgent: userAgent,
                        details: $"HTTP {httpMethod} {requestPath} - Exception occurred",
                        oldValues: null,
                        newValues: requestBody,
                        severity: "Error",
                        isSuccess: false,
                        errorMessage: ex.Message,
                        durationMs: (long)(DateTime.UtcNow - startTime).TotalMilliseconds
                    );
                }
                catch (Exception auditEx)
                {
                    _logger.LogError(auditEx, "Failed to log audit event for exception: {Method} {Path}", httpMethod, requestPath);
                }
            });

            // Re-throw the exception so it can be handled by exception middleware
            throw;
        }
    }

    /// <summary>
    /// Check if the request should be audited
    /// </summary>
    private static bool ShouldAudit(HttpContext context)
    {
        var method = context.Request.Method;
        var path = context.Request.Path.Value ?? string.Empty;

        // Only audit CREATE, UPDATE, DELETE operations
        if (!AuditableMethods.Contains(method))
        {
            return false;
        }

        // Exclude certain paths
        if (ExcludedPaths.Any(excluded => path.StartsWith(excluded, StringComparison.OrdinalIgnoreCase)))
        {
            return false;
        }

        return true;
    }

    /// <summary>
    /// Extract entity type and ID from the request path
    /// Example: /api/v1/users/123 -> (User, 123)
    /// Example: /api/v1/employees -> (Employee, null)
    /// </summary>
    private static (string entityType, string? entityId) ExtractEntityInfo(string path)
    {
        // Remove query string
        var pathWithoutQuery = path.Split('?')[0];

        // Split path segments: /api/v1/users/123 -> ["", "api", "v1", "users", "123"]
        var segments = pathWithoutQuery.Split('/', StringSplitOptions.RemoveEmptyEntries);

        if (segments.Length < 3) // Need at least /api/v1/{entity}
        {
            return ("Unknown", null);
        }

        // Get the entity name (usually the 3rd segment after /api/v1/)
        var entityName = segments[2];

        // Convert to PascalCase (e.g., "users" -> "User", "employee-roles" -> "EmployeeRole")
        var entityType = ToPascalCase(entityName);

        // Check if there's an ID (4th segment)
        string? entityId = null;
        if (segments.Length > 3)
        {
            entityId = segments[3];
        }

        return (entityType, entityId);
    }

    /// <summary>
    /// Convert kebab-case or snake_case to PascalCase
    /// </summary>
    private static string ToPascalCase(string input)
    {
        if (string.IsNullOrWhiteSpace(input))
        {
            return "Unknown";
        }

        // Handle kebab-case and snake_case
        var parts = input.Split(new[] { '-', '_' }, StringSplitOptions.RemoveEmptyEntries);
        var result = string.Join("", parts.Select(part =>
            char.ToUpperInvariant(part[0]) + part.Substring(1).ToLowerInvariant()
        ));

        return result;
    }

    /// <summary>
    /// Map HTTP method to audit action
    /// </summary>
    private static string MapHttpMethodToAction(string httpMethod)
    {
        return httpMethod.ToUpperInvariant() switch
        {
            "POST" => "Create",
            "PUT" => "Update",
            "PATCH" => "Update",
            "DELETE" => "Delete",
            _ => httpMethod
        };
    }

    /// <summary>
    /// Get client IP address from HttpContext
    /// </summary>
    private static string GetClientIpAddress(HttpContext context)
    {
        // Try to get IP from X-Forwarded-For header (for proxies/load balancers)
        var forwardedFor = context.Request.Headers["X-Forwarded-For"].FirstOrDefault();
        if (!string.IsNullOrEmpty(forwardedFor))
        {
            var ips = forwardedFor.Split(',');
            if (ips.Length > 0)
            {
                var ip = ips[0].Trim();
                return NormalizeIpAddress(ip);
            }
        }

        // Try X-Real-IP header
        var realIp = context.Request.Headers["X-Real-IP"].FirstOrDefault();
        if (!string.IsNullOrEmpty(realIp))
        {
            return NormalizeIpAddress(realIp);
        }

        // Fallback to connection remote IP
        var remoteIp = context.Connection.RemoteIpAddress?.ToString();
        return NormalizeIpAddress(remoteIp ?? "Unknown");
    }

    /// <summary>
    /// Normalize IP address for display (convert IPv6 localhost to IPv4)
    /// </summary>
    private static string NormalizeIpAddress(string? ipAddress)
    {
        if (string.IsNullOrEmpty(ipAddress))
        {
            return "Unknown";
        }

        // Convert IPv6 localhost to IPv4 for better readability
        if (ipAddress == "::1" || ipAddress == "::ffff:127.0.0.1")
        {
            return "127.0.0.1 (localhost)";
        }

        // Handle IPv6-mapped IPv4 addresses
        if (ipAddress.StartsWith("::ffff:"))
        {
            return ipAddress.Substring(7); // Remove "::ffff:" prefix
        }

        return ipAddress;
    }

    /// <summary>
    /// Get user ID from ClaimsPrincipal
    /// </summary>
    private static string? GetUserId(ClaimsPrincipal? user)
    {
        if (user == null || user.Identity?.IsAuthenticated != true)
        {
            return null;
        }

        return AuthorizationHelper.GetUserId(user);
    }

    /// <summary>
    /// Get username from ClaimsPrincipal
    /// </summary>
    private static string? GetUserName(ClaimsPrincipal? user)
    {
        if (user == null || user.Identity?.IsAuthenticated != true)
        {
            return null;
        }

        return AuthorizationHelper.GetUsername(user);
    }

    /// <summary>
    /// Get old values from database before UPDATE/DELETE operation
    /// </summary>
    private async Task<string?> GetOldValuesFromDatabaseAsync(string entityType, string entityId)
    {
        try
        {
            using var scope = _serviceProvider.CreateScope();
            var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

            // Try to parse entityId as integer
            if (!int.TryParse(entityId, out var id))
            {
                return null;
            }

            // Map entity type name to DbSet and query
            // This is a simplified approach - you may need to extend this for all entity types
            object? entity = null;
            switch (entityType.ToLowerInvariant())
            {
                case "employee":
                case "employees":
                    entity = await dbContext.Set<Domain.Entities.Anagraphy.Employee>()
                        .AsNoTracking()
                        .FirstOrDefaultAsync(e => e.Id == id);
                    break;

                case "contract":
                case "contracts":
                    entity = await dbContext.Set<Domain.Entities.Documents.Contract>()
                        .AsNoTracking()
                        .FirstOrDefaultAsync(e => e.Id == id);
                    break;

                case "department":
                case "departments":
                    entity = await dbContext.Set<Domain.Entities.Anagraphy.Department>()
                        .AsNoTracking()
                        .FirstOrDefaultAsync(e => e.Id == id);
                    break;

                case "position":
                case "positions":
                    entity = await dbContext.Set<Domain.Entities.Anagraphy.Position>()
                        .AsNoTracking()
                        .FirstOrDefaultAsync(e => e.Id == id);
                    break;

                case "user":
                case "users":
                    entity = await dbContext.Set<Domain.Entities.User>()
                        .AsNoTracking()
                        .FirstOrDefaultAsync(e => e.Id == id);
                    break;

                case "role":
                case "roles":
                    entity = await dbContext.Set<Domain.Entities.Permissions.Role>()
                        .AsNoTracking()
                        .FirstOrDefaultAsync(e => e.Id == id);
                    break;

                case "permission":
                case "permissions":
                    entity = await dbContext.Set<Domain.Entities.Permissions.Permission>()
                        .AsNoTracking()
                        .FirstOrDefaultAsync(e => e.Id == id);
                    break;

                default:
                    _logger.LogWarning("Unknown entity type for old values retrieval: {EntityType}", entityType);
                    return null;
            }

            if (entity == null)
            {
                return null;
            }

            // Serialize entity to JSON
            var options = new JsonSerializerOptions
            {
                WriteIndented = false,
                DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull
            };

            return JsonSerializer.Serialize(entity, options);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to retrieve old values for {EntityType}:{EntityId}", entityType, entityId);
            return null;
        }
    }

    /// <summary>
    /// Read request body as string
    /// </summary>
    private static async Task<string?> ReadRequestBodyAsync(HttpRequest request)
    {
        try
        {
            if (!request.Body.CanSeek)
            {
                return null;
            }

            request.Body.Position = 0;
            using var reader = new StreamReader(request.Body, leaveOpen: true);
            var body = await reader.ReadToEndAsync();
            request.Body.Position = 0;

            // Limit body size to prevent storing huge payloads
            const int maxBodyLength = 10000; // 10KB
            if (body.Length > maxBodyLength)
            {
                return body.Substring(0, maxBodyLength) + "... (truncated)";
            }

            return body;
        }
        catch
        {
            return null;
        }
    }

    /// <summary>
    /// Log audit event using IAuditService
    /// </summary>
    private async Task LogAuditEventAsync(
        string action,
        string entityType,
        string? entityId,
        string entityName,
        string userId,
        string userName,
        string ipAddress,
        string requestPath,
        string httpMethod,
        string userAgent,
        string? details,
        string? oldValues,
        string? newValues,
        string severity,
        bool isSuccess,
        string? errorMessage,
        long durationMs)
    {
        try
        {
            // Create a scope to resolve IAuditService (since we're in a background task)
            using var scope = _serviceProvider.CreateScope();
            var auditService = scope.ServiceProvider.GetRequiredService<IAuditService>();

            // Create audit log entry
            var auditLog = new AuditLog
            {
                UserId = userId,
                UserName = userName,
                Action = action,
                EntityType = entityType,
                EntityId = entityId ?? "N/A",
                EntityName = entityName,
                IpAddress = ipAddress,
                UserAgent = userAgent,
                RequestPath = requestPath,
                HttpMethod = httpMethod,
                RequestId = Guid.NewGuid().ToString(),
                Details = details,
                OldValues = oldValues,
                NewValues = newValues,
                Severity = severity,
                Category = entityType, // Use entity type as category
                IsSuccess = isSuccess,
                ErrorMessage = errorMessage,
                DurationMs = durationMs
            };

            await auditService.LogAuditEventAsync(auditLog);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to log audit event: {Action} on {EntityType}:{EntityId}", action, entityType, entityId);
        }
    }
}

