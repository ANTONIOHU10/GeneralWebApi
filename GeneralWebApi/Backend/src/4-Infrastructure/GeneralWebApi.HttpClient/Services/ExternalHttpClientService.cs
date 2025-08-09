using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using GeneralWebApi.Domain.Entities;
using GeneralWebApi.HttpClient.Models;
using GeneralWebApi.Integration.Repository;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace GeneralWebApi.HttpClient.Services;

/// <summary>
/// Implementation of external HTTP client service
/// </summary>
public class ExternalHttpClientService : IExternalHttpClientService
{
    // using factory to manage http client instances automatically
    private readonly IHttpClientFactory _httpClientFactory;

    // using repository to get api config from database
    private readonly IExternalApiConfigRepository _apiConfigRepository;
    private readonly ILogger<ExternalHttpClientService> _logger;

    // using options to configure http client using appsettings.json    
    private readonly HttpClientOptions _options;

    // using json options to deserialize response
    private readonly JsonSerializerOptions _jsonOptions;

    public ExternalHttpClientService(
        IHttpClientFactory httpClientFactory,
        IExternalApiConfigRepository apiConfigRepository,
        ILogger<ExternalHttpClientService> logger,
        IOptions<HttpClientOptions> options)
    {
        _httpClientFactory = httpClientFactory;
        _apiConfigRepository = apiConfigRepository;
        _logger = logger;
        _options = options.Value;
        _jsonOptions = new JsonSerializerOptions
        {
            // to save memory and performance, we use case insensitive and camel case
            PropertyNameCaseInsensitive = true,
            // to convert to camel case from PascalCase of class properties
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        };
    }

    public async Task<HttpResponseModel<string>> GetAsync(string configName, HttpRequestModel? request = null, CancellationToken cancellationToken = default)
    {
        return await SendAsync(configName, "GET", request, cancellationToken);
    }

    public async Task<HttpResponseModel<string>> PostAsync(string configName, HttpRequestModel? request = null, CancellationToken cancellationToken = default)
    {
        return await SendAsync(configName, "POST", request, cancellationToken);
    }

    public async Task<HttpResponseModel<string>> PutAsync(string configName, HttpRequestModel? request = null, CancellationToken cancellationToken = default)
    {
        return await SendAsync(configName, "PUT", request, cancellationToken);
    }

    public async Task<HttpResponseModel<string>> DeleteAsync(string configName, HttpRequestModel? request = null, CancellationToken cancellationToken = default)
    {
        return await SendAsync(configName, "DELETE", request, cancellationToken);
    }



    /// <summary>
    /// 
    /// </summary>
    /// <typeparam name="T"></typeparam>
    /// <param name="configName"> name of the api config in database </param>
    /// <param name="method"> method of the request </param>
    /// <param name="request"> request model </param>
    /// <param name="cancellationToken"> cancellation token </param>
    /// <returns></returns>
    /// <exception cref="InvalidOperationException"></exception>


    // this is the basic method to send request to external api
    // it is used by other methods to encapsulate every specific type of request
    // just like: Get, Post, Put, Delete, etc.


