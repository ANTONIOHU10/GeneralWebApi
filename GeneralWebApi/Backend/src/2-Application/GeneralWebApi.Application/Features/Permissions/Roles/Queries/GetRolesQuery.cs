using GeneralWebApi.DTOs.Permissions;
using MediatR;

namespace GeneralWebApi.Application.Features.Permissions.Roles.Queries;

/// <summary>
/// Get roles query
/// </summary>
public class GetRolesQuery : IRequest<List<RoleListDto>>
{
    public RoleSearchDto? SearchDto { get; set; }
}
