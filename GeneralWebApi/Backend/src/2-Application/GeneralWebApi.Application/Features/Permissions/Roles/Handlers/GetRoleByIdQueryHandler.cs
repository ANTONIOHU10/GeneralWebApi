using AutoMapper;
using GeneralWebApi.Application.Features.Permissions.Roles.Queries;
using GeneralWebApi.DTOs.Permissions;
using GeneralWebApi.Integration.Repository.Interfaces;
using MediatR;

namespace GeneralWebApi.Application.Features.Permissions.Roles.Handlers;

/// <summary>
/// Get role by ID query handler
/// </summary>
public class GetRoleByIdQueryHandler : IRequestHandler<GetRoleByIdQuery, RoleDto>
{
    private readonly IRoleRepository _roleRepository;
    private readonly IMapper _mapper;

    public GetRoleByIdQueryHandler(IRoleRepository roleRepository, IMapper mapper)
    {
        _roleRepository = roleRepository;
        _mapper = mapper;
    }

    public async Task<RoleDto> Handle(GetRoleByIdQuery request, CancellationToken cancellationToken)
    {
        var role = await _roleRepository.GetByIdAsync(request.Id);
        if (role == null)
        {
            throw new KeyNotFoundException($"Role with ID {request.Id} not found");
        }

        var roleDto = _mapper.Map<RoleDto>(role);

        // Set employee count
        roleDto.EmployeeCount = await _roleRepository.GetEmployeeCountAsync(request.Id);

        return roleDto;
    }
}
