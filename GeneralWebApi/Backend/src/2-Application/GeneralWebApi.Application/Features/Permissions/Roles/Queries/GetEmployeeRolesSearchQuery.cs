using GeneralWebApi.DTOs.Permissions;
using MediatR;

namespace GeneralWebApi.Application.Features.Permissions.Roles.Queries;

/// <summary>
/// Get employee roles search query
/// </summary>
public class GetEmployeeRolesSearchQuery : IRequest<List<EmployeeRoleDto>>
{
    public EmployeeRoleSearchDto? SearchDto { get; set; }
}
