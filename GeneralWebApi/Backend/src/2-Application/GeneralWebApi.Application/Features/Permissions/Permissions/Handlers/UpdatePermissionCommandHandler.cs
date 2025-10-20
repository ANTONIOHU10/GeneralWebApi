using AutoMapper;
using GeneralWebApi.Application.Features.Permissions.Permissions.Commands;
using GeneralWebApi.DTOs.Permissions;
using GeneralWebApi.Integration.Repository.Interfaces;
using MediatR;

namespace GeneralWebApi.Application.Features.Permissions.Permissions.Handlers;

/// <summary>
/// Update permission command handler
/// </summary>
public class UpdatePermissionCommandHandler : IRequestHandler<UpdatePermissionCommand, PermissionDto>
{
    private readonly IPermissionRepository _permissionRepository;
    private readonly IMapper _mapper;

    public UpdatePermissionCommandHandler(IPermissionRepository permissionRepository, IMapper mapper)
    {
        _permissionRepository = permissionRepository;
        _mapper = mapper;
    }

    public async Task<PermissionDto> Handle(UpdatePermissionCommand request, CancellationToken cancellationToken)
    {
        // Get existing permission
        var existingPermission = await _permissionRepository.GetByIdAsync(request.Id);
        if (existingPermission == null)
        {
            throw new InvalidOperationException($"Permission with ID {request.Id} not found.");
        }

        // Check if permission name already exists (excluding current permission)
        var permissionWithSameName = await _permissionRepository.GetByNameAsync(request.UpdatePermissionDto.Name);
        if (permissionWithSameName != null && permissionWithSameName.Id != request.Id)
        {
            throw new InvalidOperationException($"Permission with name '{request.UpdatePermissionDto.Name}' already exists.");
        }

        // Update permission properties
        existingPermission.Name = request.UpdatePermissionDto.Name;
        existingPermission.Description = request.UpdatePermissionDto.Description;
        existingPermission.Resource = request.UpdatePermissionDto.Resource;
        existingPermission.Action = request.UpdatePermissionDto.Action;
        existingPermission.Category = request.UpdatePermissionDto.Category;

        var updatedPermission = await _permissionRepository.UpdateAsync(existingPermission);
        return _mapper.Map<PermissionDto>(updatedPermission);
    }
}
