using GeneralWebApi.DTOs.Permissions;
using MediatR;

namespace GeneralWebApi.Application.Features.Permissions.Permissions.Commands;

/// <summary>
/// Update permission command
/// </summary>
public class UpdatePermissionCommand : IRequest<PermissionDto>
{
    public int Id { get; set; }
    public UpdatePermissionDto UpdatePermissionDto { get; set; } = null!;
}
