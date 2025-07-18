using System.Threading.RateLimiting;
using GeneralWebApi.Contracts.Common;
using Microsoft.AspNetCore.RateLimiting;

namespace GeneralWebApi.WebApi.Extensions;

public static class RateLimiterExtension
{
    public static IServiceCollection AddCustomRateLimiter(this IServiceCollection services)
    {

        services.AddRateLimiter(options =>
        {
            options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;

            // custom the rejection response
            options.OnRejected = async (context, cancellationToken) =>
            {
                context.HttpContext.Response.StatusCode = StatusCodes.Status429TooManyRequests;
                context.HttpContext.Response.ContentType = "application/json";

                var response = ApiResponse<object>.ErrorResult(
                    error: "Too many requests",
                    statusCode: StatusCodes.Status429TooManyRequests,
                    message: "Rate limit exceeded. Please try again later."
                );

                await context.HttpContext.Response.WriteAsJsonAsync(response);
            };

            // add a new policy: Default
            options.AddPolicy("Default", context =>
            {
                return RateLimitPartition.GetTokenBucketLimiter("Default", _ =>
                new TokenBucketRateLimiterOptions
                {
                    // token bucket limiter
                    TokenLimit = 60,
                    // replenishment period
                    ReplenishmentPeriod = TimeSpan.FromSeconds(60),
                    TokensPerPeriod = 60,
                    AutoReplenishment = true
                }

                );

            });


        });

        return services;
    }
}