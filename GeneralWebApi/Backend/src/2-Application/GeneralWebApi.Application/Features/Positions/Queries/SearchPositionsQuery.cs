using GeneralWebApi.DTOs.Position;
using MediatR;

namespace GeneralWebApi.Application.Features.Positions.Queries;

public class SearchPositionsQuery : IRequest<List<PositionDto>>
{
    public PositionSearchDto PositionSearchDto { get; set; } = null!;
}


