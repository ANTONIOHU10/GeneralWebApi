using AutoMapper;
using GeneralWebApi.Application.Features.Permissions.Roles.Queries;
using GeneralWebApi.DTOs.Permissions;
using GeneralWebApi.Integration.Repository.Interfaces;
using MediatR;

namespace GeneralWebApi.Application.Features.Permissions.Roles.Handlers;

/// <summary>
/// Get employee roles search query handler
/// </summary>
public class GetEmployeeRolesSearchQueryHandler : IRequestHandler<GetEmployeeRolesSearchQuery, List<EmployeeRoleDto>>
{
    private readonly IEmployeeRoleRepository _employeeRoleRepository;
    private readonly IMapper _mapper;

    public GetEmployeeRolesSearchQueryHandler(IEmployeeRoleRepository employeeRoleRepository, IMapper mapper)
    {
        _employeeRoleRepository = employeeRoleRepository;
        _mapper = mapper;
    }

    public async Task<List<EmployeeRoleDto>> Handle(GetEmployeeRolesSearchQuery request, CancellationToken cancellationToken)
    {
        List<Domain.Entities.Permissions.EmployeeRole> employeeRoles;

        if (request.SearchDto != null)
        {
            employeeRoles = await _employeeRoleRepository.SearchAsync(
                request.SearchDto.EmployeeId,
                request.SearchDto.EmployeeName,
                request.SearchDto.EmployeeNumber,
                request.SearchDto.RoleId,
                request.SearchDto.RoleName,
                request.SearchDto.IsActive,
                request.SearchDto.AssignedFrom,
                request.SearchDto.AssignedTo,
                request.SearchDto.ExpiryFrom,
                request.SearchDto.ExpiryTo,
                request.SearchDto.SortBy,
                request.SearchDto.SortDescending,
                request.SearchDto.PageNumber,
                request.SearchDto.PageSize);
        }
        else
        {
            employeeRoles = await _employeeRoleRepository.GetAllAsync();
        }

        return _mapper.Map<List<EmployeeRoleDto>>(employeeRoles);
    }
}
