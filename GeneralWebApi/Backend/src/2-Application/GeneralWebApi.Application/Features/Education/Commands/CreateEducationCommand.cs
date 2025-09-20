using GeneralWebApi.DTOs.Education;
using MediatR;

namespace GeneralWebApi.Application.Features.Education.Commands;

public class CreateEducationCommand : IRequest<EducationDto>
{
    public CreateEducationDto CreateEducationDto { get; set; } = null!;
}

