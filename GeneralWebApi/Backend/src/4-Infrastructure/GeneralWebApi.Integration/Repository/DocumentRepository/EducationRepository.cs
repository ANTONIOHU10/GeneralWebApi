using GeneralWebApi.Domain.Entities;
using GeneralWebApi.Domain.Entities.Documents;
using GeneralWebApi.Integration.Context;
using GeneralWebApi.Integration.Repository.Base;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace GeneralWebApi.Integration.Repository.DocumentRepository;

public class EducationRepository : BaseRepository<Education>, IEducationRepository
{
    public EducationRepository(ApplicationDbContext context, ILogger<BaseRepository<Education>> logger) : base(context, logger)
    {
    }

    public async Task<PagedResult<Education>> GetPagedAsync(int pageNumber, int pageSize, string? searchTerm = null, int? employeeId = null, string? institution = null, string? degree = null, string? fieldOfStudy = null, string? sortBy = null, bool sortDescending = false, CancellationToken cancellationToken = default)
    {
        var query = GetActiveAndEnabledEntities()
            .Include(e => e.Employee)
            .AsQueryable();

        // Apply search filters
        query = ApplySearchFilters(query, searchTerm, employeeId, institution, degree, fieldOfStudy);

        // Apply sorting
        query = ApplySorting(query, sortBy, sortDescending);

        // Get total count
        var totalCount = await query.CountAsync(cancellationToken);

        // Apply pagination
        var educations = await query
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return new PagedResult<Education>(educations, totalCount, pageNumber, pageSize);
    }

    public async Task<IEnumerable<Education>> GetByEmployeeIdAsync(int employeeId, CancellationToken cancellationToken = default)
    {
        return await GetActiveAndEnabledEntities()
            .Include(e => e.Employee)
            .Where(e => e.EmployeeId == employeeId)
            .OrderByDescending(e => e.StartDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Education>> GetByInstitutionAsync(string institution, CancellationToken cancellationToken = default)
    {
        return await GetActiveAndEnabledEntities()
            .Include(e => e.Employee)
            .Where(e => e.Institution.Contains(institution))
            .OrderByDescending(e => e.StartDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Education>> GetByDegreeAsync(string degree, CancellationToken cancellationToken = default)
    {
        return await GetActiveAndEnabledEntities()
            .Include(e => e.Employee)
            .Where(e => e.Degree.Contains(degree))
            .OrderByDescending(e => e.StartDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Education>> GetByFieldOfStudyAsync(string fieldOfStudy, CancellationToken cancellationToken = default)
    {
        return await GetActiveAndEnabledEntities()
            .Include(e => e.Employee)
            .Where(e => e.FieldOfStudy.Contains(fieldOfStudy))
            .OrderByDescending(e => e.StartDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<bool> ExistsForEmployeeAsync(int employeeId, string institution, string degree, CancellationToken cancellationToken = default)
    {
        return await GetActiveAndEnabledEntities()
            .AnyAsync(e => e.EmployeeId == employeeId && 
                          e.Institution == institution && 
                          e.Degree == degree, cancellationToken);
    }

    #region Private Helper Methods

    private static IQueryable<Education> ApplySearchFilters(
        IQueryable<Education> query,
        string? searchTerm,
        int? employeeId,
        string? institution,
        string? degree,
        string? fieldOfStudy)
    {
        if (!string.IsNullOrWhiteSpace(searchTerm))
        {
            query = query.Where(e => e.Institution.Contains(searchTerm) ||
                                   e.Degree.Contains(searchTerm) ||
                                   e.FieldOfStudy.Contains(searchTerm) ||
                                   e.Grade!.Contains(searchTerm) ||
                                   e.Description!.Contains(searchTerm));
        }

        if (employeeId.HasValue)
        {
            query = query.Where(e => e.EmployeeId == employeeId.Value);
        }

        if (!string.IsNullOrWhiteSpace(institution))
        {
            query = query.Where(e => e.Institution.Contains(institution));
        }

        if (!string.IsNullOrWhiteSpace(degree))
        {
            query = query.Where(e => e.Degree.Contains(degree));
        }

        if (!string.IsNullOrWhiteSpace(fieldOfStudy))
        {
            query = query.Where(e => e.FieldOfStudy.Contains(fieldOfStudy));
        }

        return query;
    }

    private static IQueryable<Education> ApplySorting(
        IQueryable<Education> query,
        string? sortBy,
        bool sortDescending)
    {
        return sortBy?.ToLower() switch
        {
            "institution" => sortDescending ? query.OrderByDescending(e => e.Institution) : query.OrderBy(e => e.Institution),
            "degree" => sortDescending ? query.OrderByDescending(e => e.Degree) : query.OrderBy(e => e.Degree),
            "fieldofstudy" => sortDescending ? query.OrderByDescending(e => e.FieldOfStudy) : query.OrderBy(e => e.FieldOfStudy),
            "enddate" => sortDescending ? query.OrderByDescending(e => e.EndDate) : query.OrderBy(e => e.EndDate),
            "grade" => sortDescending ? query.OrderByDescending(e => e.Grade) : query.OrderBy(e => e.Grade),
            _ => sortDescending ? query.OrderByDescending(e => e.StartDate) : query.OrderBy(e => e.StartDate)
        };
    }

    #endregion
}



