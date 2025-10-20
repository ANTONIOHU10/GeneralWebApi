using GeneralWebApi.Domain.Entities.Anagraphy;
using GeneralWebApi.Domain.Entities.Base;

namespace GeneralWebApi.Domain.Entities.Documents;

public class Education : BaseEntity
{
    public int EmployeeId { get; set; }
    public string Institution { get; set; } = string.Empty;
    public string Degree { get; set; } = string.Empty;
    public string FieldOfStudy { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public string? Grade { get; set; }
    public string? Description { get; set; }

    #region navigation properties
    public Employee Employee { get; set; } = null!;
    #endregion
}