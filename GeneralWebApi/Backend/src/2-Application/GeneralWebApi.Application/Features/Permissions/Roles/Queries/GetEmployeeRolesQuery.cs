using GeneralWebApi.DTOs.Permissions;
using MediatR;

namespace GeneralWebApi.Application.Features.Permissions.Roles.Queries;

/// <summary>
/// Get employee roles query
/// </summary>
public class GetEmployeeRolesQuery : IRequest<List<EmployeeRoleDto>>
{
    public int EmployeeId { get; set; }
}
