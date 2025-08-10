namespace GeneralWebApi.Contracts.Responses;

/// <summary>
/// Response DTO for External API Configuration
/// Contains selected properties for API responses, excluding sensitive information
/// </summary>
/// 
/// not showing the sensitive information like ApiKey, AuthToken, Username, Password, ClientId, ClientSecret
public class ExternalApiConfigResponse
{
    // Basic identification
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;

    // API configuration details
    public string BaseUrl { get; set; } = string.Empty;
    public string? Endpoint { get; set; }
    public string HttpMethod { get; set; } = string.Empty;
    public int TimeoutSeconds { get; set; }

    // Metadata
    public string? Description { get; set; }
    public string? Category { get; set; }

    // Status and audit (non-sensitive)
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public string CreatedBy { get; set; } = string.Empty;
    public DateTime? UpdatedAt { get; set; }
    public string? UpdatedBy { get; set; }
    public int Version { get; set; }
    public int SortOrder { get; set; }
    public string? Remarks { get; set; }
}