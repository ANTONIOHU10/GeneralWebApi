using GeneralWebApi.Domain.Entities.Permissions;
using GeneralWebApi.Integration.Context;
using GeneralWebApi.Integration.Repository.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace GeneralWebApi.Integration.Repository.BasesRepository;

/// <summary>
/// Permission repository implementation
/// </summary>
public class PermissionRepository : IPermissionRepository
{
    private readonly ApplicationDbContext _context;

    public PermissionRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Permission?> GetByIdAsync(int id)
    {
        return await _context.Permissions
            .Include(p => p.RolePermissions)
                .ThenInclude(rp => rp.Role)
            .FirstOrDefaultAsync(p => p.Id == id);
    }

    public async Task<Permission?> GetByNameAsync(string name)
    {
        return await _context.Permissions
            .Include(p => p.RolePermissions)
                .ThenInclude(rp => rp.Role)
            .FirstOrDefaultAsync(p => p.Name == name);
    }

    public async Task<List<Permission>> GetAllAsync()
    {
        return await _context.Permissions
            .Include(p => p.RolePermissions)
                .ThenInclude(rp => rp.Role)
            .ToListAsync();
    }

    public async Task<List<Permission>> GetByRoleIdAsync(int roleId)
    {
        return await _context.Permissions
            .Include(p => p.RolePermissions)
                .ThenInclude(rp => rp.Role)
            .Where(p => p.RolePermissions.Any(rp => rp.RoleId == roleId))
            .ToListAsync();
    }

    public async Task<Permission> CreateAsync(Permission permission)
    {
        _context.Permissions.Add(permission);
        await _context.SaveChangesAsync();
        return permission;
    }

    public async Task<Permission> UpdateAsync(Permission permission)
    {
        _context.Permissions.Update(permission);
        await _context.SaveChangesAsync();
        return permission;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var permission = await _context.Permissions.FindAsync(id);
        if (permission == null) return false;

        _context.Permissions.Remove(permission);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> ExistsAsync(int id)
    {
        return await _context.Permissions.AnyAsync(p => p.Id == id);
    }

    public async Task<bool> ExistsByNameAsync(string name)
    {
        return await _context.Permissions.AnyAsync(p => p.Name == name);
    }

    public async Task<List<Permission>> SearchAsync(string? name, string? resource, string? action, string? category, DateTime? createdFrom, DateTime? createdTo, string? sortBy, bool sortDescending, int pageNumber, int pageSize)
    {
        var query = _context.Permissions
            .Include(p => p.RolePermissions)
                .ThenInclude(rp => rp.Role)
            .AsQueryable();

        // Apply filters
        if (!string.IsNullOrEmpty(name))
            query = query.Where(p => p.Name.Contains(name));

        if (!string.IsNullOrEmpty(resource))
            query = query.Where(p => p.Resource.Contains(resource));

        if (!string.IsNullOrEmpty(action))
            query = query.Where(p => p.Action.Contains(action));

        if (!string.IsNullOrEmpty(category))
            query = query.Where(p => p.Category.Contains(category));

        if (createdFrom.HasValue)
            query = query.Where(p => p.CreatedAt >= createdFrom.Value);

        if (createdTo.HasValue)
            query = query.Where(p => p.CreatedAt <= createdTo.Value);

        // Apply sorting
        query = sortBy?.ToLower() switch
        {
            "name" => sortDescending ? query.OrderByDescending(p => p.Name) : query.OrderBy(p => p.Name),
            "resource" => sortDescending ? query.OrderByDescending(p => p.Resource) : query.OrderBy(p => p.Resource),
            "action" => sortDescending ? query.OrderByDescending(p => p.Action) : query.OrderBy(p => p.Action),
            "category" => sortDescending ? query.OrderByDescending(p => p.Category) : query.OrderBy(p => p.Category),
            "createdat" => sortDescending ? query.OrderByDescending(p => p.CreatedAt) : query.OrderBy(p => p.CreatedAt),
            _ => query.OrderBy(p => p.Name)
        };

        // Apply pagination
        return await query
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();
    }
}
