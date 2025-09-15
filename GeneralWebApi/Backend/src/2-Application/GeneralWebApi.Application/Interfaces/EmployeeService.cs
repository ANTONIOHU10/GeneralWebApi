using AutoMapper;
using GeneralWebApi.Domain.Entities;
using GeneralWebApi.Domain.Entities.Anagraphy;
using GeneralWebApi.DTOs.Employee;
using GeneralWebApi.Integration.Repository.AnagraphyRepository;
using Microsoft.Extensions.Logging;

namespace GeneralWebApi.Application.Interfaces;
public class EmployeeService : IEmployeeService
{
    private readonly IEmployeeRepository _employeeRepository;
    private readonly IMapper _mapper;
    private readonly ILogger<EmployeeService> _logger;
    public EmployeeService(IEmployeeRepository employeeRepository, ILogger<EmployeeService> logger, IMapper mapper)
    {
        _employeeRepository = employeeRepository;
        _logger = logger;
        _mapper = mapper;
    }
    public async Task<EmployeeDto> CreateAsync(CreateEmployeeDto createDto, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Creating employee with number: {EmployeeNumber}", createDto.EmployeeNumber);

        // Check if employee number already exists
        if (await _employeeRepository.ExistsByEmployeeNumberAsync(createDto.EmployeeNumber, cancellationToken))
        {
            _logger.LogWarning("Employee with number {EmployeeNumber} already exists", createDto.EmployeeNumber);
            throw new InvalidOperationException($"Employee with number {createDto.EmployeeNumber} already exists");
        }

        var employee = _mapper.Map<Employee>(createDto);
        var createdEmployee = await _employeeRepository.AddAsync(employee, cancellationToken);

        _logger.LogInformation("Successfully created employee with ID: {EmployeeId}", createdEmployee.Id);
        return _mapper.Map<EmployeeDto>(createdEmployee);
    }

    public async Task<EmployeeDto> DeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Deleting employee with ID: {EmployeeId}", id);

        var employee = await _employeeRepository.GetByIdAsync(id, cancellationToken);
        if (employee == null)
        {
            _logger.LogWarning("Employee with ID {EmployeeId} not found for deletion", id);
            throw new KeyNotFoundException($"Employee with ID {id} not found");
        }

        await _employeeRepository.DeleteAsync(id, cancellationToken);

        _logger.LogInformation("Successfully deleted employee with ID: {EmployeeId}", id);
        return _mapper.Map<EmployeeDto>(employee);
    }

    public async Task<EmployeeDto> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Getting employee with ID: {EmployeeId}", id);

        var employee = await _employeeRepository.GetByIdAsync(id, cancellationToken);
        if (employee == null)
        {
            _logger.LogWarning("Employee with ID {EmployeeId} not found", id);
            throw new KeyNotFoundException($"Employee with ID {id} not found");
        }

        return _mapper.Map<EmployeeDto>(employee);
    }

    public async Task<PagedResult<EmployeeListDto>> GetPagedAsync(EmployeeSearchDto searchDto, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Getting paged employees with search term: {SearchTerm}", searchDto.SearchTerm);

        var employees = await _employeeRepository.GetPagedAsync(
            searchDto.PageNumber,
            searchDto.PageSize,
            searchDto.SearchTerm,
            searchDto.DepartmentId,
            searchDto.PositionId,
            searchDto.EmploymentStatus,
            searchDto.HireDateFrom,
            searchDto.HireDateTo,
            searchDto.SortBy,
            searchDto.SortDescending,
            cancellationToken);

        // manually map PagedResult
        var mappedItems = _mapper.Map<List<EmployeeListDto>>(employees.Items);
        var result = new PagedResult<EmployeeListDto>(mappedItems, employees.TotalCount, employees.PageNumber, employees.PageSize);

        _logger.LogInformation("Found {Count} employees", result.TotalCount);
        return result;
    }

    public async Task<EmployeeDto> UpdateAsync(int id, UpdateEmployeeDto updateDto, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Updating employee with ID: {EmployeeId}", id);

        var existingEmployee = await _employeeRepository.GetByIdAsync(id, cancellationToken);
        if (existingEmployee == null)
        {
            _logger.LogWarning("Employee with ID {EmployeeId} not found for update", id);
            throw new KeyNotFoundException($"Employee with ID {id} not found");
        }

        // Check if employee number is being changed and if new number already exists
        if (updateDto.EmployeeNumber != existingEmployee.EmployeeNumber)
        {
            if (await _employeeRepository.ExistsByEmployeeNumberAsync(updateDto.EmployeeNumber, cancellationToken))
            {
                _logger.LogWarning("Employee with number {EmployeeNumber} already exists", updateDto.EmployeeNumber);
                throw new InvalidOperationException($"Employee with number {updateDto.EmployeeNumber} already exists");
            }
        }

        _mapper.Map(updateDto, existingEmployee);
        var updatedEmployee = await _employeeRepository.UpdateAsync(existingEmployee, cancellationToken);

        _logger.LogInformation("Successfully updated employee with ID: {EmployeeId}", id);
        return _mapper.Map<EmployeeDto>(updatedEmployee);
    }
}