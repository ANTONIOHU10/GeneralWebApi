using GeneralWebApi.DTOs.Permissions;
using MediatR;

namespace GeneralWebApi.Application.Features.Permissions.Roles.Commands;

/// <summary>
/// Create role command
/// </summary>
public class CreateRoleCommand : IRequest<RoleDto>
{
    public CreateRoleDto CreateRoleDto { get; set; } = null!;
}
