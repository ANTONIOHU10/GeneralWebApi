using AutoMapper;
using GeneralWebApi.Domain.Entities;
using GeneralWebApi.Domain.Entities.Documents;
using GeneralWebApi.DTOs.Education;
using GeneralWebApi.Integration.Repository.DocumentRepository;
using Microsoft.Extensions.Logging;

namespace GeneralWebApi.Application.Interfaces;

public class EducationService : IEducationService
{
    private readonly IEducationRepository _educationRepository;
    private readonly IMapper _mapper;
    private readonly ILogger<EducationService> _logger;

    public EducationService(IEducationRepository educationRepository, ILogger<EducationService> logger, IMapper mapper)
    {
        _educationRepository = educationRepository;
        _logger = logger;
        _mapper = mapper;
    }

    public async Task<EducationDto> CreateAsync(CreateEducationDto createDto, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Creating education record for employee {EmployeeId}", createDto.EmployeeId);

        // Check if education record already exists for this employee
        if (await _educationRepository.ExistsForEmployeeAsync(createDto.EmployeeId, createDto.Institution, createDto.Degree, cancellationToken))
        {
            _logger.LogWarning("Education record already exists for employee {EmployeeId} at {Institution} with degree {Degree}", 
                createDto.EmployeeId, createDto.Institution, createDto.Degree);
            throw new InvalidOperationException($"Education record already exists for this employee at {createDto.Institution} with degree {createDto.Degree}");
        }

        var education = _mapper.Map<Education>(createDto);
        var createdEducation = await _educationRepository.AddAsync(education, cancellationToken);

        _logger.LogInformation("Successfully created education record with ID: {EducationId}", createdEducation.Id);
        return _mapper.Map<EducationDto>(createdEducation);
    }

    public async Task<EducationDto> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Getting education record by ID: {EducationId}", id);

        var education = await _educationRepository.GetByIdAsync(id, cancellationToken);
        if (education == null)
        {
            _logger.LogWarning("Education record with ID {EducationId} not found", id);
            throw new KeyNotFoundException($"Education record with ID {id} not found");
        }

        return _mapper.Map<EducationDto>(education);
    }

    public async Task<PagedResult<EducationListDto>> GetPagedAsync(EducationSearchDto searchDto, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Getting paged education records with search criteria");

        var result = await _educationRepository.GetPagedAsync(
            searchDto.PageNumber,
            searchDto.PageSize,
            searchDto.SearchTerm,
            searchDto.EmployeeId,
            searchDto.Institution,
            searchDto.Degree,
            searchDto.FieldOfStudy,
            searchDto.SortBy,
            searchDto.SortDescending,
            cancellationToken);

        var educationListDtos = _mapper.Map<IEnumerable<EducationListDto>>(result.Items);

        return new PagedResult<EducationListDto>(
            educationListDtos.ToList(),
            result.TotalCount,
            result.PageNumber,
            result.PageSize);
    }

    public async Task<EducationDto> UpdateAsync(UpdateEducationDto updateDto, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Updating education record with ID: {EducationId}", updateDto.Id);

        var existingEducation = await _educationRepository.GetByIdAsync(updateDto.Id, cancellationToken);
        if (existingEducation == null)
        {
            _logger.LogWarning("Education record with ID {EducationId} not found", updateDto.Id);
            throw new KeyNotFoundException($"Education record with ID {updateDto.Id} not found");
        }

        // Check if another education record exists for this employee with same institution and degree
        if (await _educationRepository.ExistsForEmployeeAsync(updateDto.EmployeeId, updateDto.Institution, updateDto.Degree, cancellationToken) &&
            existingEducation.EmployeeId != updateDto.EmployeeId)
        {
            _logger.LogWarning("Education record already exists for employee {EmployeeId} at {Institution} with degree {Degree}", 
                updateDto.EmployeeId, updateDto.Institution, updateDto.Degree);
            throw new InvalidOperationException($"Education record already exists for this employee at {updateDto.Institution} with degree {updateDto.Degree}");
        }

        _mapper.Map(updateDto, existingEducation);
        var updatedEducation = await _educationRepository.UpdateAsync(existingEducation, cancellationToken);

        _logger.LogInformation("Successfully updated education record with ID: {EducationId}", updatedEducation.Id);
        return _mapper.Map<EducationDto>(updatedEducation);
    }

    public async Task<EducationDto> DeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Deleting education record with ID: {EducationId}", id);

        var education = await _educationRepository.GetByIdAsync(id, cancellationToken);
        if (education == null)
        {
            _logger.LogWarning("Education record with ID {EducationId} not found", id);
            throw new KeyNotFoundException($"Education record with ID {id} not found");
        }

        var deletedEducation = await _educationRepository.DeleteAsync(id, cancellationToken);

        _logger.LogInformation("Successfully deleted education record with ID: {EducationId}", id);
        return _mapper.Map<EducationDto>(deletedEducation);
    }

    public async Task<IEnumerable<EducationListDto>> GetByEmployeeIdAsync(int employeeId, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Getting education records for employee ID: {EmployeeId}", employeeId);

        var educations = await _educationRepository.GetByEmployeeIdAsync(employeeId, cancellationToken);
        return _mapper.Map<IEnumerable<EducationListDto>>(educations);
    }

    public async Task<IEnumerable<EducationListDto>> GetByInstitutionAsync(string institution, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Getting education records for institution: {Institution}", institution);

        var educations = await _educationRepository.GetByInstitutionAsync(institution, cancellationToken);
        return _mapper.Map<IEnumerable<EducationListDto>>(educations);
    }

    public async Task<IEnumerable<EducationListDto>> GetByDegreeAsync(string degree, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Getting education records for degree: {Degree}", degree);

        var educations = await _educationRepository.GetByDegreeAsync(degree, cancellationToken);
        return _mapper.Map<IEnumerable<EducationListDto>>(educations);
    }

    public async Task<IEnumerable<EducationListDto>> GetByFieldOfStudyAsync(string fieldOfStudy, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Getting education records for field of study: {FieldOfStudy}", fieldOfStudy);

        var educations = await _educationRepository.GetByFieldOfStudyAsync(fieldOfStudy, cancellationToken);
        return _mapper.Map<IEnumerable<EducationListDto>>(educations);
    }
}

