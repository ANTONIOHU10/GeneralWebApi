using AutoMapper;
using GeneralWebApi.Application.Features.Positions.Queries;
using GeneralWebApi.DTOs.Position;
using GeneralWebApi.Integration.Repository.AnagraphyRepository;
using MediatR;

namespace GeneralWebApi.Application.Features.Positions.Handlers;

public class SearchPositionsQueryHandler : IRequestHandler<SearchPositionsQuery, List<PositionDto>>
{
    private readonly IPositionRepository _positionRepository;
    private readonly IMapper _mapper;

    public SearchPositionsQueryHandler(IPositionRepository positionRepository, IMapper mapper)
    {
        _positionRepository = positionRepository;
        _mapper = mapper;
    }

    public async Task<List<PositionDto>> Handle(SearchPositionsQuery request, CancellationToken cancellationToken)
    {
        // Set PageSize to max to get all matching positions (no pagination for search)
        var result = await _positionRepository.GetPagedAsync(
            pageNumber: 1,
            pageSize: int.MaxValue, // Get all matching positions
            searchTerm: request.PositionSearchDto.SearchTerm,
            departmentId: request.PositionSearchDto.DepartmentId,
            level: request.PositionSearchDto.Level,
            isManagement: request.PositionSearchDto.IsManagement,
            title: request.PositionSearchDto.Title,
            code: request.PositionSearchDto.Code,
            description: request.PositionSearchDto.Description,
            sortBy: request.PositionSearchDto.SortBy,
            sortDescending: request.PositionSearchDto.SortDescending,
            cancellationToken: cancellationToken);

        return _mapper.Map<List<PositionDto>>(result.Items);
    }
}


