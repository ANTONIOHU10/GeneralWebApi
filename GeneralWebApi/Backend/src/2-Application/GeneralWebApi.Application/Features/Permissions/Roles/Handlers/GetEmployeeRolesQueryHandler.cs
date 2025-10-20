using AutoMapper;
using GeneralWebApi.Application.Features.Permissions.Roles.Queries;
using GeneralWebApi.DTOs.Permissions;
using GeneralWebApi.Integration.Repository.Interfaces;
using MediatR;

namespace GeneralWebApi.Application.Features.Permissions.Roles.Handlers;

/// <summary>
/// Get employee roles query handler
/// </summary>
public class GetEmployeeRolesQueryHandler : IRequestHandler<GetEmployeeRolesQuery, List<EmployeeRoleDto>>
{
    private readonly IEmployeeRoleRepository _employeeRoleRepository;
    private readonly IMapper _mapper;

    public GetEmployeeRolesQueryHandler(IEmployeeRoleRepository employeeRoleRepository, IMapper mapper)
    {
        _employeeRoleRepository = employeeRoleRepository;
        _mapper = mapper;
    }

    public async Task<List<EmployeeRoleDto>> Handle(GetEmployeeRolesQuery request, CancellationToken cancellationToken)
    {
        var employeeRoles = await _employeeRoleRepository.GetByEmployeeIdAsync(request.EmployeeId);
        return _mapper.Map<List<EmployeeRoleDto>>(employeeRoles);
    }
}
