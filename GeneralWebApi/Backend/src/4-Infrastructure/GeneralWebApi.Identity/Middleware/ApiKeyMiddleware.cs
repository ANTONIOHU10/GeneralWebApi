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
        // only handle the requests that need API Key authentication
        if (context.Request.Headers.ContainsKey(_apiKeySettings.HeaderName))
        {
            //get the api key from the header
            var apiKey = context.Request.Headers[_apiKeySettings.HeaderName].FirstOrDefault();

            // validate the api key
            if (!string.IsNullOrEmpty(apiKey) && _apiKeySettings.ValidApiKeys.ContainsValue(apiKey))
            {
                // passed the api key validation, get the client name
                var clientName = _apiKeySettings.ValidApiKeys.FirstOrDefault(x => x.Value == apiKey).Key;

                // create the API Key identity
                var claims = new[]
                {
                    new Claim(ClaimTypes.Name, clientName),
                    new Claim(ClaimTypes.AuthenticationMethod, "ApiKey"),
                    new Claim("ClientId", clientName)
                };

                // create the identity for the client
                var identity = new ClaimsIdentity(claims, "ApiKey");

                // set the identity for the client, as a ClaimsPrincipa
                // all the upcoming requests will be authenticated by this ClaimsPrincipal
                // through the UseAuthentication middleware & the Authorization middleware
                context.User = new ClaimsPrincipal(identity);

                _logger.LogInformation($"API Key authentication successful for client: {clientName}");
            }
        }

        await _next(context);
    }
}