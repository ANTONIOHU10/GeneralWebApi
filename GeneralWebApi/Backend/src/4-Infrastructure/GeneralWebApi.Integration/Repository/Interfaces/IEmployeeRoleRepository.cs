using GeneralWebApi.Domain.Entities.Permissions;

namespace GeneralWebApi.Integration.Repository.Interfaces;

/// <summary>
/// Employee role repository interface
/// </summary>
public interface IEmployeeRoleRepository
{
    Task<EmployeeRole?> GetByIdAsync(int id);
    Task<EmployeeRole?> GetByEmployeeAndRoleAsync(int employeeId, int roleId);
    Task<List<EmployeeRole>> GetByEmployeeIdAsync(int employeeId);
    Task<List<EmployeeRole>> GetByRoleIdAsync(int roleId);
    Task<List<EmployeeRole>> GetAllAsync();
    Task<EmployeeRole> CreateAsync(EmployeeRole employeeRole);
    Task<EmployeeRole> UpdateAsync(EmployeeRole employeeRole);
    Task<bool> DeleteAsync(int id);
    Task<bool> DeleteByEmployeeAndRoleAsync(int employeeId, int roleId);
    Task<bool> ExistsAsync(int id);
    Task<bool> ExistsByEmployeeAndRoleAsync(int employeeId, int roleId);
    Task<List<EmployeeRole>> SearchAsync(int? employeeId, string? employeeName, string? employeeNumber, int? roleId, string? roleName, bool? isActive, DateTime? assignedFrom, DateTime? assignedTo, DateTime? expiryFrom, DateTime? expiryTo, string? sortBy, bool sortDescending, int pageNumber, int pageSize);
}
