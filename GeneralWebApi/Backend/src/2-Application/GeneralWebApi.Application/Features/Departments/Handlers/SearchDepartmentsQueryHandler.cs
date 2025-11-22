using AutoMapper;
using GeneralWebApi.Application.Features.Departments.Queries;
using GeneralWebApi.DTOs.Department;
using GeneralWebApi.Integration.Repository.AnagraphyRepository;
using MediatR;

namespace GeneralWebApi.Application.Features.Departments.Handlers;

public class SearchDepartmentsQueryHandler : IRequestHandler<SearchDepartmentsQuery, List<DepartmentDto>>
{
    private readonly IDepartmentRepository _departmentRepository;
    private readonly IMapper _mapper;

    public SearchDepartmentsQueryHandler(IDepartmentRepository departmentRepository, IMapper mapper)
    {
        _departmentRepository = departmentRepository;
        _mapper = mapper;
    }

    public async Task<List<DepartmentDto>> Handle(SearchDepartmentsQuery request, CancellationToken cancellationToken)
    {
        // Set PageSize to max to get all matching departments (no pagination for search)
        var result = await _departmentRepository.GetPagedAsync(
            pageNumber: 1,
            pageSize: int.MaxValue, // Get all matching departments
            searchTerm: request.DepartmentSearchDto.SearchTerm,
            parentDepartmentId: request.DepartmentSearchDto.ParentDepartmentId,
            level: request.DepartmentSearchDto.Level,
            name: request.DepartmentSearchDto.Name,
            code: request.DepartmentSearchDto.Code,
            description: request.DepartmentSearchDto.Description,
            sortBy: request.DepartmentSearchDto.SortBy,
            sortDescending: request.DepartmentSearchDto.SortDescending,
            cancellationToken: cancellationToken);

        return _mapper.Map<List<DepartmentDto>>(result.Items);
    }
}

