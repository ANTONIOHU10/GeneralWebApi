using GeneralWebApi.DTOs.Education;
using MediatR;

namespace GeneralWebApi.Application.Features.Education.Commands;

public class DeleteEducationCommand : IRequest<EducationDto>
{
    public int Id { get; set; }
}



