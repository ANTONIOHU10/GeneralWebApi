using System.Security.Claims;
using GeneralWebApi.Application.Features.Tasks.Queries;
using GeneralWebApi.Application.Services;
using GeneralWebApi.Domain.Entities;
using GeneralWebApi.DTOs.Task;
using MediatR;
using Microsoft.AspNetCore.Http;

namespace GeneralWebApi.Application.Features.Tasks.Handlers;

/// <summary>
/// Handler for getting paginated tasks
/// </summary>
public class GetTasksQueryHandler : IRequestHandler<GetTasksQuery, PagedResult<TaskListDto>>
{
    private readonly ITaskService _taskService;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public GetTasksQueryHandler(
        ITaskService taskService,
        IHttpContextAccessor httpContextAccessor)
    {
        _taskService = taskService;
        _httpContextAccessor = httpContextAccessor;
    }

    public async Task<PagedResult<TaskListDto>> Handle(GetTasksQuery request, CancellationToken cancellationToken)
    {
        var userId = _httpContextAccessor.HttpContext?.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value 
            ?? throw new UnauthorizedAccessException("User ID not found in token");

        var searchDto = request.SearchDto ?? new TaskSearchDto
        {
            PageNumber = 1,
            PageSize = 20
        };

        return await _taskService.GetPagedAsync(searchDto, userId, cancellationToken);
    }
}

