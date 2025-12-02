using GeneralWebApi.Application.Features.Permissions.Roles.Commands;
using GeneralWebApi.Integration.Repository.Interfaces;
using MediatR;

namespace GeneralWebApi.Application.Features.Permissions.Roles.Handlers;

/// <summary>
/// Delete role command handler
/// </summary>
public class DeleteRoleCommandHandler : IRequestHandler<DeleteRoleCommand, bool>
{
    private readonly IRoleRepository _roleRepository;
    private readonly IEmployeeRoleRepository _employeeRoleRepository;
    private readonly IRolePermissionRepository _rolePermissionRepository;

    public DeleteRoleCommandHandler(
        IRoleRepository roleRepository,
        IEmployeeRoleRepository employeeRoleRepository,
        IRolePermissionRepository rolePermissionRepository)
    {
        _roleRepository = roleRepository;
        _employeeRoleRepository = employeeRoleRepository;
        _rolePermissionRepository = rolePermissionRepository;
    }

    public async Task<bool> Handle(DeleteRoleCommand request, CancellationToken cancellationToken)
    {
        // Check if role exists
        if (!await _roleRepository.ExistsAsync(request.Id))
        {
            throw new KeyNotFoundException($"Role with ID {request.Id} not found");
        }

        // Check if role is assigned to any employees
        var employeeRoles = await _employeeRoleRepository.GetByRoleIdAsync(request.Id);
        if (employeeRoles.Any())
        {
            throw new InvalidOperationException($"Cannot delete role with ID {request.Id} because it is assigned to {employeeRoles.Count} employee(s).");
        }

        // Delete role permissions first
        var rolePermissions = await _rolePermissionRepository.GetByRoleIdAsync(request.Id);
        foreach (var rolePermission in rolePermissions)
        {
            await _rolePermissionRepository.DeleteAsync(rolePermission.Id);
        }

        // Delete role
        var result = await _roleRepository.DeleteAsync(request.Id);
        if (!result)
        {
            throw new InvalidOperationException($"Failed to delete role with ID {request.Id}");
        }

        return true;
    }
}
