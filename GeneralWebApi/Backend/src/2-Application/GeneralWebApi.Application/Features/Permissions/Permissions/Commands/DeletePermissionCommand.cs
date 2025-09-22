using MediatR;

namespace GeneralWebApi.Application.Features.Permissions.Permissions.Commands;

/// <summary>
/// Delete permission command
/// </summary>
public class DeletePermissionCommand : IRequest<bool>
{
    public int Id { get; set; }
}
