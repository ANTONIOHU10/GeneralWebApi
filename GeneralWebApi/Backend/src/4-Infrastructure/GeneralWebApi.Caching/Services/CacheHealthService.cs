using GeneralWebApi.Logging.Services;
using GeneralWebApi.Caching.Configuration;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Options;
using Microsoft.Extensions.DependencyInjection;

namespace GeneralWebApi.Caching.Services;

/// <summary>
/// Service for monitoring and maintaining cache health
/// Provides automatic reconnection and health monitoring
/// </summary>
public class CacheHealthService : IHostedService, IDisposable
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILoggingService _logger;
    private readonly CacheFallbackSettings _settings;
    private readonly Timer? _timer;
    private readonly TimeSpan _healthCheckInterval;
    private readonly TimeSpan _reconnectionInterval;

    public CacheHealthService(IServiceProvider serviceProvider, ILoggingService logger, IOptions<CacheFallbackSettings> settings)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
        _settings = settings.Value;
        _healthCheckInterval = TimeSpan.FromMinutes(_settings.HealthCheckIntervalMinutes);
        _reconnectionInterval = TimeSpan.FromMinutes(_settings.ReconnectionIntervalMinutes);

        if (_settings.EnableAutoReconnection)
        {
            _timer = new Timer(PerformHealthCheck, null, TimeSpan.Zero, _healthCheckInterval);
        }
    }

    /// <summary>
    /// Start the cache health monitoring service
    /// </summary>
    public Task StartAsync(CancellationToken cancellationToken)
    {
        _logger.LogInformation("Cache health monitoring service started");
        return Task.CompletedTask;
    }

    /// <summary>
    /// Stop the cache health monitoring service
    /// </summary>
    public Task StopAsync(CancellationToken cancellationToken)
    {
        _logger.LogInformation("Cache health monitoring service stopped");
        _timer?.Change(Timeout.Infinite, 0);
        return Task.CompletedTask;
    }

    /// <summary>
    /// Perform periodic health check and reconnection attempts
    /// </summary>
    private async void PerformHealthCheck(object? state)
    {
        try
        {
            using var scope = _serviceProvider.CreateScope();
            var cacheService = scope.ServiceProvider.GetRequiredService<IRedisCacheService>();

            if (!cacheService.IsCacheAvailable())
            {
                _logger.LogWarning("Cache is not available, attempting to reconnect...");

                var recoveryResult = await cacheService.TryRecoverCacheAsync();
                if (recoveryResult)
                {
                    _logger.LogInformation("Cache connection recovered successfully");
                }
                else
                {
                    _logger.LogWarning("Failed to recover cache connection, will retry in {Interval}", _reconnectionInterval);
                }
            }
            else
            {
                // Cache is available, perform a simple test
                await TestCacheConnection(cacheService);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError("Error during cache health check: {Error}", ex.Message);
        }
    }

    /// <summary>
    /// Test cache connection with a simple operation
    /// </summary>
    private async Task TestCacheConnection(IRedisCacheService cacheService)
    {
        try
        {
            var testKey = $"health_check_{DateTime.UtcNow:yyyyMMddHHmmss}";
            var testValue = "health_check_value";

            // Test set operation
            await cacheService.SetAsync(testKey, testValue, TimeSpan.FromMinutes(1));

            // Test get operation
            var retrievedValue = await cacheService.GetAsync<string>(testKey);

            // Test remove operation
            await cacheService.RemoveAsync(testKey);

            if (retrievedValue != testValue)
            {
                _logger.LogWarning("Cache test failed: retrieved value does not match expected value");
            }
        }
        catch (Exception ex)
        {
            _logger.LogError("Cache connection test failed: {Error}", ex.Message);
        }
    }

    /// <summary>
    /// Dispose resources
    /// </summary>
    public void Dispose()
    {
        _timer?.Dispose();
    }
}
