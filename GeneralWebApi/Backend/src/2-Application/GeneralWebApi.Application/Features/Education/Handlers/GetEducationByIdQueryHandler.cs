using GeneralWebApi.Application.Features.Education.Queries;
using GeneralWebApi.Application.Interfaces;
using GeneralWebApi.DTOs.Education;
using MediatR;

namespace GeneralWebApi.Application.Features.Education.Handlers;

public class GetEducationByIdQueryHandler : IRequestHandler<GetEducationByIdQuery, EducationDto>
{
    private readonly IEducationService _educationService;

    public GetEducationByIdQueryHandler(IEducationService educationService)
    {
        _educationService = educationService;
    }

    public async Task<EducationDto> Handle(GetEducationByIdQuery request, CancellationToken cancellationToken)
    {
        return await _educationService.GetByIdAsync(request.Id, cancellationToken);
    }
}





