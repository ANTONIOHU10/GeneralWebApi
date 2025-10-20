using GeneralWebApi.Application.Features.Positions.Queries;
using GeneralWebApi.Application.Services;
using GeneralWebApi.DTOs.Position;
using MediatR;

namespace GeneralWebApi.Application.Features.Positions.Handlers;

public class GetPositionByIdQueryHandler : IRequestHandler<GetPositionByIdQuery, PositionDto>
{
    private readonly IPositionService _positionService;

    public GetPositionByIdQueryHandler(IPositionService positionService)
    {
        _positionService = positionService;
    }

    public async Task<PositionDto> Handle(GetPositionByIdQuery request, CancellationToken cancellationToken)
    {
        return await _positionService.GetByIdAsync(request.Id, cancellationToken);
    }
}





