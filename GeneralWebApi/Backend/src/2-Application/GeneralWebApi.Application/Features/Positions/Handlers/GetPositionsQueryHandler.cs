using GeneralWebApi.Application.Features.Positions.Queries;
using GeneralWebApi.Application.Services;
using GeneralWebApi.Domain.Entities;
using GeneralWebApi.DTOs.Position;
using MediatR;

namespace GeneralWebApi.Application.Features.Positions.Handlers;

public class GetPositionsQueryHandler : IRequestHandler<GetPositionsQuery, PagedResult<PositionListDto>>
{
    private readonly IPositionService _positionService;

    public GetPositionsQueryHandler(IPositionService positionService)
    {
        _positionService = positionService;
    }

    public async Task<PagedResult<PositionListDto>> Handle(GetPositionsQuery request, CancellationToken cancellationToken)
    {
        return await _positionService.GetPagedAsync(request.PositionSearchDto, cancellationToken);
    }
}



