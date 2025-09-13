using GeneralWebApi.Domain.Entities.Base;

namespace GeneralWebApi.Domain.Entities.Permissions;


public class Permission : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Resource { get; set; } = string.Empty;
    public string Action { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;

    #region navigation properties
    public ICollection<RolePermission> RolePermissions { get; set; } = [];
    #endregion
}