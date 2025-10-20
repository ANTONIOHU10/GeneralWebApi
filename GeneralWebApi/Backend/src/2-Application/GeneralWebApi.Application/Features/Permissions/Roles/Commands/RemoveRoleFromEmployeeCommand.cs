using MediatR;

namespace GeneralWebApi.Application.Features.Permissions.Roles.Commands;

/// <summary>
/// Remove role from employee command
/// </summary>
public class RemoveRoleFromEmployeeCommand : IRequest<bool>
{
    public int EmployeeId { get; set; }
    public int RoleId { get; set; }
}
