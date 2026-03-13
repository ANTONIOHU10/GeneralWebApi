namespace GeneralWebApi.DTOs.ContractTemplate;

/// <summary>
/// DTO for creating a contract template.
/// </summary>
public class CreateContractTemplateDto
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string ContractType { get; set; } = string.Empty;
    public string TemplateContent { get; set; } = string.Empty;
    public string? Variables { get; set; }
    public string? Category { get; set; }
    public bool IsActive { get; set; } = true;
    public bool IsDefault { get; set; }
    public string? Tags { get; set; }
    public string? LegalRequirements { get; set; }
    public string? ApprovalWorkflow { get; set; }
    public int? ParentTemplateId { get; set; }
}
