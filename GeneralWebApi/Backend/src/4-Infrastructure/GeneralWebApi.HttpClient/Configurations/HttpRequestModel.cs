using System.Text.Json;

namespace GeneralWebApi.HttpClient.Models;

/// <summary>
/// HTTP request model for external API calls
/// </summary>
public class HttpRequestModel
{
    /// <summary>
    /// Request body content (JSON string) - used for POST, PUT, DELETE requests
    /// </summary>
    public string? Body { get; set; }

    /// <summary>
    /// Query parameters - used for GET requests
    /// </summary>
    public Dictionary<string, string>? QueryParameters { get; set; }

    /// <summary>
    /// Additional headers to include in the request
    /// </summary>
    public Dictionary<string, string>? AdditionalHeaders { get; set; }

    /// <summary>
    /// Request timeout in seconds (overrides config default)
    /// </summary>
    public int? TimeoutSeconds { get; set; }

    /// <summary>
    /// Content type for the request body
    /// </summary>
    public string ContentType { get; set; } = "application/json";
}

