using GeneralWebApi.Domain.Entities;
using GeneralWebApi.Domain.Entities.Anagraphy;
using GeneralWebApi.Integration.Context;
using GeneralWebApi.Integration.Repository.Base;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace GeneralWebApi.Integration.Repository.AnagraphyRepository;

public class PositionRepository : BaseRepository<Position>, IPositionRepository
{
    public PositionRepository(ApplicationDbContext context, ILogger<BaseRepository<Position>> logger) : base(context, logger)
    {
    }

    public async Task<bool> ExistsByCodeAsync(string code, CancellationToken cancellationToken = default)
    {
        return await GetActiveAndEnabledEntities()
            .AnyAsync(p => p.Code == code, cancellationToken);
    }

    public async Task<PagedResult<Position>> GetPagedAsync(int pageNumber, int pageSize, string? searchTerm = null, int? departmentId = null, int? level = null, bool? isManagement = null, string? sortBy = null, bool sortDescending = false, CancellationToken cancellationToken = default)
    {
        var query = GetActiveAndEnabledEntities()
            .Include(p => p.Department)
            .Include(p => p.ParentPosition)
            .AsQueryable();

        // Apply search filters
        query = ApplySearchFilters(query, searchTerm, departmentId, level, isManagement);

        // Apply sorting
        query = ApplySorting(query, sortBy, sortDescending);

        // Get total count
        var totalCount = await query.CountAsync(cancellationToken);

        // Apply pagination
        var positions = await query
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return new PagedResult<Position>(positions, totalCount, pageNumber, pageSize);
    }

    public async Task<List<Position>> GetByDepartmentIdAsync(int departmentId, CancellationToken cancellationToken = default)
    {
        return await GetActiveAndEnabledEntities()
            .Where(p => p.DepartmentId == departmentId)
            .OrderBy(p => p.Title)
            .ToListAsync(cancellationToken);
    }

    public async Task<List<Position>> GetByParentIdAsync(int parentId, CancellationToken cancellationToken = default)
    {
        return await GetActiveAndEnabledEntities()
            .Where(p => p.ParentPositionId == parentId)
            .OrderBy(p => p.Title)
            .ToListAsync(cancellationToken);
    }

    #region Private Helper Methods

    private static IQueryable<Position> ApplySearchFilters(IQueryable<Position> query, string? searchTerm, int? departmentId, int? level, bool? isManagement)
    {
        if (!string.IsNullOrWhiteSpace(searchTerm))
        {
            query = query.Where(p => p.Title.Contains(searchTerm) ||
                                   p.Code.Contains(searchTerm) ||
                                   p.Description.Contains(searchTerm));
        }

        if (departmentId.HasValue)
        {
            query = query.Where(p => p.DepartmentId == departmentId.Value);
        }

        if (level.HasValue)
        {
            query = query.Where(p => p.Level == level.Value);
        }

        if (isManagement.HasValue)
        {
            query = query.Where(p => p.IsManagement == isManagement.Value);
        }

        return query;
    }

    private static IQueryable<Position> ApplySorting(IQueryable<Position> query, string? sortBy, bool sortDescending)
    {
        return sortBy?.ToLower() switch
        {
            "title" => sortDescending ? query.OrderByDescending(p => p.Title) : query.OrderBy(p => p.Title),
            "code" => sortDescending ? query.OrderByDescending(p => p.Code) : query.OrderBy(p => p.Code),
            "level" => sortDescending ? query.OrderByDescending(p => p.Level) : query.OrderBy(p => p.Level),
            "minsalary" => sortDescending ? query.OrderByDescending(p => p.MinSalary) : query.OrderBy(p => p.MinSalary),
            "maxsalary" => sortDescending ? query.OrderByDescending(p => p.MaxSalary) : query.OrderBy(p => p.MaxSalary),
            "createdat" => sortDescending ? query.OrderByDescending(p => p.CreatedAt) : query.OrderBy(p => p.CreatedAt),
            _ => query.OrderBy(p => p.Title)
        };
    }

    #endregion
}



