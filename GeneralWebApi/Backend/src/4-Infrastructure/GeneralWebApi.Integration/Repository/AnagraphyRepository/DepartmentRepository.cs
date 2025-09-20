using GeneralWebApi.Domain.Entities;
using GeneralWebApi.Domain.Entities.Anagraphy;
using GeneralWebApi.Integration.Context;
using GeneralWebApi.Integration.Repository.Base;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace GeneralWebApi.Integration.Repository.AnagraphyRepository;

public class DepartmentRepository : BaseRepository<Department>, IDepartmentRepository
{
    public DepartmentRepository(ApplicationDbContext context, ILogger<BaseRepository<Department>> logger) : base(context, logger)
    {
    }

    public async Task<bool> ExistsByCodeAsync(string code, CancellationToken cancellationToken = default)
    {
        return await GetActiveAndEnabledEntities()
            .AnyAsync(d => d.Code == code, cancellationToken);
    }

    public async Task<PagedResult<Department>> GetPagedAsync(int pageNumber, int pageSize, string? searchTerm = null, int? parentDepartmentId = null, int? level = null, string? sortBy = null, bool sortDescending = false, CancellationToken cancellationToken = default)
    {
        var query = GetActiveAndEnabledEntities()
            .Include(d => d.ParentDepartment)
            .AsQueryable();

        // Apply search filters
        query = ApplySearchFilters(query, searchTerm, parentDepartmentId, level);

        // Apply sorting
        query = ApplySorting(query, sortBy, sortDescending);

        // Get total count
        var totalCount = await query.CountAsync(cancellationToken);

        // Apply pagination
        var departments = await query
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return new PagedResult<Department>(departments, totalCount, pageNumber, pageSize);
    }

    public async Task<List<Department>> GetHierarchyAsync(CancellationToken cancellationToken = default)
    {
        return await GetActiveAndEnabledEntities()
            .Include(d => d.ParentDepartment)
            .Include(d => d.SubDepartments)
            .Where(d => d.ParentDepartmentId == null)
            .OrderBy(d => d.Level)
            .ThenBy(d => d.Name)
            .ToListAsync(cancellationToken);
    }

    public async Task<List<Department>> GetByParentIdAsync(int parentId, CancellationToken cancellationToken = default)
    {
        return await GetActiveAndEnabledEntities()
            .Where(d => d.ParentDepartmentId == parentId)
            .OrderBy(d => d.Name)
            .ToListAsync(cancellationToken);
    }

    #region Private Helper Methods

    private static IQueryable<Department> ApplySearchFilters(IQueryable<Department> query, string? searchTerm, int? parentDepartmentId, int? level)
    {
        if (!string.IsNullOrWhiteSpace(searchTerm))
        {
            query = query.Where(d => d.Name.Contains(searchTerm) ||
                                   d.Code.Contains(searchTerm) ||
                                   d.Description.Contains(searchTerm));
        }

        if (parentDepartmentId.HasValue)
        {
            query = query.Where(d => d.ParentDepartmentId == parentDepartmentId.Value);
        }

        if (level.HasValue)
        {
            query = query.Where(d => d.Level == level.Value);
        }

        return query;
    }

    private static IQueryable<Department> ApplySorting(IQueryable<Department> query, string? sortBy, bool sortDescending)
    {
        return sortBy?.ToLower() switch
        {
            "name" => sortDescending ? query.OrderByDescending(d => d.Name) : query.OrderBy(d => d.Name),
            "code" => sortDescending ? query.OrderByDescending(d => d.Code) : query.OrderBy(d => d.Code),
            "level" => sortDescending ? query.OrderByDescending(d => d.Level) : query.OrderBy(d => d.Level),
            "createdat" => sortDescending ? query.OrderByDescending(d => d.CreatedAt) : query.OrderBy(d => d.CreatedAt),
            _ => query.OrderBy(d => d.Name)
        };
    }

    #endregion
}



