using GeneralWebApi.Application.Features.Positions.Commands;
using GeneralWebApi.Application.Services;
using GeneralWebApi.DTOs.Position;
using MediatR;

namespace GeneralWebApi.Application.Features.Positions.Handlers;

public class UpdatePositionCommandHandler : IRequestHandler<UpdatePositionCommand, PositionDto>
{
    private readonly IPositionService _positionService;

    public UpdatePositionCommandHandler(IPositionService positionService)
    {
        _positionService = positionService;
    }

    public async Task<PositionDto> Handle(UpdatePositionCommand request, CancellationToken cancellationToken)
    {
        return await _positionService.UpdateAsync(request.UpdatePositionDto.Id, request.UpdatePositionDto, cancellationToken);
    }
}



