using GeneralWebApi.Application.Features.Permissions.Roles.Commands;
using GeneralWebApi.Integration.Repository.Interfaces;
using MediatR;

namespace GeneralWebApi.Application.Features.Permissions.Roles.Handlers;

/// <summary>
/// Remove role from employee command handler
/// </summary>
public class RemoveRoleFromEmployeeCommandHandler : IRequestHandler<RemoveRoleFromEmployeeCommand, bool>
{
    private readonly IEmployeeRoleRepository _employeeRoleRepository;

    public RemoveRoleFromEmployeeCommandHandler(IEmployeeRoleRepository employeeRoleRepository)
    {
        _employeeRoleRepository = employeeRoleRepository;
    }

    public async Task<bool> Handle(RemoveRoleFromEmployeeCommand request, CancellationToken cancellationToken)
    {
        // Check if employee role assignment exists
        if (!await _employeeRoleRepository.ExistsByEmployeeAndRoleAsync(request.EmployeeId, request.RoleId))
        {
            throw new KeyNotFoundException($"Role assignment not found for employee ID {request.EmployeeId} and role ID {request.RoleId}");
        }

        // Remove employee role assignment
        var result = await _employeeRoleRepository.DeleteByEmployeeAndRoleAsync(request.EmployeeId, request.RoleId);
        if (!result)
        {
            throw new InvalidOperationException($"Failed to remove role assignment for employee ID {request.EmployeeId} and role ID {request.RoleId}");
        }

        return true;
    }
}
