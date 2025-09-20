using GeneralWebApi.DTOs.Education;
using GeneralWebApi.Domain.Entities;
using MediatR;

namespace GeneralWebApi.Application.Features.Education.Queries;

public class GetEducationsQuery : IRequest<PagedResult<EducationListDto>>
{
    public EducationSearchDto EducationSearchDto { get; set; } = null!;
}

