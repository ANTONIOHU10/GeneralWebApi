using System.Text.Json;
using StackExchange.Redis;
using GeneralWebApi.Logging.Services;

namespace GeneralWebApi.Caching.Services;

public class RedisCacheService : IRedisCacheService
{
    private readonly IDatabase _database;
    private readonly JsonSerializerOptions _jsonOptions;
    private readonly ILoggingService? _logger;
    private bool _isCacheAvailable = true;

    public RedisCacheService(IDatabase database, ILoggingService? logger = null)
    {
        _database = database;
        _logger = logger;
        _jsonOptions = new JsonSerializerOptions
        {
            // set the json naming policy: all the properties of the class will be converted to camel case
            // UserName -> userName
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            // do not format the json string
            WriteIndented = false
        };
    }

    public async Task<T?> GetAsync<T>(string key)
    {
        try
        {
            if (!_isCacheAvailable)
                return default;

            var value = await _database.StringGetAsync(key);
            if (!value.HasValue)
                return default;

            return JsonSerializer.Deserialize<T>(value!, _jsonOptions);
        }
        catch (Exception ex)
        {
            _logger?.LogError("Redis cache GetAsync failed for key {Key}: {Error}", key, ex.Message);
            _isCacheAvailable = false;
            return default;
        }
    }

    public async Task SetAsync<T>(string key, T value, TimeSpan? expiry = null)
    {
        try
        {
            if (!_isCacheAvailable)
                return;

            var serializedValue = JsonSerializer.Serialize(value, _jsonOptions);
            await _database.StringSetAsync(key, serializedValue, expiry);
        }
        catch (Exception ex)
        {
            _logger?.LogError("Redis cache SetAsync failed for key {Key}: {Error}", key, ex.Message);
            _isCacheAvailable = false;
        }
    }

    public async Task RemoveAsync(string key)
    {
        try
        {
            if (!_isCacheAvailable)
                return;

            await _database.KeyDeleteAsync(key);
        }
        catch (Exception ex)
        {
            _logger?.LogError("Redis cache RemoveAsync failed for key {Key}: {Error}", key, ex.Message);
            _isCacheAvailable = false;
        }
    }

    public async Task<bool> ExistsAsync(string key)
    {
        try
        {
            if (!_isCacheAvailable)
                return false;

            return await _database.KeyExistsAsync(key);
        }
        catch (Exception ex)
        {
            _logger?.LogError("Redis cache ExistsAsync failed for key {Key}: {Error}", key, ex.Message);
            _isCacheAvailable = false;
            return false;
        }
    }

    public async Task<TimeSpan?> GetTimeToLiveAsync(string key)
    {
        try
        {
            if (!_isCacheAvailable)
                return null;

            return await _database.KeyTimeToLiveAsync(key);
        }
        catch (Exception ex)
        {
            _logger?.LogError("Redis cache GetTimeToLiveAsync failed for key {Key}: {Error}", key, ex.Message);
            _isCacheAvailable = false;
            return null;
        }
    }

    public async Task<bool> SetExpiryAsync(string key, TimeSpan expiry)
    {
        try
        {
            if (!_isCacheAvailable)
                return false;

            return await _database.KeyExpireAsync(key, expiry);
        }
        catch (Exception ex)
        {
            _logger?.LogError("Redis cache SetExpiryAsync failed for key {Key}: {Error}", key, ex.Message);
            _isCacheAvailable = false;
            return false;
        }
    }

    public async Task<long> IncrementAsync(string key, long value = 1)
    {
        try
        {
            if (!_isCacheAvailable)
                return 0;

            return await _database.StringIncrementAsync(key, value);
        }
        catch (Exception ex)
        {
            _logger?.LogError("Redis cache IncrementAsync failed for key {Key}: {Error}", key, ex.Message);
            _isCacheAvailable = false;
            return 0;
        }
    }

    public async Task<double> IncrementAsync(string key, double value = 1)
    {
        try
        {
            if (!_isCacheAvailable)
                return 0;

            return await _database.StringIncrementAsync(key, value);
        }
        catch (Exception ex)
        {
            _logger?.LogError("Redis cache IncrementAsync (double) failed for key {Key}: {Error}", key, ex.Message);
            _isCacheAvailable = false;
            return 0;
        }
    }

    public async Task<IDatabase> GetDatabase()
    {
        return await Task.FromResult(_database);
    }

    /// <summary>
    /// Check if cache is available
    /// </summary>
    public bool IsCacheAvailable()
    {
        return _isCacheAvailable;
    }

    /// <summary>
    /// Try to recover cache connection
    /// </summary>
    public async Task<bool> TryRecoverCacheAsync()
    {
        try
        {
            // Simple ping to test connection
            await _database.PingAsync();
            _isCacheAvailable = true;
            _logger?.LogInformation("Redis cache connection recovered successfully");
            return true;
        }
        catch (Exception ex)
        {
            _logger?.LogError("Failed to recover Redis cache connection: {Error}", ex.Message);
            return false;
        }
    }
}