using GeneralWebApi.DTOs.Permissions;
using MediatR;

namespace GeneralWebApi.Application.Features.Permissions.Roles.Commands;

/// <summary>
/// Update role command
/// </summary>
public class UpdateRoleCommand : IRequest<RoleDto>
{
    public int Id { get; set; }
    public UpdateRoleDto UpdateRoleDto { get; set; } = null!;
}
