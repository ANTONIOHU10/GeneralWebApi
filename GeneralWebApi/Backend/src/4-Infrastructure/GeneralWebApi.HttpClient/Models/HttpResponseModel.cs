/// <summary>
/// HTTP response model from external API calls
/// </summary>
public class HttpResponseModel<T>
{
    /// <summary>
    /// Response status code
    /// </summary>
    public int StatusCode { get; set; }

    /// <summary>
    /// Response headers
    /// </summary>
    public Dictionary<string, string> Headers { get; set; } = new();

    /// <summary>
    /// Response body content
    /// </summary>
    public T? Data { get; set; }

    /// <summary>
    /// Raw response content as string
    /// </summary>
    public string? RawContent { get; set; }

    /// <summary>
    /// Indicates if the request was successful
    /// </summary>
    public bool IsSuccess { get; set; }

    /// <summary>
    /// Error message if request failed
    /// </summary>
    public string? ErrorMessage { get; set; }

    /// <summary>
    /// Request duration in milliseconds
    /// </summary>
    public long DurationMs { get; set; }
}