using GeneralWebApi.DTOs.Position;
using MediatR;

namespace GeneralWebApi.Application.Features.Positions.Commands;

public class UpdatePositionCommand : IRequest<PositionDto>
{
    public UpdatePositionDto UpdatePositionDto { get; set; } = null!;
}





