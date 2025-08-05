using System.Text.Json;
using StackExchange.Redis;

namespace GeneralWebApi.Caching.Services;

public class RedisCacheService : IRedisCacheService
{
    private readonly IDatabase _database;
    private readonly JsonSerializerOptions _jsonOptions;

    public RedisCacheService(IDatabase database)
    {
        _database = database;
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
        var value = await _database.StringGetAsync(key);
        if (!value.HasValue)
            return default;

        return JsonSerializer.Deserialize<T>(value!, _jsonOptions);
    }

    public async Task SetAsync<T>(string key, T value, TimeSpan? expiry = null)
    {
        var serializedValue = JsonSerializer.Serialize(value, _jsonOptions);
        await _database.StringSetAsync(key, serializedValue, expiry);
    }

    public async Task RemoveAsync(string key)
    {
        await _database.KeyDeleteAsync(key);
    }

    public async Task<bool> ExistsAsync(string key)
    {
        return await _database.KeyExistsAsync(key);
    }

    public async Task<TimeSpan?> GetTimeToLiveAsync(string key)
    {
        return await _database.KeyTimeToLiveAsync(key);
    }

    public async Task<bool> SetExpiryAsync(string key, TimeSpan expiry)
    {
        return await _database.KeyExpireAsync(key, expiry);
    }

    public async Task<long> IncrementAsync(string key, long value = 1)
    {
        return await _database.StringIncrementAsync(key, value);
    }

    public async Task<double> IncrementAsync(string key, double value = 1)
    {
        return await _database.StringIncrementAsync(key, value);
    }

    public async Task<IDatabase> GetDatabase()
    {
        return await Task.FromResult(_database);
    }
}