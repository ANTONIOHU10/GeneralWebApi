using AutoMapper;
using GeneralWebApi.Domain.Entities;
using GeneralWebApi.Domain.Entities.Anagraphy;
using GeneralWebApi.DTOs.Employee;
using GeneralWebApi.Integration.Repository.AnagraphyRepository;
using Microsoft.Extensions.Logging;

namespace GeneralWebApi.Application.Services;
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

        // If employee number is not provided, generate a unique one
        if (string.IsNullOrWhiteSpace(createDto.EmployeeNumber))
        {
            createDto.EmployeeNumber = await GenerateUniqueEmployeeNumberAsync(cancellationToken);
            _logger.LogInformation("Generated employee number: {EmployeeNumber}", createDto.EmployeeNumber);
        }

        // Check if employee number already exists (only when provided/generated)
        if (await _employeeRepository.ExistsByEmployeeNumberAsync(createDto.EmployeeNumber!, cancellationToken))
        {
            _logger.LogWarning("Employee with number {EmployeeNumber} already exists", createDto.EmployeeNumber);
            throw new InvalidOperationException($"Employee with number {createDto.EmployeeNumber} already exists");
        }

        // Check if email already exists
        if (!string.IsNullOrWhiteSpace(createDto.Email))
        {
            if (await _employeeRepository.ExistsByEmailAsync(createDto.Email, cancellationToken))
            {
                _logger.LogWarning("Employee with email {Email} already exists", createDto.Email);
                throw new InvalidOperationException($"Employee with email {createDto.Email} already exists");
            }
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

    public async Task<PagedResult<EmployeeDto>> GetPagedAsync(EmployeeSearchDto searchDto, CancellationToken cancellationToken = default)
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
            searchDto.FirstName,
            searchDto.LastName,
            searchDto.Email,
            searchDto.EmployeeNumber,
            searchDto.Phone,
            searchDto.SortBy,
            searchDto.SortDescending,
            cancellationToken);

        // manually map PagedResult - use EmployeeDto instead of EmployeeListDto for complete data
        var mappedItems = _mapper.Map<List<EmployeeDto>>(employees.Items);
        var result = new PagedResult<EmployeeDto>(mappedItems, employees.TotalCount, employees.PageNumber, employees.PageSize);

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

        // Check if email is being changed and if new email already exists
        if (!string.IsNullOrWhiteSpace(updateDto.Email) && updateDto.Email != existingEmployee.Email)
        {
            if (await _employeeRepository.ExistsByEmailAsync(updateDto.Email, cancellationToken))
            {
                _logger.LogWarning("Employee with email {Email} already exists", updateDto.Email);
                throw new InvalidOperationException($"Employee with email {updateDto.Email} already exists");
            }
        }

        _mapper.Map(updateDto, existingEmployee);
        
        // Automatically set IsManager to true if employee has subordinates
        // Check if any other employees have this employee as their manager
        var hasSubordinates = await _employeeRepository.GetPagedAsync(1, 1, null, null, null, "Active", null, null, null, null, null, null, null, null, false, cancellationToken);
        var hasSubordinatesResult = hasSubordinates.Items.Any(e => e.ManagerId == id && e.Id != id);
        if (hasSubordinatesResult && !existingEmployee.IsManager)
        {
            existingEmployee.IsManager = true;
            _logger.LogInformation("Automatically set IsManager to true for employee {EmployeeId} because they have subordinates", id);
        }
        // If manually set IsManager, respect the manual setting
        else if (updateDto.IsManager != existingEmployee.IsManager)
        {
            existingEmployee.IsManager = updateDto.IsManager;
        }
        
        var updatedEmployee = await _employeeRepository.UpdateAsync(existingEmployee, cancellationToken);

        _logger.LogInformation("Successfully updated employee with ID: {EmployeeId}", id);
        return _mapper.Map<EmployeeDto>(updatedEmployee);
    }

    /// <summary>
    /// Generate a unique employee number with prefix EMP plus random 8-char token.
    /// Ensure uniqueness by checking repository.
    /// </summary>
    private async Task<string> GenerateUniqueEmployeeNumberAsync(CancellationToken cancellationToken)
    {
        const string prefix = "EMP";
        const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        var random = new Random();

        string GenerateToken()
        {
            return new string(Enumerable.Repeat(chars, 8).Select(s => s[random.Next(s.Length)]).ToArray());
        }

        string employeeNumber;
        int attempts = 0;
        do
        {
            employeeNumber = $"{prefix}{GenerateToken()}";
            attempts++;
            if (attempts > 10)
            {
                // Extremely unlikely - fallback to GUID based
                employeeNumber = $"{prefix}{Guid.NewGuid().ToString("N")[..8].ToUpper()}";
            }
        }
        while (await _employeeRepository.ExistsByEmployeeNumberAsync(employeeNumber, cancellationToken));

        return employeeNumber;
    }

    /// <summary>
    /// Get employee hierarchy (manager chain upward and subordinates downward)
    /// </summary>
    public async Task<EmployeeHierarchyDto?> GetHierarchyAsync(int employeeId, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Getting hierarchy for employee with ID: {EmployeeId}", employeeId);

        var employee = await _employeeRepository.GetByIdWithRelationsAsync(employeeId, cancellationToken);
        if (employee == null)
        {
            _logger.LogWarning("Employee with ID {EmployeeId} not found", employeeId);
            return null;
        }

        var visited = new HashSet<int>(); // Prevent circular references
        return BuildHierarchyTree(employee, visited);
    }

    /// <summary>
    /// Build hierarchy tree recursively
    /// </summary>
    private EmployeeHierarchyDto BuildHierarchyTree(Employee employee, HashSet<int> visited)
    {
        // Prevent circular references
        if (visited.Contains(employee.Id))
        {
            return new EmployeeHierarchyDto
            {
                Id = employee.Id,
                FirstName = employee.FirstName,
                LastName = employee.LastName,
                EmployeeNumber = employee.EmployeeNumber,
                Email = employee.Email,
                PositionTitle = employee.Position?.Title,
                DepartmentName = employee.Department?.Name,
                Avatar = employee.Avatar,
                IsManager = employee.IsManager,
                EmploymentStatus = employee.EmploymentStatus
            };
        }

        visited.Add(employee.Id);

        var dto = new EmployeeHierarchyDto
        {
            Id = employee.Id,
            FirstName = employee.FirstName,
            LastName = employee.LastName,
            EmployeeNumber = employee.EmployeeNumber,
            Email = employee.Email,
            PositionTitle = employee.Position?.Title,
            DepartmentName = employee.Department?.Name,
            Avatar = employee.Avatar,
            IsManager = employee.IsManager,
            EmploymentStatus = employee.EmploymentStatus
        };

        // Build manager chain (upward) - only one level up to avoid deep recursion
        if (employee.Manager != null && !visited.Contains(employee.Manager.Id))
        {
            dto.Manager = BuildHierarchyTree(employee.Manager, new HashSet<int>(visited));
        }

        // Build subordinates (downward)
        if (employee.Subordinates != null && employee.Subordinates.Any())
        {
            dto.Subordinates = employee.Subordinates
                .Where(s => s.EmploymentStatus == "Active" && !visited.Contains(s.Id)) // Only show active employees and avoid cycles
                .Select(s => BuildHierarchyTree(s, new HashSet<int>(visited)))
                .OrderBy(s => s.LastName)
                .ThenBy(s => s.FirstName)
                .ToList();
        }

        return dto;
    }
}