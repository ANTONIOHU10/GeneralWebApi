using GeneralWebApi.Domain.Entities.Anagraphy;
using GeneralWebApi.Domain.Entities.Base;

namespace GeneralWebApi.Domain.Entities.Documents;

public class IdentityDocument : BaseEntity
{
    public int EmployeeId { get; set; }
    public string DocumentType { get; set; } = string.Empty; // ID, Passport, DriverLicense, etc.
    public string DocumentNumber { get; set; } = string.Empty;
    public DateTime IssueDate { get; set; }
    public DateTime ExpirationDate { get; set; }
    public string IssuingAuthority { get; set; } = string.Empty;
    public string IssuingPlace { get; set; } = string.Empty;
    public string IssuingCountry { get; set; } = string.Empty;
    public string IssuingState { get; set; } = string.Empty;
    public string? Notes { get; set; }

    #region navigation properties
    public Employee Employee { get; set; } = null!;
    #endregion
}