using GeneralWebApi.Domain.Entities.Permissions;

namespace GeneralWebApi.Integration.Repository.Interfaces;

/// <summary>
/// Role permission repository interface
/// </summary>
public interface IRolePermissionRepository
{
    Task<RolePermission?> GetByIdAsync(int id);
    Task<RolePermission?> GetByRoleAndPermissionAsync(int roleId, int permissionId);
    Task<List<RolePermission>> GetByRoleIdAsync(int roleId);
    Task<List<RolePermission>> GetByPermissionIdAsync(int permissionId);
    Task<List<RolePermission>> GetAllAsync();
    Task<RolePermission> CreateAsync(RolePermission rolePermission);
    Task<RolePermission> UpdateAsync(RolePermission rolePermission);
    Task<bool> DeleteAsync(int id);
    Task<bool> DeleteByRoleAndPermissionAsync(int roleId, int permissionId);
    Task<bool> ExistsAsync(int id);
    Task<bool> ExistsByRoleAndPermissionAsync(int roleId, int permissionId);
    Task<List<RolePermission>> GetByRoleIdsAsync(List<int> roleIds);
}
