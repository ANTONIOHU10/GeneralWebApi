using GeneralWebApi.DTOs.Employee;
using MediatR;

namespace GeneralWebApi.Application.Features.Employees.Queries;

public class GetManagersLookupQuery : IRequest<List<ManagerLookupDto>>
{
    public string? SearchTerm { get; set; }
    public int? ExcludeEmployeeId { get; set; }
    public int MaxResults { get; set; } = 100;
}

