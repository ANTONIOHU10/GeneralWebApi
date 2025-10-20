using AutoMapper;
using GeneralWebApi.Application.Features.Permissions.Roles.Queries;
using GeneralWebApi.DTOs.Permissions;
using GeneralWebApi.Integration.Repository.Interfaces;
using MediatR;

namespace GeneralWebApi.Application.Features.Permissions.Roles.Handlers;

/// <summary>
/// Get roles query handler
/// </summary>
public class GetRolesQueryHandler : IRequestHandler<GetRolesQuery, List<RoleListDto>>
{
    private readonly IRoleRepository _roleRepository;
    private readonly IMapper _mapper;

    public GetRolesQueryHandler(IRoleRepository roleRepository, IMapper mapper)
    {
        _roleRepository = roleRepository;
        _mapper = mapper;
    }

    public async Task<List<RoleListDto>> Handle(GetRolesQuery request, CancellationToken cancellationToken)
    {
        List<Domain.Entities.Permissions.Role> roles;

        if (request.SearchDto != null)
        {
            roles = await _roleRepository.SearchAsync(
                request.SearchDto.Name,
                request.SearchDto.Description,
                request.SearchDto.MinEmployeeCount,
                request.SearchDto.MaxEmployeeCount,
                request.SearchDto.CreatedFrom,
                request.SearchDto.CreatedTo,
                request.SearchDto.SortBy,
                request.SearchDto.SortDescending,
                request.SearchDto.PageNumber,
                request.SearchDto.PageSize);
        }
        else
        {
            roles = await _roleRepository.GetAllAsync();
        }

        var roleListDtos = _mapper.Map<List<RoleListDto>>(roles);

        // Set employee count for each role
        foreach (var roleDto in roleListDtos)
        {
            roleDto.EmployeeCount = await _roleRepository.GetEmployeeCountAsync(roleDto.Id);
        }

        return roleListDtos;
    }
}
