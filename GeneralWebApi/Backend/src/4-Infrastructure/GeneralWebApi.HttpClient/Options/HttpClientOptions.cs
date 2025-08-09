namespace GeneralWebApi.HttpClient.Models;

/// <summary>
/// Configuration options for HttpClient service
/// </summary>
public class HttpClientOptions
{
    /// <summary>
    /// Default timeout in seconds
    /// </summary>
    public int DefaultTimeoutSeconds { get; set; } = 30;

    /// <summary>
    /// Enable request/response logging
    /// </summary>
    public bool EnableLogging { get; set; } = true;
}