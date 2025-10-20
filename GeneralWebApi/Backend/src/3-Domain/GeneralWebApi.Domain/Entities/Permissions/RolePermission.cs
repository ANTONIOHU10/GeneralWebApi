using GeneralWebApi.Domain.Entities.Base;

namespace GeneralWebApi.Domain.Entities.Permissions;

public class RolePermission : BaseEntity
{
    public int RoleId { get; set; }
    public int PermissionId { get; set; }
    public DateTime AssignedDate { get; set; } = DateTime.UtcNow;
    public DateTime? ExpiryDate { get; set; }

    #region navigation properties
    public Role Role { get; set; } = null!;
    public Permission Permission { get; set; } = null!;
    #endregion
}