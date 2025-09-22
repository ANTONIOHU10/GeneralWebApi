using GeneralWebApi.DTOs.Permissions;
using MediatR;

namespace GeneralWebApi.Application.Features.Permissions.Roles.Commands;

/// <summary>
/// Assign role to employee command
/// </summary>
public class AssignRoleToEmployeeCommand : IRequest<EmployeeRoleDto>
{
    public AssignRoleToEmployeeDto AssignRoleToEmployeeDto { get; set; } = null!;
}
