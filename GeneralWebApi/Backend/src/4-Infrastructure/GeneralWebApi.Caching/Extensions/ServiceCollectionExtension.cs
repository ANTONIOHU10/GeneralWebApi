using GeneralWebApi.Caching.Configuration;
using GeneralWebApi.Caching.Services;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using StackExchange.Redis;

namespace GeneralWebApi.Caching.Extensions;

public static class ServiceCollectionExtension
{
    public static IServiceCollection AddRedis(this IServiceCollection services, IConfiguration configuration)
    {
        // add the binder package, and get the appsettings.json configuration
        var redisConfiguration = configuration.GetSection("Redis").Get<RedisConfiguration>() ?? throw new InvalidOperationException("Redis configuration is not set");

        // setting ASP.NET Core Redis Cache
        services.AddStackExchangeRedisCache(options =>
        {
            options.Configuration = redisConfiguration.ConnectionString;
            options.InstanceName = redisConfiguration.InstanceName;
        });

        // add the redis pool multiplexer
        services.AddSingleton<IConnectionMultiplexer>(provider =>
        {
            var options = ConfigurationOptions.Parse(redisConfiguration.ConnectionString!);
            options.ConnectTimeout = redisConfiguration.ConnectTimeout;
            options.SyncTimeout = redisConfiguration.SyncTimeout;
            options.AbortOnConnectFail = redisConfiguration.AbortConnect;

            return ConnectionMultiplexer.Connect(options);
        });

        // add the redis database instance, 
        services.AddScoped<IDatabase>(provider =>
        {
            var redis = provider.GetRequiredService<IConnectionMultiplexer>();
            return redis.GetDatabase(redisConfiguration.Database);
        });

        // add the redis cache service
        services.AddScoped<IRedisCacheService, RedisCacheService>();

        return services;
    }
}