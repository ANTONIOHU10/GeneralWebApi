using AutoMapper;
using GeneralWebApi.Domain.Entities;
using GeneralWebApi.Domain.Entities.Anagraphy;
using GeneralWebApi.DTOs.Department;
using GeneralWebApi.Integration.Repository.AnagraphyRepository;
using Microsoft.Extensions.Logging;

namespace GeneralWebApi.Application.Services;

public class DepartmentService : IDepartmentService
{
    private readonly IDepartmentRepository _departmentRepository;
    private readonly IMapper _mapper;
    private readonly ILogger<DepartmentService> _logger;

    public DepartmentService(IDepartmentRepository departmentRepository, ILogger<DepartmentService> logger, IMapper mapper)
    {
        _departmentRepository = departmentRepository;
        _logger = logger;
        _mapper = mapper;
    }

    public async Task<DepartmentDto> CreateAsync(CreateDepartmentDto createDto, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Creating department with code: {DepartmentCode}", createDto.Code);

        // Check if department code already exists
        if (await _departmentRepository.ExistsByCodeAsync(createDto.Code, cancellationToken))
        {
            _logger.LogWarning("Department with code {DepartmentCode} already exists", createDto.Code);
            throw new InvalidOperationException($"Department with code {createDto.Code} already exists");
        }

        var department = _mapper.Map<Department>(createDto);
        var createdDepartment = await _departmentRepository.AddAsync(department, cancellationToken);

        _logger.LogInformation("Successfully created department with ID: {DepartmentId}", createdDepartment.Id);
        return _mapper.Map<DepartmentDto>(createdDepartment);
    }

    public async Task<DepartmentDto> DeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Deleting department with ID: {DepartmentId}", id);

        var department = await _departmentRepository.GetByIdAsync(id, cancellationToken);
        if (department == null)
        {
            _logger.LogWarning("Department with ID {DepartmentId} not found", id);
            throw new KeyNotFoundException($"Department with ID {id} not found");
        }

        await _departmentRepository.DeleteAsync(department, cancellationToken);

        _logger.LogInformation("Successfully deleted department with ID: {DepartmentId}", id);
        return _mapper.Map<DepartmentDto>(department);
    }

    public async Task<DepartmentDto> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Getting department by ID: {DepartmentId}", id);

        var department = await _departmentRepository.GetByIdAsync(id, cancellationToken);
        if (department == null)
        {
            _logger.LogWarning("Department with ID {DepartmentId} not found", id);
            throw new KeyNotFoundException($"Department with ID {id} not found");
        }

        return _mapper.Map<DepartmentDto>(department);
    }

    public async Task<PagedResult<DepartmentListDto>> GetPagedAsync(DepartmentSearchDto searchDto, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Getting paged departments with search term: {SearchTerm}", searchDto.SearchTerm);

        var result = await _departmentRepository.GetPagedAsync(
            searchDto.PageNumber,
            searchDto.PageSize,
            searchDto.SearchTerm,
            searchDto.ParentDepartmentId,
            searchDto.Level,
            searchDto.Name,
            searchDto.Code,
            searchDto.Description,
            searchDto.SortBy,
            searchDto.SortDescending,
            cancellationToken);

        var departmentListDtos = _mapper.Map<List<DepartmentListDto>>(result.Items);

        return new PagedResult<DepartmentListDto>(departmentListDtos, result.TotalCount, result.PageNumber, result.PageSize);
    }

    public async Task<DepartmentDto> UpdateAsync(int id, UpdateDepartmentDto updateDto, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Updating department with ID: {DepartmentId}", id);

        var department = await _departmentRepository.GetByIdAsync(id, cancellationToken);
        if (department == null)
        {
            _logger.LogWarning("Department with ID {DepartmentId} not found", id);
            throw new KeyNotFoundException($"Department with ID {id} not found");
        }

        // Check if code is being changed and if new code already exists
        if (department.Code != updateDto.Code && await _departmentRepository.ExistsByCodeAsync(updateDto.Code, cancellationToken))
        {
            _logger.LogWarning("Department with code {DepartmentCode} already exists", updateDto.Code);
            throw new InvalidOperationException($"Department with code {updateDto.Code} already exists");
        }

        _mapper.Map(updateDto, department);
        var updatedDepartment = await _departmentRepository.UpdateAsync(department, cancellationToken);

        _logger.LogInformation("Successfully updated department with ID: {DepartmentId}", id);
        return _mapper.Map<DepartmentDto>(updatedDepartment);
    }

    public async Task<List<DepartmentDto>> GetHierarchyAsync(CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Getting department hierarchy");

        var departments = await _departmentRepository.GetHierarchyAsync(cancellationToken);
        return _mapper.Map<List<DepartmentDto>>(departments);
    }

    public async Task<List<DepartmentDto>> GetByParentIdAsync(int parentId, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Getting departments by parent ID: {ParentId}", parentId);

        var departments = await _departmentRepository.GetByParentIdAsync(parentId, cancellationToken);
        return _mapper.Map<List<DepartmentDto>>(departments);
    }
}





