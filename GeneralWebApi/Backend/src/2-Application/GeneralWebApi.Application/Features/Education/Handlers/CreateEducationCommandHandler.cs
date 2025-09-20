using GeneralWebApi.Application.Features.Education.Commands;
using GeneralWebApi.Application.Interfaces;
using GeneralWebApi.DTOs.Education;
using MediatR;

namespace GeneralWebApi.Application.Features.Education.Handlers;

public class CreateEducationCommandHandler : IRequestHandler<CreateEducationCommand, EducationDto>
{
    private readonly IEducationService _educationService;

    public CreateEducationCommandHandler(IEducationService educationService)
    {
        _educationService = educationService;
    }

    public async Task<EducationDto> Handle(CreateEducationCommand request, CancellationToken cancellationToken)
    {
        return await _educationService.CreateAsync(request.CreateEducationDto, cancellationToken);
    }
}



