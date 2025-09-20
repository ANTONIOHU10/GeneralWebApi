using GeneralWebApi.Application.Features.Positions.Queries;
using GeneralWebApi.Application.Services;
using GeneralWebApi.DTOs.Position;
using MediatR;

namespace GeneralWebApi.Application.Features.Positions.Handlers;

public class GetPositionsByDepartmentQueryHandler : IRequestHandler<GetPositionsByDepartmentQuery, List<PositionDto>>
{
    private readonly IPositionService _positionService;

    public GetPositionsByDepartmentQueryHandler(IPositionService positionService)
    {
        _positionService = positionService;
    }

    public async Task<List<PositionDto>> Handle(GetPositionsByDepartmentQuery request, CancellationToken cancellationToken)
    {
        return await _positionService.GetByDepartmentIdAsync(request.DepartmentId, cancellationToken);
    }
}

