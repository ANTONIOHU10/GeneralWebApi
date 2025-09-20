using GeneralWebApi.DTOs.Education;
using MediatR;

namespace GeneralWebApi.Application.Features.Education.Commands;

public class UpdateEducationCommand : IRequest<EducationDto>
{
    public UpdateEducationDto UpdateEducationDto { get; set; } = null!;
}

