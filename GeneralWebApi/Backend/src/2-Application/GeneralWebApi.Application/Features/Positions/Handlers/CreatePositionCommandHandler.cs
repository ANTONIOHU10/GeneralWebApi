using GeneralWebApi.Application.Features.Positions.Commands;
using GeneralWebApi.Application.Services;
using GeneralWebApi.DTOs.Position;
using MediatR;

namespace GeneralWebApi.Application.Features.Positions.Handlers;

public class CreatePositionCommandHandler : IRequestHandler<CreatePositionCommand, PositionDto>
{
    private readonly IPositionService _positionService;

    public CreatePositionCommandHandler(IPositionService positionService)
    {
        _positionService = positionService;
    }

    public async Task<PositionDto> Handle(CreatePositionCommand request, CancellationToken cancellationToken)
    {
        return await _positionService.CreateAsync(request.CreatePositionDto, cancellationToken);
    }
}

