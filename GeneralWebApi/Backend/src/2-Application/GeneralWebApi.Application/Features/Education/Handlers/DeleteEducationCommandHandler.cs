using GeneralWebApi.Application.Features.Education.Commands;
using GeneralWebApi.Application.Interfaces;
using GeneralWebApi.DTOs.Education;
using MediatR;

namespace GeneralWebApi.Application.Features.Education.Handlers;

public class DeleteEducationCommandHandler : IRequestHandler<DeleteEducationCommand, EducationDto>
{
    private readonly IEducationService _educationService;

    public DeleteEducationCommandHandler(IEducationService educationService)
    {
        _educationService = educationService;
    }

    public async Task<EducationDto> Handle(DeleteEducationCommand request, CancellationToken cancellationToken)
    {
        return await _educationService.DeleteAsync(request.Id, cancellationToken);
    }
}



