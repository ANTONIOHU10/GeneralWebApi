using GeneralWebApi.Application.Features.Education.Queries;
using GeneralWebApi.Application.Interfaces;
using GeneralWebApi.DTOs.Education;
using MediatR;

namespace GeneralWebApi.Application.Features.Education.Handlers;

public class GetEducationsByEmployeeIdQueryHandler : IRequestHandler<GetEducationsByEmployeeIdQuery, IEnumerable<EducationListDto>>
{
    private readonly IEducationService _educationService;

    public GetEducationsByEmployeeIdQueryHandler(IEducationService educationService)
    {
        _educationService = educationService;
    }

    public async Task<IEnumerable<EducationListDto>> Handle(GetEducationsByEmployeeIdQuery request, CancellationToken cancellationToken)
    {
        return await _educationService.GetByEmployeeIdAsync(request.EmployeeId, cancellationToken);
    }
}

