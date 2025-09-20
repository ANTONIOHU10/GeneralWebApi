using GeneralWebApi.Domain.Entities;
using GeneralWebApi.DTOs.Education;

namespace GeneralWebApi.Application.Interfaces;

public interface IEducationService
{
    /// <summary>
    /// Create a new education record
    /// </summary>
    Task<EducationDto> CreateAsync(CreateEducationDto createDto, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get education record by ID
    /// </summary>
    Task<EducationDto> GetByIdAsync(int id, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get paged education records
    /// </summary>
    Task<PagedResult<EducationListDto>> GetPagedAsync(EducationSearchDto searchDto, CancellationToken cancellationToken = default);

    /// <summary>
    /// Update education record
    /// </summary>
    Task<EducationDto> UpdateAsync(UpdateEducationDto updateDto, CancellationToken cancellationToken = default);

    /// <summary>
    /// Delete education record
    /// </summary>
    Task<EducationDto> DeleteAsync(int id, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get education records by employee ID
    /// </summary>
    Task<IEnumerable<EducationListDto>> GetByEmployeeIdAsync(int employeeId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get education records by institution
    /// </summary>
    Task<IEnumerable<EducationListDto>> GetByInstitutionAsync(string institution, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get education records by degree
    /// </summary>
    Task<IEnumerable<EducationListDto>> GetByDegreeAsync(string degree, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get education records by field of study
    /// </summary>
    Task<IEnumerable<EducationListDto>> GetByFieldOfStudyAsync(string fieldOfStudy, CancellationToken cancellationToken = default);
}

