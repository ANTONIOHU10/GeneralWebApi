using AutoMapper;
using GeneralWebApi.Application.Features.Permissions.Roles.Commands;
using GeneralWebApi.DTOs.Permissions;
using GeneralWebApi.Integration.Repository.Interfaces;
using MediatR;

namespace GeneralWebApi.Application.Features.Permissions.Roles.Handlers;

/// <summary>
/// Update role command handler
/// </summary>
public class UpdateRoleCommandHandler : IRequestHandler<UpdateRoleCommand, RoleDto>
{
    private readonly IRoleRepository _roleRepository;
    private readonly IPermissionRepository _permissionRepository;
    private readonly IRolePermissionRepository _rolePermissionRepository;
    private readonly IMapper _mapper;

    public UpdateRoleCommandHandler(
        IRoleRepository roleRepository,
        IPermissionRepository permissionRepository,
        IRolePermissionRepository rolePermissionRepository,
        IMapper mapper)
    {
        _roleRepository = roleRepository;
        _permissionRepository = permissionRepository;
        _rolePermissionRepository = rolePermissionRepository;
        _mapper = mapper;
    }

    public async Task<RoleDto> Handle(UpdateRoleCommand request, CancellationToken cancellationToken)
    {
        // Get existing role
        var existingRole = await _roleRepository.GetByIdAsync(request.Id);
        if (existingRole == null)
        {
            throw new InvalidOperationException($"Role with ID {request.Id} not found.");
        }

        // Check if role name already exists (excluding current role)
        var roleWithSameName = await _roleRepository.GetByNameAsync(request.UpdateRoleDto.Name);
        if (roleWithSameName != null && roleWithSameName.Id != request.Id)
        {
            throw new InvalidOperationException($"Role with name '{request.UpdateRoleDto.Name}' already exists.");
        }

        // Update role properties
        existingRole.Name = request.UpdateRoleDto.Name;
        existingRole.Description = request.UpdateRoleDto.Description;

        await _roleRepository.UpdateAsync(existingRole);

        // Update role permissions
        // First, remove all existing permissions
        var existingPermissions = await _rolePermissionRepository.GetByRoleIdAsync(request.Id);
        foreach (var permission in existingPermissions)
        {
            await _rolePermissionRepository.DeleteAsync(permission.Id);
        }

        // Then, add new permissions
        if (request.UpdateRoleDto.PermissionIds.Any())
        {
            foreach (var permissionId in request.UpdateRoleDto.PermissionIds)
            {
                var permission = await _permissionRepository.GetByIdAsync(permissionId);
                if (permission != null)
                {
                    var rolePermission = new Domain.Entities.Permissions.RolePermission
                    {
                        RoleId = request.Id,
                        PermissionId = permissionId
                    };
                    await _rolePermissionRepository.CreateAsync(rolePermission);
                }
            }
        }

        // Get the updated role with permissions
        var updatedRole = await _roleRepository.GetByIdAsync(request.Id);
        return _mapper.Map<RoleDto>(updatedRole);
    }
}
