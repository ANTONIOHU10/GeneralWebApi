namespace GeneralWebApi.Caching.Configuration;

/// <summary>
/// Configuration settings for health check endpoints
/// </summary>
public class HealthCheckSettings
{
    public const string SectionName = "HealthCheck";

    /// <summary>
    /// Enable health check endpoints
    /// </summary>
    public bool EnableHealthCheckEndpoints { get; set; } = true;

    /// <summary>
    /// Enable detailed health information in responses
    /// </summary>
    public bool EnableDetailedHealthInfo { get; set; } = true;

    /// <summary>
    /// Health check timeout in seconds
    /// </summary>
    public int HealthCheckTimeoutSeconds { get; set; } = 30;

    /// <summary>
    /// Enable automatic cleanup of expired data
    /// </summary>
    public bool EnableAutoCleanup { get; set; } = true;

    /// <summary>
    /// Cleanup interval in hours
    /// </summary>
    public int CleanupIntervalHours { get; set; } = 24;

    /// <summary>
    /// Maximum number of expired tokens to clean up per batch
    /// </summary>
    public int MaxCleanupBatchSize { get; set; } = 1000;

    /// <summary>
    /// Enable cache recovery endpoints
    /// </summary>
    public bool EnableCacheRecoveryEndpoints { get; set; } = true;

    /// <summary>
    /// Enable session management endpoints
    /// </summary>
    public bool EnableSessionManagementEndpoints { get; set; } = true;
}
