using GeneralWebApi.DTOs.Permissions;
using MediatR;

namespace GeneralWebApi.Application.Features.Permissions.Roles.Queries;

/// <summary>
/// Get roles by employee query
/// </summary>
public class GetRolesByEmployeeQuery : IRequest<List<RoleListDto>>
{
    public int EmployeeId { get; set; }
}
