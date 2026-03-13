using GeneralWebApi.Domain.Entities.Base;

namespace GeneralWebApi.Domain.Entities.Documents;

/// <summary>
/// Contract template entity for reusable contract content and variables.
/// </summary>
public class ContractTemplate : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string ContractType { get; set; } = string.Empty;
    public string TemplateContent { get; set; } = string.Empty;
    public string? Variables { get; set; }
    public string? Category { get; set; }
    public bool IsDefault { get; set; }
    public int UsageCount { get; set; }
    public string? Tags { get; set; }
    public string? LegalRequirements { get; set; }
    public string? ApprovalWorkflow { get; set; }
    public int? ParentTemplateId { get; set; }

    #region Navigation properties

    public ContractTemplate? ParentTemplate { get; set; }

    #endregion
}
