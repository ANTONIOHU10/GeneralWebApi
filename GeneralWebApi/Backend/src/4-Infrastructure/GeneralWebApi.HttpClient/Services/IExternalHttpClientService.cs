using GeneralWebApi.HttpClient.Configurations;

namespace GeneralWebApi.HttpClient.Services;

/// <summary>
/// Service interface for making HTTP requests to external APIs
/// </summary>
public interface IExternalHttpClientService
{
    /// <summary>
    /// Send GET request to external API by configuration name
    /// </summary>
    Task<HttpResponseModel<string>> GetAsync(string configName, HttpRequestModel? request = null, CancellationToken cancellationToken = default);

    /// <summary>
    /// Send POST request to external API by configuration name
    /// </summary>
    Task<HttpResponseModel<string>> PostAsync(string configName, HttpRequestModel? request = null, CancellationToken cancellationToken = default);

    /// <summary>
    /// Send PUT request to external API by configuration name
    /// </summary>
    Task<HttpResponseModel<string>> PutAsync(string configName, HttpRequestModel? request = null, CancellationToken cancellationToken = default);

    /// <summary>
    /// Send DELETE request to external API by configuration name
    /// </summary>
    Task<HttpResponseModel<string>> DeleteAsync(string configName, HttpRequestModel? request = null, CancellationToken cancellationToken = default);

    /// <summary>
    /// Send custom HTTP request to external API by configuration name
    /// </summary>
    Task<HttpResponseModel<string>> SendAsync(string configName, string method, HttpRequestModel? request = null, CancellationToken cancellationToken = default);
}