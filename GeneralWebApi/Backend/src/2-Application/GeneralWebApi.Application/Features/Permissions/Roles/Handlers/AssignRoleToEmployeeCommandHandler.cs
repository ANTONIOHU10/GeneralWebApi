using AutoMapper;
using GeneralWebApi.Application.Features.Permissions.Roles.Commands;
using GeneralWebApi.DTOs.Permissions;
using GeneralWebApi.Integration.Repository.AnagraphyRepository;
using GeneralWebApi.Integration.Repository.Interfaces;
using MediatR;

namespace GeneralWebApi.Application.Features.Permissions.Roles.Handlers;

/// <summary>
/// Assign role to employee command handler
/// </summary>
public class AssignRoleToEmployeeCommandHandler : IRequestHandler<AssignRoleToEmployeeCommand, EmployeeRoleDto>
{
    private readonly IEmployeeRoleRepository _employeeRoleRepository;
    private readonly IEmployeeRepository _employeeRepository;
    private readonly IRoleRepository _roleRepository;
    private readonly IMapper _mapper;

    public AssignRoleToEmployeeCommandHandler(
        IEmployeeRoleRepository employeeRoleRepository,
        IEmployeeRepository employeeRepository,
        IRoleRepository roleRepository,
        IMapper mapper)
    {
        _employeeRoleRepository = employeeRoleRepository;
        _employeeRepository = employeeRepository;
        _roleRepository = roleRepository;
        _mapper = mapper;
    }

    public async Task<EmployeeRoleDto> Handle(AssignRoleToEmployeeCommand request, CancellationToken cancellationToken)
    {
        // Check if employee exists
        var employee = await _employeeRepository.GetByIdAsync(request.AssignRoleToEmployeeDto.EmployeeId);
        if (employee == null)
        {
            throw new InvalidOperationException($"Employee with ID {request.AssignRoleToEmployeeDto.EmployeeId} not found.");
        }

        // Check if role exists
        var role = await _roleRepository.GetByIdAsync(request.AssignRoleToEmployeeDto.RoleId);
        if (role == null)
        {
            throw new InvalidOperationException($"Role with ID {request.AssignRoleToEmployeeDto.RoleId} not found.");
        }

        // Check if role is already assigned to employee
        if (await _employeeRoleRepository.ExistsByEmployeeAndRoleAsync(request.AssignRoleToEmployeeDto.EmployeeId, request.AssignRoleToEmployeeDto.RoleId))
        {
            throw new InvalidOperationException($"Role '{role.Name}' is already assigned to employee '{employee.FirstName} {employee.LastName}'.");
        }

        // Create employee role assignment
        var employeeRole = new Domain.Entities.Permissions.EmployeeRole
        {
            EmployeeId = request.AssignRoleToEmployeeDto.EmployeeId,
            RoleId = request.AssignRoleToEmployeeDto.RoleId,
            AssignedDate = DateTime.UtcNow,
            ExpiryDate = request.AssignRoleToEmployeeDto.ExpiryDate
        };

        var createdEmployeeRole = await _employeeRoleRepository.CreateAsync(employeeRole);

        // Get the created employee role with related data
        var employeeRoleWithDetails = await _employeeRoleRepository.GetByIdAsync(createdEmployeeRole.Id);
        return _mapper.Map<EmployeeRoleDto>(employeeRoleWithDetails);
    }
}
