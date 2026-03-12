using GeneralWebApi.Domain.Entities;
using GeneralWebApi.DTOs.Position;
using MediatR;

namespace GeneralWebApi.Application.Features.Positions.Queries;

public class SearchPositionsQuery : IRequest<PagedResult<PositionDto>>
{
    public PositionSearchDto PositionSearchDto { get; set; } = null!;
}


