using GeneralWebApi.DTOs.Permissions;
using MediatR;

namespace GeneralWebApi.Application.Features.Permissions.Roles.Queries;

/// <summary>
/// Get role by ID query
/// </summary>
public class GetRoleByIdQuery : IRequest<RoleDto>
{
    public int Id { get; set; }
}
