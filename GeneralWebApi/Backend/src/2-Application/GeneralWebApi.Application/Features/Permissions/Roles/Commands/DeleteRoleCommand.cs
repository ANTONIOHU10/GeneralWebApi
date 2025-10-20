using MediatR;

namespace GeneralWebApi.Application.Features.Permissions.Roles.Commands;

/// <summary>
/// Delete role command
/// </summary>
public class DeleteRoleCommand : IRequest<bool>
{
    public int Id { get; set; }
}
