using GeneralWebApi.Caching.Services;
using GeneralWebApi.Caching.Configuration;
using GeneralWebApi.Integration.Repository.BasesRepository;
using GeneralWebApi.Integration.Context;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Microsoft.EntityFrameworkCore;

namespace GeneralWebApi.WebApi.Controllers.v1;

/// <summary>
/// Health check controller for monitoring system status
/// Provides endpoints to check cache, database, and overall system health
/// </summary>
[ApiController]
[Route("api/v1/[controller]")]
[Authorize] // Require authentication for health checks
public class HealthController : ControllerBase
{
    private readonly IRedisCacheService _cacheService;
    private readonly IUserRepository _userRepository;
    private readonly IRefreshTokenRepository _refreshTokenRepository;
    private readonly IUserSessionRepository _userSessionRepository;
    private readonly ApplicationDbContext _dbContext;
    private readonly CacheFallbackSettings _cacheFallbackSettings;
    private readonly HealthCheckSettings _healthCheckSettings;

    public HealthController(
        IRedisCacheService cacheService,
        IUserRepository userRepository,
        IRefreshTokenRepository refreshTokenRepository,
        IUserSessionRepository userSessionRepository,
        ApplicationDbContext dbContext,
        IOptions<CacheFallbackSettings> cacheFallbackOptions,
        IOptions<HealthCheckSettings> healthCheckOptions)
    {
        _cacheService = cacheService;
        _userRepository = userRepository;
        _refreshTokenRepository = refreshTokenRepository;
        _userSessionRepository = userSessionRepository;
        _dbContext = dbContext;
        _cacheFallbackSettings = cacheFallbackOptions.Value;
        _healthCheckSettings = healthCheckOptions.Value;
    }

    /// <summary>
    /// Check overall system health
    /// </summary>
    /// <returns>System health status</returns>
    [HttpGet]
    [Authorize(Policy = "AllRoles")] // All authenticated users can check system health
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
    [Authorize(Policy = "ManagerOrAdmin")] // Only managers and admins can check cache health
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
    /// Check cache health with detailed information
    /// </summary>
    private async Task<object> CheckCacheHealthAsync()
    {
        var isAvailable = _cacheService.IsCacheAvailable();

        if (isAvailable)
        {
            try
            {
                // Test cache operations and measure performance
                var stopwatch = System.Diagnostics.Stopwatch.StartNew();
                var testKey = $"health_check_{Guid.NewGuid()}";
                var testValue = "test";

                await _cacheService.SetAsync(testKey, testValue, TimeSpan.FromMinutes(1));
                var setTime = stopwatch.ElapsedMilliseconds;

                stopwatch.Restart();
                var retrievedValue = await _cacheService.GetAsync<string>(testKey);
                var getTime = stopwatch.ElapsedMilliseconds;

                stopwatch.Restart();
                await _cacheService.RemoveAsync(testKey);
                var removeTime = stopwatch.ElapsedMilliseconds;
                stopwatch.Stop();

                var testPassed = retrievedValue == testValue;
                return new
                {
                    Status = testPassed ? "Healthy" : "Unhealthy",
                    Available = testPassed,
                    TestResult = testPassed ? "Passed" : "Failed",
                    Performance = new
                    {
                        SetOperationMs = setTime,
                        GetOperationMs = getTime,
                        RemoveOperationMs = removeTime,
                        TotalMs = setTime + getTime + removeTime
                    },
                    Timestamp = DateTime.UtcNow
                };
            }
            catch (Exception ex)
            {
                return new
                {
                    Status = "Unhealthy",
                    Available = false,
                    Error = ex.Message,
                    Timestamp = DateTime.UtcNow
                };
            }
        }

        return new
        {
            Status = "Unavailable",
            Available = false,
            Message = "Cache service is not available",
            FallbackEnabled = _cacheFallbackSettings?.EnableDatabaseFallback ?? false,
            Timestamp = DateTime.UtcNow
        };
    }

    /// <summary>
    /// Check database health with detailed information
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

            // Get database statistics
            var dbStats = await GetDatabaseStatisticsAsync();

            // Get database connection info
            var connectionInfo = new
            {
                Status = "Connected",
                ResponseTime = await MeasureDatabaseResponseTimeAsync(),
                UserCount = userCount
            };

