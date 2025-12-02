using AutoMapper;
using GeneralWebApi.Application.Features.Permissions.Permissions.Queries;
using GeneralWebApi.DTOs.Permissions;
using GeneralWebApi.Integration.Repository.Interfaces;
using MediatR;

namespace GeneralWebApi.Application.Features.Permissions.Permissions.Handlers;

/// <summary>
/// Get permissions by role query handler
/// </summary>
public class GetPermissionsByRoleQueryHandler : IRequestHandler<GetPermissionsByRoleQuery, List<PermissionListDto>>
{
    private readonly IPermissionRepository _permissionRepository;
    private readonly IMapper _mapper;

    public GetPermissionsByRoleQueryHandler(IPermissionRepository permissionRepository, IMapper mapper)
    {
        _permissionRepository = permissionRepository;
        _mapper = mapper;
    }

    public async Task<List<PermissionListDto>> Handle(GetPermissionsByRoleQuery request, CancellationToken cancellationToken)
    {
        var permissions = await _permissionRepository.GetByRoleIdAsync(request.RoleId);
        var permissionListDtos = _mapper.Map<List<PermissionListDto>>(permissions);

        // Set role count for each permission
        foreach (var permissionDto in permissionListDtos)
        {
            var permission = permissions.FirstOrDefault(p => p.Id == permissionDto.Id);
            if (permission != null)
            {
                permissionDto.RoleCount = permission.RolePermissions?.Count ?? 0;
            }
        }

        return permissionListDtos;
    }
}
