using GeneralWebApi.DTOs.Education;
using MediatR;

namespace GeneralWebApi.Application.Features.Education.Queries;

public class GetEducationsByEmployeeIdQuery : IRequest<IEnumerable<EducationListDto>>
{
    public int EmployeeId { get; set; }
}





