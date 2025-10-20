using GeneralWebApi.Domain.Entities.Anagraphy;
using GeneralWebApi.Domain.Entities.Base;

namespace GeneralWebApi.Domain.Entities.Documents;

public class Certification : BaseEntity
{
    public int EmployeeId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string IssuingOrganization { get; set; } = string.Empty;
    public DateTime IssueDate { get; set; }
    public DateTime? ExpiryDate { get; set; }
    public string? CredentialId { get; set; }
    public string? CredentialUrl { get; set; }
    public string? Notes { get; set; }

    #region navigation properties
    public Employee Employee { get; set; } = null!;
    #endregion
}