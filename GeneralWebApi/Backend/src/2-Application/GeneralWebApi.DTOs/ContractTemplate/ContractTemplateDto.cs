namespace GeneralWebApi.DTOs.ContractTemplate;

/// <summary>
/// Full contract template DTO for get-by-id and create response.
/// </summary>
public class ContractTemplateDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string ContractType { get; set; } = string.Empty;
    public string TemplateContent { get; set; } = string.Empty;
    public string? Variables { get; set; }
    public string? Category { get; set; }
    public bool IsActive { get; set; }
    public bool IsDefault { get; set; }
    public int UsageCount { get; set; }
    public string? Tags { get; set; }
    public string? LegalRequirements { get; set; }
    public string? ApprovalWorkflow { get; set; }
    public int Version { get; set; }
    public int? ParentTemplateId { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}
