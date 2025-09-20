using GeneralWebApi.DTOs.Position;
using MediatR;

namespace GeneralWebApi.Application.Features.Positions.Commands;

public class DeletePositionCommand : IRequest<PositionDto>
{
    public int Id { get; set; }
}

