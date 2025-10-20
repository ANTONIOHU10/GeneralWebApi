namespace GeneralWebApi.Caching.Configuration;

/// <summary>
/// Configuration settings for cache fallback mechanism
/// </summary>
public class CacheFallbackSettings
{
    public const string SectionName = "CacheFallback";

    /// <summary>
    /// Enable cache fallback to database when cache is unavailable
    /// </summary>
    public bool EnableDatabaseFallback { get; set; } = true;

    /// <summary>
    /// Enable automatic cache reconnection attempts
    /// </summary>
    public bool EnableAutoReconnection { get; set; } = true;

    /// <summary>
    /// Health check interval in minutes
    /// </summary>
    public int HealthCheckIntervalMinutes { get; set; } = 5;

    /// <summary>
    /// Reconnection attempt interval in minutes
    /// </summary>
    public int ReconnectionIntervalMinutes { get; set; } = 1;

    /// <summary>
    /// Maximum reconnection attempts before giving up
    /// </summary>
    public int MaxReconnectionAttempts { get; set; } = 10;

    /// <summary>
    /// Enable detailed logging for cache operations
    /// </summary>
    public bool EnableDetailedLogging { get; set; } = true;

    /// <summary>
    /// Cache key prefix for refresh tokens
    /// </summary>
    public string RefreshTokenKeyPrefix { get; set; } = "refreshToken:";

    /// <summary>
    /// Cache key prefix for user info
    /// </summary>
    public string UserInfoKeyPrefix { get; set; } = "user_info:";

    /// <summary>
    /// Default cache expiry time in minutes
    /// </summary>
    public int DefaultCacheExpiryMinutes { get; set; } = 60;

    /// <summary>
    /// Refresh token cache expiry time in days
    /// </summary>
    public int RefreshTokenExpiryDays { get; set; } = 7;
}
