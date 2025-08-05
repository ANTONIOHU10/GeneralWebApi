using StackExchange.Redis;

namespace GeneralWebApi.Caching.Services;

public interface IRedisCacheService
{
    // Redis cache: key-value pair
    Task<T?> GetAsync<T>(string key);
    Task SetAsync<T>(string key, T value, TimeSpan? expiry = null);
    Task RemoveAsync(string key);
    Task<bool> ExistsAsync(string key);

    // get the ramained time of the cacheto live
    Task<TimeSpan?> GetTimeToLiveAsync(string key);
    Task<bool> SetExpiryAsync(string key, TimeSpan expiry);


    //count the number of the cache
    Task<long> IncrementAsync(string key, long value = 1);
    Task<double> IncrementAsync(string key, double value = 1);
    Task<IDatabase> GetDatabase();
}