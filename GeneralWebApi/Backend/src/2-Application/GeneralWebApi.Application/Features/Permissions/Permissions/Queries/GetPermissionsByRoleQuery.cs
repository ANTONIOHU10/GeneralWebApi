using GeneralWebApi.DTOs.Permissions;
using MediatR;

namespace GeneralWebApi.Application.Features.Permissions.Permissions.Queries;

/// <summary>
/// Get permissions by role query
/// </summary>
public class GetPermissionsByRoleQuery : IRequest<List<PermissionListDto>>
{
    public int RoleId { get; set; }
}
