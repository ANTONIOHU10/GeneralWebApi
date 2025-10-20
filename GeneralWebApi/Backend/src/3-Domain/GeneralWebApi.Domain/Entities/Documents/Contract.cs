using GeneralWebApi.Domain.Entities.Anagraphy;
using GeneralWebApi.Domain.Entities.Base;

namespace GeneralWebApi.Domain.Entities.Documents;

public class Contract : BaseEntity
{
    public int EmployeeId { get; set; }
    public string ContractType { get; set; } = string.Empty; // Indefinite, Fixed, PartTime
    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public string Status { get; set; } = "Active"; // Active, Expired, Terminated
    public decimal? Salary { get; set; }
    public string? Notes { get; set; }
    public DateTime? RenewalReminderDate { get; set; }

    #region navigation properties
    public Employee Employee { get; set; } = null!;
    #endregion
}