using GeneralWebApi.DTOs.Position;
using MediatR;

namespace GeneralWebApi.Application.Features.Positions.Queries;

public class GetPositionByIdQuery : IRequest<PositionDto>
{
    public int Id { get; set; }
}



