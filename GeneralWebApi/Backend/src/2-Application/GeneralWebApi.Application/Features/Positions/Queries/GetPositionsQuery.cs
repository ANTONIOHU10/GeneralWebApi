using GeneralWebApi.Domain.Entities;
using GeneralWebApi.DTOs.Position;
using MediatR;

namespace GeneralWebApi.Application.Features.Positions.Queries;

public class GetPositionsQuery : IRequest<PagedResult<PositionListDto>>
{
    public PositionSearchDto PositionSearchDto { get; set; } = null!;
}





