using System.Security.Claims;
using GeneralWebApi.Application.Features.Tasks.Queries;
using GeneralWebApi.Application.Services;
using GeneralWebApi.DTOs.Task;
using MediatR;
using Microsoft.AspNetCore.Http;

namespace GeneralWebApi.Application.Features.Tasks.Handlers;

/// <summary>
/// Handler for getting a task by ID
/// </summary>
public class GetTaskByIdQueryHandler : IRequestHandler<GetTaskByIdQuery, TaskDto>
{
    private readonly ITaskService _taskService;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public GetTaskByIdQueryHandler(
        ITaskService taskService,
        IHttpContextAccessor httpContextAccessor)
    {
        _taskService = taskService;
        _httpContextAccessor = httpContextAccessor;
    }

    public async Task<TaskDto> Handle(GetTaskByIdQuery request, CancellationToken cancellationToken)
    {
        var userId = _httpContextAccessor.HttpContext?.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value 
            ?? throw new UnauthorizedAccessException("User ID not found in token");

        return await _taskService.GetByIdAsync(request.Id, userId, cancellationToken);
    }
}

