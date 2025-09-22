using GeneralWebApi.Application.Features.Permissions.Permissions.Commands;
using GeneralWebApi.Integration.Repository.Interfaces;
using MediatR;

namespace GeneralWebApi.Application.Features.Permissions.Permissions.Handlers;

/// <summary>
/// Delete permission command handler
/// </summary>
public class DeletePermissionCommandHandler : IRequestHandler<DeletePermissionCommand, bool>
{
    private readonly IPermissionRepository _permissionRepository;
    private readonly IRolePermissionRepository _rolePermissionRepository;

    public DeletePermissionCommandHandler(
        IPermissionRepository permissionRepository,
        IRolePermissionRepository rolePermissionRepository)
    {
        _permissionRepository = permissionRepository;
        _rolePermissionRepository = rolePermissionRepository;
    }

    public async Task<bool> Handle(DeletePermissionCommand request, CancellationToken cancellationToken)
    {
        // Check if permission exists
        if (!await _permissionRepository.ExistsAsync(request.Id))
        {
            return false;
        }

        // Check if permission is assigned to any roles
        var rolePermissions = await _rolePermissionRepository.GetByPermissionIdAsync(request.Id);
        if (rolePermissions.Any())
        {
            throw new InvalidOperationException($"Cannot delete permission with ID {request.Id} because it is assigned to {rolePermissions.Count} role(s).");
        }

        // Delete permission
        return await _permissionRepository.DeleteAsync(request.Id);
    }
}
