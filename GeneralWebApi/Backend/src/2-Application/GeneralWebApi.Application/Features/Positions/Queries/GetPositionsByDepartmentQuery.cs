using GeneralWebApi.DTOs.Position;
using MediatR;

namespace GeneralWebApi.Application.Features.Positions.Queries;

public class GetPositionsByDepartmentQuery : IRequest<List<PositionDto>>
{
    public int DepartmentId { get; set; }
}

