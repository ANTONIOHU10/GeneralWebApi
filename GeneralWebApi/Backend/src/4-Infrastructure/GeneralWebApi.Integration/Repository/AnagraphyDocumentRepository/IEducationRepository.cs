using GeneralWebApi.Domain.Entities;
using GeneralWebApi.Domain.Entities.Documents;
using GeneralWebApi.Integration.Repository.Base;

namespace GeneralWebApi.Integration.Repository.DocumentRepository;

public interface IEducationRepository : IBaseRepository<Education>
{
    /// <summary>
    /// Get paged education records with search and filtering
    /// </summary>
    Task<PagedResult<Education>> GetPagedAsync(
        int pageNumber, 
        int pageSize, 
        string? searchTerm = null, 
        int? employeeId = null, 
        string? institution = null, 
        string? degree = null, 
        string? fieldOfStudy = null, 
        string? sortBy = null, 
        bool sortDescending = false, 
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Get education records by employee ID
    /// </summary>
    Task<IEnumerable<Education>> GetByEmployeeIdAsync(int employeeId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get education records by institution
    /// </summary>
    Task<IEnumerable<Education>> GetByInstitutionAsync(string institution, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get education records by degree
    /// </summary>
    Task<IEnumerable<Education>> GetByDegreeAsync(string degree, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get education records by field of study
    /// </summary>
    Task<IEnumerable<Education>> GetByFieldOfStudyAsync(string fieldOfStudy, CancellationToken cancellationToken = default);

    /// <summary>
    /// Check if education record exists for employee
    /// </summary>
    Task<bool> ExistsForEmployeeAsync(int employeeId, string institution, string degree, CancellationToken cancellationToken = default);
}

