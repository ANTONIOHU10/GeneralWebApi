using AutoMapper;
using GeneralWebApi.Application.Features.Permissions.Roles.Commands;
using GeneralWebApi.DTOs.Permissions;
using GeneralWebApi.Integration.Repository.Interfaces;
using MediatR;

namespace GeneralWebApi.Application.Features.Permissions.Roles.Handlers;

/// <summary>
/// Create role command handler
/// </summary>
public class CreateRoleCommandHandler : IRequestHandler<CreateRoleCommand, RoleDto>
{
    private readonly IRoleRepository _roleRepository;
    private readonly IPermissionRepository _permissionRepository;
    private readonly IRolePermissionRepository _rolePermissionRepository;
    private readonly IMapper _mapper;

    public CreateRoleCommandHandler(
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

    public async Task<RoleDto> Handle(CreateRoleCommand request, CancellationToken cancellationToken)
    {
        // Check if role name already exists
        if (await _roleRepository.ExistsByNameAsync(request.CreateRoleDto.Name))
        {
            throw new InvalidOperationException($"Role with name '{request.CreateRoleDto.Name}' already exists.");
        }

        // Create role
        var role = new Domain.Entities.Permissions.Role
        {
            Name = request.CreateRoleDto.Name,
            Description = request.CreateRoleDto.Description
        };

        var createdRole = await _roleRepository.CreateAsync(role);

        // Assign permissions to role
        if (request.CreateRoleDto.PermissionIds.Any())
        {
            foreach (var permissionId in request.CreateRoleDto.PermissionIds)
            {
                var permission = await _permissionRepository.GetByIdAsync(permissionId);
                if (permission != null)
                {
                    var rolePermission = new Domain.Entities.Permissions.RolePermission
                    {
                        RoleId = createdRole.Id,
                        PermissionId = permissionId
                    };
                    await _rolePermissionRepository.CreateAsync(rolePermission);
                }
            }
        }

        // Get the role with permissions
        var roleWithPermissions = await _roleRepository.GetByIdAsync(createdRole.Id);
        return _mapper.Map<RoleDto>(roleWithPermissions);
    }
}