            return new
            {
                Status = "Healthy",
                Available = true,
                Connection = connectionInfo,
                Statistics = dbStats,
                Timestamp = DateTime.UtcNow
            };
        }
        catch (Exception ex)
        {
            return new
            {
                Status = "Unhealthy",
                Available = false,
                Error = ex.Message,
                Timestamp = DateTime.UtcNow
            };
        }
    }

    /// <summary>
    /// Get database statistics including table count, sizes, and other information
    /// </summary>
    private async Task<object> GetDatabaseStatisticsAsync()
    {
        try
        {
            // Use connection directly to execute raw SQL queries
            var connection = _dbContext.Database.GetDbConnection();
            var wasOpen = connection.State == System.Data.ConnectionState.Open;
            if (!wasOpen)
            {
                await connection.OpenAsync();
            }
            try
            {
                using var command = connection.CreateCommand();

                // Get table count
                command.CommandText = "SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE'";
                var tableCountObj = await command.ExecuteScalarAsync();
                var tableCount = Convert.ToInt32(tableCountObj);

                // Get database size information
                command.CommandText = @"
                    SELECT 
                        SUM(size) * 8 / 1024.0 as TotalSizeMB,
                        SUM(CASE WHEN type = 0 THEN size ELSE 0 END) * 8 / 1024.0 as DataSizeMB,
                        SUM(CASE WHEN type = 1 THEN size ELSE 0 END) * 8 / 1024.0 as LogSizeMB
                    FROM sys.database_files";

                DatabaseSizeInfo? dbSizeResult = null;
                using (var reader = await command.ExecuteReaderAsync())
                {
                    if (await reader.ReadAsync())
                    {
                        dbSizeResult = new DatabaseSizeInfo
                        {
                            TotalSizeMB = reader.GetDecimal(0),
                            DataSizeMB = reader.GetDecimal(1),
                            LogSizeMB = reader.GetDecimal(2)
                        };
                    }
                }

                // Get table sizes and row counts (top 10 largest tables)
                command.CommandText = @"
                    SELECT TOP 10
                        t.NAME AS TableName,
                        SUM(p.[rows]) AS [RowCount],
                        SUM(a.total_pages) * 8 / 1024.0 AS TotalSizeMB,
                        SUM(a.used_pages) * 8 / 1024.0 AS UsedSizeMB,
                        SUM(a.data_pages) * 8 / 1024.0 AS DataSizeMB
                    FROM sys.tables t
                    INNER JOIN sys.indexes i ON t.OBJECT_ID = i.object_id
                    INNER JOIN sys.partitions p ON i.object_id = p.OBJECT_ID AND i.index_id = p.index_id
                    INNER JOIN sys.allocation_units a ON p.partition_id = a.container_id
                    WHERE t.NAME NOT LIKE 'dt%' 
                        AND t.is_ms_shipped = 0
                        AND i.OBJECT_ID > 255
                        AND i.index_id IN (0, 1)
                    GROUP BY t.NAME
                    ORDER BY SUM(a.total_pages) DESC";

                var tableSizes = new List<TableSizeInfo>();
                using (var reader = await command.ExecuteReaderAsync())
                {
                    while (await reader.ReadAsync())
                    {
                        tableSizes.Add(new TableSizeInfo
                        {
                            TableName = reader.GetString(0),
                            RowCount = reader.GetInt64(1),
                            TotalSizeMB = reader.GetDecimal(2),
                            UsedSizeMB = reader.GetDecimal(3),
                            DataSizeMB = reader.GetDecimal(4)
                        });
                    }
                }

                // Get total row count across all tables
                var totalRowCount = tableSizes.Sum(t => t.RowCount);

                return new
                {
                    TableCount = tableCount,
                    TotalSizeMB = dbSizeResult?.TotalSizeMB ?? 0,
                    DataSizeMB = dbSizeResult?.DataSizeMB ?? 0,
                    LogSizeMB = dbSizeResult?.LogSizeMB ?? 0,
                    TotalRowCount = totalRowCount,
                    LargestTables = tableSizes.Select(t => new
                    {
                        TableName = t.TableName,
                        RowCount = t.RowCount,
                        TotalSizeMB = Math.Round(t.TotalSizeMB, 2),
                        UsedSizeMB = Math.Round(t.UsedSizeMB, 2),
                        DataSizeMB = Math.Round(t.DataSizeMB, 2)
                    }).ToList()
                };
            }
            finally
            {
                if (!wasOpen && connection.State == System.Data.ConnectionState.Open)
                {
                    await connection.CloseAsync();
                }
            }
        }
        catch (Exception ex)
        {
            // Return minimal info if statistics query fails
            return new
            {
                TableCount = 0,
                TotalSizeMB = 0,
                DataSizeMB = 0,
                LogSizeMB = 0,
                TotalRowCount = 0,
                LargestTables = new List<object>(),
                Error = ex.Message
            };
        }
    }

    /// <summary>
    /// Helper class for database size query result
    /// </summary>
    private class DatabaseSizeInfo
    {
        public decimal TotalSizeMB { get; set; }
        public decimal DataSizeMB { get; set; }
        public decimal LogSizeMB { get; set; }
    }

    /// <summary>
    /// Helper class for table size query result
    /// </summary>
    private class TableSizeInfo
    {
        public string TableName { get; set; } = string.Empty;
        public long RowCount { get; set; }
        public decimal TotalSizeMB { get; set; }
        public decimal UsedSizeMB { get; set; }
        public decimal DataSizeMB { get; set; }
    }

    /// <summary>
    /// Measure database response time
    /// </summary>
    private async Task<long> MeasureDatabaseResponseTimeAsync()
    {
        var stopwatch = System.Diagnostics.Stopwatch.StartNew();
        try
        {
            await _userRepository.GetAllAsync();
            stopwatch.Stop();
            return stopwatch.ElapsedMilliseconds;
        }
        catch
        {
            stopwatch.Stop();
            return -1; // Indicates error
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
