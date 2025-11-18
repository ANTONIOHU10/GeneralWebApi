using GeneralWebApi.Domain.Entities;
using GeneralWebApi.Domain.Entities.Anagraphy;
using GeneralWebApi.Integration.Context;
using GeneralWebApi.Integration.Repository.Base;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace GeneralWebApi.Integration.Repository.AnagraphyRepository;

public class EmployeeRepository : BaseRepository<Employee>, IEmployeeRepository
{
    public EmployeeRepository(ApplicationDbContext context, ILogger<BaseRepository<Employee>> logger) : base(context, logger)
    {
    }

    public async Task<bool> ExistsByEmployeeNumberAsync(string employeeNumber, CancellationToken cancellationToken = default)
    {
        return await GetActiveAndEnabledEntities()
            .AnyAsync(e => e.EmployeeNumber == employeeNumber, cancellationToken);
    }

    public async Task<bool> ExistsByEmailAsync(string email, CancellationToken cancellationToken = default)
    {
        return await GetActiveAndEnabledEntities()
            .AnyAsync(e => e.Email == email, cancellationToken);
    }

    public override async Task<Employee> GetByIdAsync(object id, CancellationToken cancellationToken = default)
    {
        var employee = await GetActiveAndEnabledEntities()
            .Include(e => e.Department)
            .Include(e => e.Position)
            .Include(e => e.Manager)
            .Include(e => e.Contracts)
            .FirstOrDefaultAsync(e => e.Id.Equals(id), cancellationToken);

        if (employee == null)
        {
            _logger.LogWarning("Employee with ID {EmployeeId} not found", id);
            throw new KeyNotFoundException($"Employee with ID {id} not found");
        }

        return employee;
    }

    public async Task<PagedResult<Employee>> GetPagedAsync(int pageNumber, int pageSize, string? searchTerm = null, int? departmentId = null, int? positionId = null, string? employmentStatus = null, DateTime? hireDateFrom = null, DateTime? hireDateTo = null, string? sortBy = null, bool sortDescending = false, CancellationToken cancellationToken = default)
    {
        var query = GetActiveAndEnabledEntities()
            .Include(e => e.Department)
            .Include(e => e.Position)
            .Include(e => e.Manager)
            .Include(e => e.Contracts)
            .AsQueryable();

        // Apply search filters
        query = ApplySearchFilters(query, searchTerm, departmentId, positionId, employmentStatus, hireDateFrom, hireDateTo);

        // Apply sorting
        query = ApplySorting(query, sortBy, sortDescending);

        // Get total count
        var totalCount = await query.CountAsync(cancellationToken);

        // Apply pagination
        var employees = await query
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return new PagedResult<Employee>(employees, totalCount, pageNumber, pageSize);
    }


    #region Private Helper Methods

    private static IQueryable<Employee> ApplySearchFilters(IQueryable<Employee> query, string? searchTerm, int? departmentId, int? positionId, string? employmentStatus, DateTime? hireDateFrom, DateTime? hireDateTo)
    {
        if (!string.IsNullOrEmpty(searchTerm))
        {
            query = query.Where(e => e.FirstName.Contains(searchTerm) ||
                                   e.LastName.Contains(searchTerm) ||
                                   e.EmployeeNumber.Contains(searchTerm) ||
                                   e.Email.Contains(searchTerm));
        }

        if (departmentId.HasValue)
        {
            query = query.Where(e => e.DepartmentId == departmentId.Value);
        }

        if (positionId.HasValue)
        {
            query = query.Where(e => e.PositionId == positionId.Value);
        }

        if (!string.IsNullOrEmpty(employmentStatus))
        {
            query = query.Where(e => e.EmploymentStatus == employmentStatus);
        }

        if (hireDateFrom.HasValue)
        {
            query = query.Where(e => e.HireDate >= hireDateFrom.Value);
        }

        if (hireDateTo.HasValue)
        {
            query = query.Where(e => e.HireDate <= hireDateTo.Value);
        }

        return query;
    }

    private static IQueryable<Employee> ApplySorting(IQueryable<Employee> query, string? sortBy, bool sortDescending)
    {
        return sortBy?.ToLower() switch
        {
            "firstname" => sortDescending ? query.OrderByDescending(e => e.FirstName) : query.OrderBy(e => e.FirstName),
            "lastname" => sortDescending ? query.OrderByDescending(e => e.LastName) : query.OrderBy(e => e.LastName),
            "employeenumber" => sortDescending ? query.OrderByDescending(e => e.EmployeeNumber) : query.OrderBy(e => e.EmployeeNumber),
            "email" => sortDescending ? query.OrderByDescending(e => e.Email) : query.OrderBy(e => e.Email),
            "hiredate" => sortDescending ? query.OrderByDescending(e => e.HireDate) : query.OrderBy(e => e.HireDate),
            "employmentsstatus" => sortDescending ? query.OrderByDescending(e => e.EmploymentStatus) : query.OrderBy(e => e.EmploymentStatus),
            "department" => sortDescending ? query.OrderByDescending(e => e.Department!.Name) : query.OrderBy(e => e.Department!.Name),
            "position" => sortDescending ? query.OrderByDescending(e => e.Position!.Title) : query.OrderBy(e => e.Position!.Title),
            _ => query.OrderBy(e => e.FirstName) // default to sort by first name
        };
    }

    #endregion
}