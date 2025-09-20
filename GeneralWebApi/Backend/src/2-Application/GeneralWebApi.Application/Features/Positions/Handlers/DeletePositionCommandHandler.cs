using GeneralWebApi.Application.Features.Positions.Commands;
using GeneralWebApi.Application.Services;
using GeneralWebApi.DTOs.Position;
using MediatR;

namespace GeneralWebApi.Application.Features.Positions.Handlers;

public class DeletePositionCommandHandler : IRequestHandler<DeletePositionCommand, PositionDto>
{
    private readonly IPositionService _positionService;

    public DeletePositionCommandHandler(IPositionService positionService)
    {
        _positionService = positionService;
    }

    public async Task<PositionDto> Handle(DeletePositionCommand request, CancellationToken cancellationToken)
    {
        return await _positionService.DeleteAsync(request.Id, cancellationToken);
    }
}



