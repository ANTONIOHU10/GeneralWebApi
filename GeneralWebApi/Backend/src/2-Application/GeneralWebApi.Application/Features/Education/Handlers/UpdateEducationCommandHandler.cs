using GeneralWebApi.Application.Features.Education.Commands;
using GeneralWebApi.Application.Interfaces;
using GeneralWebApi.DTOs.Education;
using MediatR;

namespace GeneralWebApi.Application.Features.Education.Handlers;

public class UpdateEducationCommandHandler : IRequestHandler<UpdateEducationCommand, EducationDto>
{
    private readonly IEducationService _educationService;

    public UpdateEducationCommandHandler(IEducationService educationService)
    {
        _educationService = educationService;
    }

    public async Task<EducationDto> Handle(UpdateEducationCommand request, CancellationToken cancellationToken)
    {
        return await _educationService.UpdateAsync(request.UpdateEducationDto, cancellationToken);
    }
}



