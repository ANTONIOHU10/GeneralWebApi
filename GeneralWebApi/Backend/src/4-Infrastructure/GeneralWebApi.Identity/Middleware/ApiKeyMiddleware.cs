using GeneralWebApi.Identity.Configuration;
using GeneralWebApi.Logging.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;
using System.Security.Claims;

namespace GeneralWebApi.Identity.Middleware;

public class ApiKeyMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ApiKeySettings _apiKeySettings;
    private readonly ILoggingService _logger;

    public ApiKeyMiddleware(RequestDelegate next, IOptions<ApiKeySettings> apiKeySettings, ILoggingService logger)
    {
        _next = next;
        _apiKeySettings = apiKeySettings.Value;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        // 只处理需要 API Key 认证的请求
        if (context.Request.Headers.ContainsKey(_apiKeySettings.HeaderName))
        {
            var apiKey = context.Request.Headers[_apiKeySettings.HeaderName].FirstOrDefault();
            
            if (!string.IsNullOrEmpty(apiKey) && _apiKeySettings.ValidApiKeys.ContainsValue(apiKey))
            {
                var clientName = _apiKeySettings.ValidApiKeys.FirstOrDefault(x => x.Value == apiKey).Key;
                
                // 创建 API Key 身份
                var claims = new[]
                {
                    new Claim(ClaimTypes.Name, clientName),
                    new Claim(ClaimTypes.AuthenticationMethod, "ApiKey"),
                    new Claim("ClientId", clientName)
                };

                var identity = new ClaimsIdentity(claims, "ApiKey");
                context.User = new ClaimsPrincipal(identity);
                
                _logger.LogInformation($"API Key authentication successful for client: {clientName}");
            }
        }

        await _next(context);
    }
}