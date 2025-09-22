using GeneralWebApi.Domain.Entities.Permissions;

namespace GeneralWebApi.Integration.Repository.Interfaces;

/// <summary>
/// Permission repository interface
/// </summary>
public interface IPermissionRepository
{
    Task<Permission?> GetByIdAsync(int id);
    Task<Permission?> GetByNameAsync(string name);
    Task<List<Permission>> GetAllAsync();
    Task<List<Permission>> GetByRoleIdAsync(int roleId);
    Task<Permission> CreateAsync(Permission permission);
    Task<Permission> UpdateAsync(Permission permission);
    Task<bool> DeleteAsync(int id);
    Task<bool> ExistsAsync(int id);
    Task<bool> ExistsByNameAsync(string name);
    Task<List<Permission>> SearchAsync(string? name, string? resource, string? action, string? category, DateTime? createdFrom, DateTime? createdTo, string? sortBy, bool sortDescending, int pageNumber, int pageSize);
}
