using AutoMapper;
using GeneralWebApi.Application.Features.Permissions.Permissions.Queries;
using GeneralWebApi.DTOs.Permissions;
using GeneralWebApi.Integration.Repository.Interfaces;
using MediatR;

namespace GeneralWebApi.Application.Features.Permissions.Permissions.Handlers;

/// <summary>
/// Get permissions query handler
/// </summary>
public class GetPermissionsQueryHandler : IRequestHandler<GetPermissionsQuery, List<PermissionListDto>>
{
    private readonly IPermissionRepository _permissionRepository;
    private readonly IMapper _mapper;

    public GetPermissionsQueryHandler(IPermissionRepository permissionRepository, IMapper mapper)
    {
        _permissionRepository = permissionRepository;
        _mapper = mapper;
    }

    public async Task<List<PermissionListDto>> Handle(GetPermissionsQuery request, CancellationToken cancellationToken)
    {
        List<Domain.Entities.Permissions.Permission> permissions;

        if (request.SearchDto != null)
        {
            permissions = await _permissionRepository.SearchAsync(
                request.SearchDto.Name,
                request.SearchDto.Resource,
                request.SearchDto.Action,
                request.SearchDto.Category,
                request.SearchDto.CreatedFrom,
                request.SearchDto.CreatedTo,
                request.SearchDto.SortBy,
                request.SearchDto.SortDescending,
                request.SearchDto.PageNumber,
                request.SearchDto.PageSize);
        }
        else
        {
            permissions = await _permissionRepository.GetAllAsync();
        }

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
