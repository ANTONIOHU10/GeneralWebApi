using GeneralWebApi.Domain.Entities.Base;

namespace GeneralWebApi.Domain.Entities.Permissions;

// Employee -> EmployeeRole -> Role -> RolePermission -> Permission
public class Role : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;

    #region navigation properties
    public ICollection<EmployeeRole> EmployeeRoles { get; set; } = [];
    public ICollection<RolePermission> RolePermissions { get; set; } = [];
    #endregion
}