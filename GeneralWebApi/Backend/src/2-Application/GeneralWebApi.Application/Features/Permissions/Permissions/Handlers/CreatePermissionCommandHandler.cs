using AutoMapper;
using GeneralWebApi.Application.Features.Permissions.Permissions.Commands;
using GeneralWebApi.DTOs.Permissions;
using GeneralWebApi.Integration.Repository.Interfaces;
using MediatR;

namespace GeneralWebApi.Application.Features.Permissions.Permissions.Handlers;

/// <summary>
/// Create permission command handler
/// </summary>
public class CreatePermissionCommandHandler : IRequestHandler<CreatePermissionCommand, PermissionDto>
{
    private readonly IPermissionRepository _permissionRepository;
    private readonly IMapper _mapper;

    public CreatePermissionCommandHandler(IPermissionRepository permissionRepository, IMapper mapper)
    {
        _permissionRepository = permissionRepository;
        _mapper = mapper;
    }

    public async Task<PermissionDto> Handle(CreatePermissionCommand request, CancellationToken cancellationToken)
    {
        // Check if permission name already exists
        if (await _permissionRepository.ExistsByNameAsync(request.CreatePermissionDto.Name))
        {
            throw new InvalidOperationException($"Permission with name '{request.CreatePermissionDto.Name}' already exists.");
        }

        // Create permission
        var permission = new Domain.Entities.Permissions.Permission
        {
            Name = request.CreatePermissionDto.Name,
            Description = request.CreatePermissionDto.Description,
            Resource = request.CreatePermissionDto.Resource,
            Action = request.CreatePermissionDto.Action,
            Category = request.CreatePermissionDto.Category
        };

        var createdPermission = await _permissionRepository.CreateAsync(permission);
        return _mapper.Map<PermissionDto>(createdPermission);
    }
}
