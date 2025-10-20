using GeneralWebApi.Domain.Entities.Permissions;
using GeneralWebApi.Integration.Context;
using GeneralWebApi.Integration.Repository.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace GeneralWebApi.Integration.Repository.BasesRepository;

/// <summary>
/// Role permission repository implementation
/// </summary>
public class RolePermissionRepository : IRolePermissionRepository
{
    private readonly ApplicationDbContext _context;

    public RolePermissionRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<RolePermission?> GetByIdAsync(int id)
    {
        return await _context.RolePermissions
            .Include(rp => rp.Role)
            .Include(rp => rp.Permission)
            .FirstOrDefaultAsync(rp => rp.Id == id);
    }

    public async Task<RolePermission?> GetByRoleAndPermissionAsync(int roleId, int permissionId)
    {
        return await _context.RolePermissions
            .Include(rp => rp.Role)
            .Include(rp => rp.Permission)
            .FirstOrDefaultAsync(rp => rp.RoleId == roleId && rp.PermissionId == permissionId);
    }

    public async Task<List<RolePermission>> GetByRoleIdAsync(int roleId)
    {
        return await _context.RolePermissions
            .Include(rp => rp.Role)
            .Include(rp => rp.Permission)
            .Where(rp => rp.RoleId == roleId)
            .ToListAsync();
    }

    public async Task<List<RolePermission>> GetByPermissionIdAsync(int permissionId)
    {
        return await _context.RolePermissions
            .Include(rp => rp.Role)
            .Include(rp => rp.Permission)
            .Where(rp => rp.PermissionId == permissionId)
            .ToListAsync();
    }

    public async Task<List<RolePermission>> GetAllAsync()
    {
        return await _context.RolePermissions
            .Include(rp => rp.Role)
            .Include(rp => rp.Permission)
            .ToListAsync();
    }

    public async Task<RolePermission> CreateAsync(RolePermission rolePermission)
    {
        _context.RolePermissions.Add(rolePermission);
        await _context.SaveChangesAsync();
        return rolePermission;
    }

    public async Task<RolePermission> UpdateAsync(RolePermission rolePermission)
    {
        _context.RolePermissions.Update(rolePermission);
        await _context.SaveChangesAsync();
        return rolePermission;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var rolePermission = await _context.RolePermissions.FindAsync(id);
        if (rolePermission == null) return false;

        _context.RolePermissions.Remove(rolePermission);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeleteByRoleAndPermissionAsync(int roleId, int permissionId)
    {
        var rolePermission = await _context.RolePermissions
            .FirstOrDefaultAsync(rp => rp.RoleId == roleId && rp.PermissionId == permissionId);

        if (rolePermission == null) return false;

        _context.RolePermissions.Remove(rolePermission);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> ExistsAsync(int id)
    {
        return await _context.RolePermissions.AnyAsync(rp => rp.Id == id);
    }

    public async Task<bool> ExistsByRoleAndPermissionAsync(int roleId, int permissionId)
    {
        return await _context.RolePermissions.AnyAsync(rp => rp.RoleId == roleId && rp.PermissionId == permissionId);
    }

    public async Task<List<RolePermission>> GetByRoleIdsAsync(List<int> roleIds)
    {
        return await _context.RolePermissions
            .Include(rp => rp.Role)
            .Include(rp => rp.Permission)
            .Where(rp => roleIds.Contains(rp.RoleId))
            .ToListAsync();
    }
}
