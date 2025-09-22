using GeneralWebApi.DTOs.Permissions;
using MediatR;

namespace GeneralWebApi.Application.Features.Permissions.Permissions.Queries;

/// <summary>
/// Get permissions query
/// </summary>
public class GetPermissionsQuery : IRequest<List<PermissionListDto>>
{
    public PermissionSearchDto? SearchDto { get; set; }
}
