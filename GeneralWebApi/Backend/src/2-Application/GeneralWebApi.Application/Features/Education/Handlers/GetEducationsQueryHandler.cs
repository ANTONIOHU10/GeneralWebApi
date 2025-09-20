using GeneralWebApi.Application.Features.Education.Queries;
using GeneralWebApi.Application.Interfaces;
using GeneralWebApi.Domain.Entities;
using GeneralWebApi.DTOs.Education;
using MediatR;

namespace GeneralWebApi.Application.Features.Education.Handlers;

public class GetEducationsQueryHandler : IRequestHandler<GetEducationsQuery, PagedResult<EducationListDto>>
{
    private readonly IEducationService _educationService;

    public GetEducationsQueryHandler(IEducationService educationService)
    {
        _educationService = educationService;
    }

    public async Task<PagedResult<EducationListDto>> Handle(GetEducationsQuery request, CancellationToken cancellationToken)
    {
        return await _educationService.GetPagedAsync(request.EducationSearchDto, cancellationToken);
    }
}



