using GeneralWebApi.Domain.Entities.Permissions;

namespace GeneralWebApi.Integration.Repository.Interfaces;

/// <summary>
/// Role repository interface
/// </summary>
public interface IRoleRepository
{
    Task<Role?> GetByIdAsync(int id);
    Task<Role?> GetByNameAsync(string name);
    Task<List<Role>> GetAllAsync();
    Task<List<Role>> GetByEmployeeIdAsync(int employeeId);
    Task<Role> CreateAsync(Role role);
    Task<Role> UpdateAsync(Role role);
    Task<bool> DeleteAsync(int id);
    Task<bool> ExistsAsync(int id);
    Task<bool> ExistsByNameAsync(string name);
    Task<List<Role>> SearchAsync(string? name, string? description, int? minEmployeeCount, int? maxEmployeeCount, DateTime? createdFrom, DateTime? createdTo, string? sortBy, bool sortDescending, int pageNumber, int pageSize);
    Task<int> GetEmployeeCountAsync(int roleId);
}
