using System.Security.Claims;
using GeneralWebApi.Application.Features.Tasks.Commands;
using GeneralWebApi.Application.Services;
using GeneralWebApi.DTOs.Task;
using MediatR;
using Microsoft.AspNetCore.Http;

namespace GeneralWebApi.Application.Features.Tasks.Handlers;

/// <summary>
/// Handler for creating a new task
/// </summary>
public class CreateTaskCommandHandler : IRequestHandler<CreateTaskCommand, TaskDto>
{
    private readonly ITaskService _taskService;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public CreateTaskCommandHandler(
        ITaskService taskService,
        IHttpContextAccessor httpContextAccessor)
    {
        _taskService = taskService;
        _httpContextAccessor = httpContextAccessor;
    }

    public async Task<TaskDto> Handle(CreateTaskCommand request, CancellationToken cancellationToken)
    {
        var userId = _httpContextAccessor.HttpContext?.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value 
            ?? throw new UnauthorizedAccessException("User ID not found in token");

        return await _taskService.CreateAsync(request.CreateTaskDto, userId, cancellationToken);
    }
}

