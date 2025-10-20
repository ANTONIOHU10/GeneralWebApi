using GeneralWebApi.DTOs.Permissions;
using MediatR;

namespace GeneralWebApi.Application.Features.Permissions.Permissions.Commands;

/// <summary>
/// Create permission command
/// </summary>
public class CreatePermissionCommand : IRequest<PermissionDto>
{
    public CreatePermissionDto CreatePermissionDto { get; set; } = null!;
}
