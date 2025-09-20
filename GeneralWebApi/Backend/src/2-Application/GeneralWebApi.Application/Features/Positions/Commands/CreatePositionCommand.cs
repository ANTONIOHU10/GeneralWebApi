using GeneralWebApi.DTOs.Position;
using MediatR;

namespace GeneralWebApi.Application.Features.Positions.Commands;

public class CreatePositionCommand : IRequest<PositionDto>
{
    public CreatePositionDto CreatePositionDto { get; set; } = null!;
}



