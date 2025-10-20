using GeneralWebApi.Domain.Entities.Permissions;
using GeneralWebApi.Integration.Context;
using GeneralWebApi.Integration.Repository.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace GeneralWebApi.Integration.Repository.BasesRepository;

/// <summary>
/// Role repository implementation
/// </summary>
public class RoleRepository : IRoleRepository
{
    private readonly ApplicationDbContext _context;

    public RoleRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Role?> GetByIdAsync(int id)
    {
        return await _context.Roles
            .Include(r => r.RolePermissions)
                .ThenInclude(rp => rp.Permission)
            .Include(r => r.EmployeeRoles)
            .FirstOrDefaultAsync(r => r.Id == id);
    }

    public async Task<Role?> GetByNameAsync(string name)
    {
        return await _context.Roles
            .Include(r => r.RolePermissions)
                .ThenInclude(rp => rp.Permission)
            .Include(r => r.EmployeeRoles)
            .FirstOrDefaultAsync(r => r.Name == name);
    }

    public async Task<List<Role>> GetAllAsync()
    {
        return await _context.Roles
            .Include(r => r.RolePermissions)
                .ThenInclude(rp => rp.Permission)
            .Include(r => r.EmployeeRoles)
            .ToListAsync();
    }

    public async Task<List<Role>> GetByEmployeeIdAsync(int employeeId)
    {
        return await _context.Roles
            .Include(r => r.RolePermissions)
                .ThenInclude(rp => rp.Permission)
            .Include(r => r.EmployeeRoles)
            .Where(r => r.EmployeeRoles.Any(er => er.EmployeeId == employeeId))
            .ToListAsync();
    }

    public async Task<Role> CreateAsync(Role role)
    {
        _context.Roles.Add(role);
        await _context.SaveChangesAsync();
        return role;
    }

    public async Task<Role> UpdateAsync(Role role)
    {
        _context.Roles.Update(role);
        await _context.SaveChangesAsync();
        return role;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var role = await _context.Roles.FindAsync(id);
        if (role == null) return false;

        _context.Roles.Remove(role);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> ExistsAsync(int id)
    {
        return await _context.Roles.AnyAsync(r => r.Id == id);
    }

    public async Task<bool> ExistsByNameAsync(string name)
    {
        return await _context.Roles.AnyAsync(r => r.Name == name);
    }

    public async Task<List<Role>> SearchAsync(string? name, string? description, int? minEmployeeCount, int? maxEmployeeCount, DateTime? createdFrom, DateTime? createdTo, string? sortBy, bool sortDescending, int pageNumber, int pageSize)
    {
        var query = _context.Roles
            .Include(r => r.RolePermissions)
                .ThenInclude(rp => rp.Permission)
            .Include(r => r.EmployeeRoles)
            .AsQueryable();

        // Apply filters
        if (!string.IsNullOrEmpty(name))
            query = query.Where(r => r.Name.Contains(name));

        if (!string.IsNullOrEmpty(description))
            query = query.Where(r => r.Description.Contains(description));

        if (createdFrom.HasValue)
            query = query.Where(r => r.CreatedAt >= createdFrom.Value);

        if (createdTo.HasValue)
            query = query.Where(r => r.CreatedAt <= createdTo.Value);

        // Apply sorting
        query = sortBy?.ToLower() switch
        {
            "name" => sortDescending ? query.OrderByDescending(r => r.Name) : query.OrderBy(r => r.Name),
            "description" => sortDescending ? query.OrderByDescending(r => r.Description) : query.OrderBy(r => r.Description),
            "createdat" => sortDescending ? query.OrderByDescending(r => r.CreatedAt) : query.OrderBy(r => r.CreatedAt),
            _ => query.OrderBy(r => r.Name)
        };

        // Apply pagination
        return await query
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();
    }

    public async Task<int> GetEmployeeCountAsync(int roleId)
    {
        return await _context.EmployeeRoles
            .CountAsync(er => er.RoleId == roleId);
    }
}
