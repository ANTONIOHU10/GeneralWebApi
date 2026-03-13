namespace GeneralWebApi.DTOs.ContractTemplate;

/// <summary>
/// Contract template list item DTO for paged list.
/// </summary>
public class ContractTemplateListDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string ContractType { get; set; } = string.Empty;
    public string? Category { get; set; }
    public bool IsActive { get; set; }
    public bool IsDefault { get; set; }
    public int UsageCount { get; set; }
    public int Version { get; set; }
    public DateTime CreatedAt { get; set; }
}
