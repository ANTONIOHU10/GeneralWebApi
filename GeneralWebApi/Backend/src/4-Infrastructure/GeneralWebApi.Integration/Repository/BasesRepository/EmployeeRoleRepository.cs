using GeneralWebApi.Domain.Entities.Permissions;
using GeneralWebApi.Integration.Context;
using GeneralWebApi.Integration.Repository.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace GeneralWebApi.Integration.Repository.BasesRepository;

/// <summary>
/// Employee role repository implementation
/// </summary>
public class EmployeeRoleRepository : IEmployeeRoleRepository
{
    private readonly ApplicationDbContext _context;

    public EmployeeRoleRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<EmployeeRole?> GetByIdAsync(int id)
    {
        return await _context.EmployeeRoles
            .Include(er => er.Employee)
            .Include(er => er.Role)
            .FirstOrDefaultAsync(er => er.Id == id);
    }

    public async Task<EmployeeRole?> GetByEmployeeAndRoleAsync(int employeeId, int roleId)
    {
        return await _context.EmployeeRoles
            .Include(er => er.Employee)
            .Include(er => er.Role)
            .FirstOrDefaultAsync(er => er.EmployeeId == employeeId && er.RoleId == roleId);
    }

    public async Task<List<EmployeeRole>> GetByEmployeeIdAsync(int employeeId)
    {
        return await _context.EmployeeRoles
            .Include(er => er.Employee)
            .Include(er => er.Role)
            .Where(er => er.EmployeeId == employeeId)
            .ToListAsync();
    }

    public async Task<List<EmployeeRole>> GetByRoleIdAsync(int roleId)
    {
        return await _context.EmployeeRoles
            .Include(er => er.Employee)
            .Include(er => er.Role)
            .Where(er => er.RoleId == roleId)
            .ToListAsync();
    }

    public async Task<List<EmployeeRole>> GetAllAsync()
    {
        return await _context.EmployeeRoles
            .Include(er => er.Employee)
            .Include(er => er.Role)
            .ToListAsync();
    }

    public async Task<EmployeeRole> CreateAsync(EmployeeRole employeeRole)
    {
        _context.EmployeeRoles.Add(employeeRole);
        await _context.SaveChangesAsync();
        return employeeRole;
    }

    public async Task<EmployeeRole> UpdateAsync(EmployeeRole employeeRole)
    {
        _context.EmployeeRoles.Update(employeeRole);
        await _context.SaveChangesAsync();
        return employeeRole;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var employeeRole = await _context.EmployeeRoles.FindAsync(id);
        if (employeeRole == null) return false;

        _context.EmployeeRoles.Remove(employeeRole);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeleteByEmployeeAndRoleAsync(int employeeId, int roleId)
    {
        var employeeRole = await _context.EmployeeRoles
            .FirstOrDefaultAsync(er => er.EmployeeId == employeeId && er.RoleId == roleId);

        if (employeeRole == null) return false;

        _context.EmployeeRoles.Remove(employeeRole);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> ExistsAsync(int id)
    {
        return await _context.EmployeeRoles.AnyAsync(er => er.Id == id);
    }

    public async Task<bool> ExistsByEmployeeAndRoleAsync(int employeeId, int roleId)
    {
        return await _context.EmployeeRoles.AnyAsync(er => er.EmployeeId == employeeId && er.RoleId == roleId);
    }

    public async Task<List<EmployeeRole>> SearchAsync(int? employeeId, string? employeeName, string? employeeNumber, int? roleId, string? roleName, bool? isActive, DateTime? assignedFrom, DateTime? assignedTo, DateTime? expiryFrom, DateTime? expiryTo, string? sortBy, bool sortDescending, int pageNumber, int pageSize)
    {
        var query = _context.EmployeeRoles
            .Include(er => er.Employee)
            .Include(er => er.Role)
            .AsQueryable();

        // Apply filters
        if (employeeId.HasValue)
            query = query.Where(er => er.EmployeeId == employeeId.Value);

        if (!string.IsNullOrEmpty(employeeName))
            query = query.Where(er => er.Employee.FirstName.Contains(employeeName) || er.Employee.LastName.Contains(employeeName));

        if (!string.IsNullOrEmpty(employeeNumber))
            query = query.Where(er => er.Employee.EmployeeNumber.Contains(employeeNumber));

        if (roleId.HasValue)
            query = query.Where(er => er.RoleId == roleId.Value);

        if (!string.IsNullOrEmpty(roleName))
            query = query.Where(er => er.Role.Name.Contains(roleName));

        if (isActive.HasValue)
        {
            if (isActive.Value)
                query = query.Where(er => er.ExpiryDate == null || er.ExpiryDate > DateTime.UtcNow);
            else
                query = query.Where(er => er.ExpiryDate != null && er.ExpiryDate <= DateTime.UtcNow);
        }

        if (assignedFrom.HasValue)
            query = query.Where(er => er.AssignedDate >= assignedFrom.Value);

        if (assignedTo.HasValue)
            query = query.Where(er => er.AssignedDate <= assignedTo.Value);

        if (expiryFrom.HasValue)
            query = query.Where(er => er.ExpiryDate >= expiryFrom.Value);

        if (expiryTo.HasValue)
            query = query.Where(er => er.ExpiryDate <= expiryTo.Value);

        // Apply sorting
        query = sortBy?.ToLower() switch
        {
            "employeename" => sortDescending ? query.OrderByDescending(er => er.Employee.FirstName + " " + er.Employee.LastName) : query.OrderBy(er => er.Employee.FirstName + " " + er.Employee.LastName),
            "rolename" => sortDescending ? query.OrderByDescending(er => er.Role.Name) : query.OrderBy(er => er.Role.Name),
            "assigneddate" => sortDescending ? query.OrderByDescending(er => er.AssignedDate) : query.OrderBy(er => er.AssignedDate),
            "expirydate" => sortDescending ? query.OrderByDescending(er => er.ExpiryDate) : query.OrderBy(er => er.ExpiryDate),
            _ => query.OrderByDescending(er => er.AssignedDate)
        };

        // Apply pagination
        return await query
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();
    }
}
