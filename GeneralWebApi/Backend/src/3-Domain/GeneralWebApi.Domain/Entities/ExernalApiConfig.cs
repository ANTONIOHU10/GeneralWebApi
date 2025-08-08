using GeneralWebApi.Domain.Entities.Base;

namespace GeneralWebApi.Domain.Entities;

public class ExternalApiConfig : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string BaseUrl { get; set; } = string.Empty;
    public string ApiKey { get; set; } = string.Empty;
    public string? AuthToken { get; set; }
    public string? Username { get; set; }
    public string? Password { get; set; }
    public string? ClientId { get; set; }
    public string? ClientSecret { get; set; }
    public string? Endpoint { get; set; }
    public string HttpMethod { get; set; } = "GET";
    public string? Headers { get; set; }
    public int TimeoutSeconds { get; set; } = 30;
    public bool IsActive { get; set; } = true;
    public string? Description { get; set; }

    // for category: payment, notification, etc.
    public string? Category { get; set; }
}