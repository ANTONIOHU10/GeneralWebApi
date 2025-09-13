using GeneralWebApi.Domain.Entities.Anagraphy;
using GeneralWebApi.Domain.Entities.Base;

namespace GeneralWebApi.Domain.Entities.Permissions;

public class EmployeeRole : BaseEntity
{
    public int EmployeeId { get; set; }
    public int RoleId { get; set; }
    public DateTime AssignedDate { get; set; }
    public DateTime? ExpiryDate { get; set; }

    #region navigation properties
    public Employee Employee { get; set; } = null!;
    public Role Role { get; set; } = null!;
    #endregion
}