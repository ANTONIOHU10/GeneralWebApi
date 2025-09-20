using GeneralWebApi.Caching.Services;
using GeneralWebApi.Caching.Configuration;
using GeneralWebApi.Integration.Repository.BasesRepository;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

namespace GeneralWebApi.WebApi.Controllers.v1;

/// <summary>
/// Health check controller for monitoring system status
/// Provides endpoints to check cache, database, and overall system health
/// </summary>
[ApiController]
[Route("api/v1/[controller]")]
public class HealthController : ControllerBase
{
    private readonly IRedisCacheService _cacheService;
    private readonly IUserRepository _userRepository;
    private readonly IRefreshTokenRepository _refreshTokenRepository;
    private readonly IUserSessionRepository _userSessionRepository;
    private readonly CacheFallbackSettings _cacheFallbackSettings;
    private readonly HealthCheckSettings _healthCheckSettings;

    public HealthController(
        IRedisCacheService cacheService,
        IUserRepository userRepository,
        IRefreshTokenRepository refreshTokenRepository,
        IUserSessionRepository userSessionRepository,
        IOptions<CacheFallbackSettings> cacheFallbackOptions,
        IOptions<HealthCheckSettings> healthCheckOptions)
    {
        _cacheService = cacheService;
        _userRepository = userRepository;
        _refreshTokenRepository = refreshTokenRepository;
        _userSessionRepository = userSessionRepository;
        _cacheFallbackSettings = cacheFallbackOptions.Value;
        _healthCheckSettings = healthCheckOptions.Value;
    }

