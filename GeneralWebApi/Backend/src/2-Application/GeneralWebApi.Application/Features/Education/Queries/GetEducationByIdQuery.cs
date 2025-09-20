using GeneralWebApi.DTOs.Education;
using MediatR;

namespace GeneralWebApi.Application.Features.Education.Queries;

public class GetEducationByIdQuery : IRequest<EducationDto>
{
    public int Id { get; set; }
}





