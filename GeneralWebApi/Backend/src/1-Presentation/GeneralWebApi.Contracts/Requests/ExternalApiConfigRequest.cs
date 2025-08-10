namespace GeneralWebApi.Contracts.Requests;

public class ExternalApiConfigRequest
{
    public string Name { get; set; } = string.Empty;
    public string BaseUrl { get; set; } = string.Empty;
    public string ApiKey { get; set; } = string.Empty;
    public string AuthToken { get; set; } = string.Empty;
    public string Username { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string ClientId { get; set; } = string.Empty;
    public string ClientSecret { get; set; } = string.Empty;
    public string Endpoint { get; set; } = string.Empty;
    public string HttpMethod { get; set; } = string.Empty;
    public string Headers { get; set; } = string.Empty;
    public int TimeoutSeconds { get; set; } = 30;
    public string Description { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
}