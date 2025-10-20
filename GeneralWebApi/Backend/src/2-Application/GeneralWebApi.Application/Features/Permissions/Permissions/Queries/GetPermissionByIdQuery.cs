using GeneralWebApi.DTOs.Permissions;
using MediatR;

namespace GeneralWebApi.Application.Features.Permissions.Permissions.Queries;

/// <summary>
/// Get permission by ID query
/// </summary>
public class GetPermissionByIdQuery : IRequest<PermissionDto?>
{
    public int Id { get; set; }
}
