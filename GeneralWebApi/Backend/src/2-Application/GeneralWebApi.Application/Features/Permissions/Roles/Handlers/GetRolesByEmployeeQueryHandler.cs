using AutoMapper;
using GeneralWebApi.Application.Features.Permissions.Roles.Queries;
using GeneralWebApi.DTOs.Permissions;
using GeneralWebApi.Integration.Repository.Interfaces;
using MediatR;

namespace GeneralWebApi.Application.Features.Permissions.Roles.Handlers;

/// <summary>
/// Get roles by employee query handler
/// </summary>
public class GetRolesByEmployeeQueryHandler : IRequestHandler<GetRolesByEmployeeQuery, List<RoleListDto>>
{
    private readonly IRoleRepository _roleRepository;
    private readonly IMapper _mapper;

    public GetRolesByEmployeeQueryHandler(IRoleRepository roleRepository, IMapper mapper)
    {
        _roleRepository = roleRepository;
        _mapper = mapper;
    }

    public async Task<List<RoleListDto>> Handle(GetRolesByEmployeeQuery request, CancellationToken cancellationToken)
    {
        var roles = await _roleRepository.GetByEmployeeIdAsync(request.EmployeeId);
        var roleListDtos = _mapper.Map<List<RoleListDto>>(roles);

        // Set employee count for each role
        foreach (var roleDto in roleListDtos)
        {
            roleDto.EmployeeCount = await _roleRepository.GetEmployeeCountAsync(roleDto.Id);
        }

        return roleListDtos;
    }
}
