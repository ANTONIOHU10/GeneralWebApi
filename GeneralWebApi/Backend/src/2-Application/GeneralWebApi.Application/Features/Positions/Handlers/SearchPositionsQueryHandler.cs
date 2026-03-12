using AutoMapper;
using GeneralWebApi.Application.Features.Positions.Queries;
using GeneralWebApi.Domain.Entities;
using GeneralWebApi.DTOs.Position;
using GeneralWebApi.Integration.Repository.AnagraphyRepository;
using MediatR;

namespace GeneralWebApi.Application.Features.Positions.Handlers;

public class SearchPositionsQueryHandler : IRequestHandler<SearchPositionsQuery, PagedResult<PositionDto>>
{
    private readonly IPositionRepository _positionRepository;
    private readonly IMapper _mapper;

    public SearchPositionsQueryHandler(IPositionRepository positionRepository, IMapper mapper)
    {
        _positionRepository = positionRepository;
        _mapper = mapper;
    }

    public async Task<PagedResult<PositionDto>> Handle(SearchPositionsQuery request, CancellationToken cancellationToken)
    {
        var result = await _positionRepository.GetPagedAsync(
            pageNumber: request.PositionSearchDto.PageNumber,
            pageSize: request.PositionSearchDto.PageSize,
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

        var mappedItems = _mapper.Map<List<PositionDto>>(result.Items);
        return new PagedResult<PositionDto>(mappedItems, result.TotalCount, result.PageNumber, result.PageSize);
    }
}