    /// <summary>
    /// Check overall system health
    /// </summary>
    /// <returns>System health status</returns>
    [HttpGet]
    public async Task<IActionResult> GetHealth()
    {
        try
        {
            var healthStatus = new
            {
                Status = "Healthy",
                Timestamp = DateTime.UtcNow,
                Services = new
                {
                    Cache = await CheckCacheHealthAsync(),
                    Database = await CheckDatabaseHealthAsync(),
                    RefreshTokens = await CheckRefreshTokenHealthAsync(),
                    UserSessions = await CheckUserSessionHealthAsync()
                }
            };

            return Ok(healthStatus);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new
            {
                Status = "Unhealthy",
                Timestamp = DateTime.UtcNow,
                Error = ex.Message
            });
        }
    }

    /// <summary>
    /// Check cache health specifically
    /// </summary>
    /// <returns>Cache health status</returns>
    [HttpGet("cache")]
    public async Task<IActionResult> GetCacheHealth()
    {
        try
        {
            var cacheHealth = await CheckCacheHealthAsync();
            return Ok(cacheHealth);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new
            {
                Status = "Unhealthy",
                Timestamp = DateTime.UtcNow,
                Error = ex.Message
            });
        }
    }

    /// <summary>
    /// Check database health specifically
    /// </summary>
    /// <returns>Database health status</returns>
    [HttpGet("database")]
    public async Task<IActionResult> GetDatabaseHealth()
    {
        try
        {
            var databaseHealth = await CheckDatabaseHealthAsync();
            return Ok(databaseHealth);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new
            {
                Status = "Unhealthy",
                Timestamp = DateTime.UtcNow,
                Error = ex.Message
            });
        }
    }

    /// <summary>
    /// Check refresh token system health
    /// </summary>
    /// <returns>Refresh token system health status</returns>
    [HttpGet("refresh-tokens")]
    public async Task<IActionResult> GetRefreshTokenHealth()
    {
        try
        {
            var refreshTokenHealth = await CheckRefreshTokenHealthAsync();
            return Ok(refreshTokenHealth);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new
            {
                Status = "Unhealthy",
                Timestamp = DateTime.UtcNow,
                Error = ex.Message
            });
        }
    }

    /// <summary>
    /// Check user session system health
    /// </summary>
    /// <returns>User session system health status</returns>
    [HttpGet("user-sessions")]
    public async Task<IActionResult> GetUserSessionHealth()
    {
        try
        {
            var userSessionHealth = await CheckUserSessionHealthAsync();
            return Ok(userSessionHealth);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new
            {
                Status = "Unhealthy",
                Timestamp = DateTime.UtcNow,
                Error = ex.Message
            });
        }
    }

    /// <summary>
    /// Try to recover cache connection
    /// </summary>
    /// <returns>Cache recovery status</returns>
    [HttpPost("cache/recover")]
    public async Task<IActionResult> RecoverCache()
    {
        try
        {
            var recoveryResult = await _cacheService.TryRecoverCacheAsync();
            return Ok(new
            {
                Status = recoveryResult ? "Recovered" : "Failed",
                Timestamp = DateTime.UtcNow,
                CacheAvailable = _cacheService.IsCacheAvailable()
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new
            {
                Status = "Failed",
                Timestamp = DateTime.UtcNow,
                Error = ex.Message
            });
        }
    }

    /// <summary>
    /// Clean up expired tokens and sessions
    /// </summary>
    /// <returns>Cleanup results</returns>
    [HttpPost("cleanup")]
    public async Task<IActionResult> Cleanup()
    {
        try
        {
            var expiredRefreshTokens = await _refreshTokenRepository.DeleteExpiredTokensAsync();
            var expiredSessions = await _userSessionRepository.CleanupExpiredSessionsAsync();

            return Ok(new
            {
                Status = "Completed",
                Timestamp = DateTime.UtcNow,
                CleanupResults = new
                {
                    ExpiredRefreshTokensRemoved = expiredRefreshTokens,
                    ExpiredSessionsRemoved = expiredSessions
                }
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new
            {
                Status = "Failed",
                Timestamp = DateTime.UtcNow,
                Error = ex.Message
            });
        }
    }

    /// <summary>
    /// Check cache health
    /// </summary>
    private async Task<object> CheckCacheHealthAsync()
    {
        var isAvailable = _cacheService.IsCacheAvailable();

        if (isAvailable)
        {
            try
            {
                // Test cache operations
                var testKey = $"health_check_{Guid.NewGuid()}";
                var testValue = "test";

                await _cacheService.SetAsync(testKey, testValue, TimeSpan.FromMinutes(1));
                var retrievedValue = await _cacheService.GetAsync<string>(testKey);
                await _cacheService.RemoveAsync(testKey);

                return new
                {
                    Status = "Healthy",
                    Available = true,
                    TestResult = retrievedValue == testValue ? "Passed" : "Failed"
                };
            }
            catch (Exception ex)
            {
                return new
                {
                    Status = "Unhealthy",
                    Available = false,
                    Error = ex.Message
                };
            }
        }

        return new
        {
            Status = "Unavailable",
            Available = false,
            Message = "Cache service is not available"
        };
    }

    /// <summary>
    /// Check database health
    /// </summary>
    private async Task<object> CheckDatabaseHealthAsync()
    {
        try
        {
            // Test database connection by getting a user (simple test)
            var users = await _userRepository.GetAllAsync();
            int userCount = 0;
            if (users != null)
            {
                userCount = users.Count();
            }

            return new
            {
                Status = "Healthy",
                Available = true,
                UserCount = userCount
            };
        }
        catch (Exception ex)
        {
            return new
            {
                Status = "Unhealthy",
                Available = false,
                Error = ex.Message
            };
        }
    }

    /// <summary>
    /// Check refresh token system health
    /// </summary>
    private async Task<object> CheckRefreshTokenHealthAsync()
    {
        try
        {
            // Test refresh token repository
            var expiredTokens = await _refreshTokenRepository.DeleteExpiredTokensAsync();

            return new
            {
                Status = "Healthy",
                Available = true,
                ExpiredTokensCleaned = expiredTokens
            };
        }
        catch (Exception ex)
        {
            return new
            {
                Status = "Unhealthy",
                Available = false,
                Error = ex.Message
            };
        }
    }

    /// <summary>
    /// Check user session system health
    /// </summary>
    private async Task<object> CheckUserSessionHealthAsync()
    {
        try
        {
            // Test user session repository
            var expiredSessions = await _userSessionRepository.CleanupExpiredSessionsAsync();

            return new
            {
                Status = "Healthy",
                Available = true,
                ExpiredSessionsCleaned = expiredSessions
            };
        }
        catch (Exception ex)
        {
            return new
            {
                Status = "Unhealthy",
                Available = false,
                Error = ex.Message
            };
        }
    }
}