    public async Task<HttpResponseModel<string>> SendAsync(string configName, string method, HttpRequestModel? request = null, CancellationToken cancellationToken = default)
    {
        var stopwatch = System.Diagnostics.Stopwatch.StartNew();

        try
        {
            // Get API configuration from database
            var apiConfig = await _apiConfigRepository.GetByNameAsync(configName, cancellationToken);
            if (apiConfig == null)
            {
                throw new InvalidOperationException($"API configuration '{configName}' not found or inactive");
            }

            // Create HTTP client
            var httpClient = _httpClientFactory.CreateClient();

            // Configure timeout
            var timeout = request?.TimeoutSeconds ?? apiConfig.TimeoutSeconds;
            httpClient.Timeout = TimeSpan.FromSeconds(timeout);

            // Build request URL
            var requestUrl = BuildRequestUrl(apiConfig, request);

            // Create HTTP request message
            var httpRequestMessage = new HttpRequestMessage(new HttpMethod(method), requestUrl);

            // Add headers
            ConfigureHeaders(httpRequestMessage, apiConfig, request);

            // Add request body
            if (request?.Body != null && method != "GET")
            {
                httpRequestMessage.Content = new StringContent(request.Body, Encoding.UTF8, request.ContentType);
            }

            // Send request
            var response = await httpClient.SendAsync(httpRequestMessage, cancellationToken);

            stopwatch.Stop();

            // Process raw response
            var rawContent = await response.Content.ReadAsStringAsync(cancellationToken);

            var responseModel = new HttpResponseModel<string>
            {
                StatusCode = (int)response.StatusCode,
                IsSuccess = response.IsSuccessStatusCode,
                Data = rawContent,
                RawContent = rawContent,
                DurationMs = stopwatch.ElapsedMilliseconds
            };

            // Add response headers
            foreach (var header in response.Headers)
            {
                responseModel.Headers[header.Key] = string.Join(", ", header.Value);
            }

            return responseModel;
        }
        catch (Exception ex)
        {
            stopwatch.Stop();
            _logger.LogError(ex, "Error sending raw request to {ConfigName}", configName);

            return new HttpResponseModel<string>
            {
                IsSuccess = false,
                ErrorMessage = ex.Message,
                DurationMs = stopwatch.ElapsedMilliseconds
            };
        }
    }

    private static string BuildRequestUrl(ExternalApiConfig apiConfig, HttpRequestModel? request)
    {
        var baseUrl = apiConfig.BaseUrl.TrimEnd('/');
        var endpoint = apiConfig.Endpoint?.TrimStart('/') ?? "";
        var url = $"{baseUrl}/{endpoint}".TrimEnd('/');

        // Add query parameters, generally for GET requests
        if (request?.QueryParameters != null && request.QueryParameters.Any())
        {
            // encode query parameters "&" to avoid injection attacks
            // request.QueryParameters is a dictionary of key-value pairs
            // kvp = key-value pair
            // kvp.key = key of the query parameter, kvp.value = value of the query parameter
            // $"{Uri.EscapeDataString(kvp.Key)}={Uri.EscapeDataString(kvp.Value)}" = encode for each pair
            // then join all pairs with "&" to form the query string "string.Join("&", ...)"
            var queryString = string.Join("&", request.QueryParameters.Select(kvp => $"{Uri.EscapeDataString(kvp.Key)}={Uri.EscapeDataString(kvp.Value)}"));
            url += $"?{queryString}";
        }

        return url;
    }

    private void ConfigureHeaders(HttpRequestMessage request, ExternalApiConfig apiConfig, HttpRequestModel? requestModel)
    {
        // Add API key if configured
        if (!string.IsNullOrEmpty(apiConfig.ApiKey))
        {
            request.Headers.Add("X-API-Key", apiConfig.ApiKey);
        }

        // Add auth token if configured: Bearer token
        if (!string.IsNullOrEmpty(apiConfig.AuthToken))
        {
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", apiConfig.AuthToken);
        }

        // Add basic auth if configured
        if (!string.IsNullOrEmpty(apiConfig.Username) && !string.IsNullOrEmpty(apiConfig.Password))
        {
            var credentials = Convert.ToBase64String(Encoding.ASCII.GetBytes($"{apiConfig.Username}:{apiConfig.Password}"));
            request.Headers.Authorization = new AuthenticationHeaderValue("Basic", credentials);
        }

        // Add custom headers from configuration
        if (!string.IsNullOrEmpty(apiConfig.Headers))
        {
            try
            {
                var headers = JsonSerializer.Deserialize<Dictionary<string, string>>(apiConfig.Headers, _jsonOptions);
                if (headers != null)
                {
                    foreach (var header in headers)
                    {
                        request.Headers.Add(header.Key, header.Value);
                    }
                }
            }
            catch (JsonException ex)
            {
                _logger.LogWarning(ex, "Failed to parse headers from API config {ConfigName}", apiConfig.Name);
            }
        }

        // Add additional headers from request
        if (requestModel?.AdditionalHeaders != null)
        {
            foreach (var header in requestModel.AdditionalHeaders)
            {
                request.Headers.Add(header.Key, header.Value);
            }
        }
    }
}