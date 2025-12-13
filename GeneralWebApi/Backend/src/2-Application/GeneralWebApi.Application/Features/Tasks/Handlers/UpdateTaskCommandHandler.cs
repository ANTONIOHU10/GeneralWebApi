using System.Security.Claims;
using GeneralWebApi.Application.Features.Tasks.Commands;
using GeneralWebApi.Application.Services;
using GeneralWebApi.DTOs.Task;
using MediatR;
using Microsoft.AspNetCore.Http;

namespace GeneralWebApi.Application.Features.Tasks.Handlers;

/// <summary>
/// Handler for updating an existing task
/// </summary>
public class UpdateTaskCommandHandler : IRequestHandler<UpdateTaskCommand, TaskDto>
{
    private readonly ITaskService _taskService;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public UpdateTaskCommandHandler(
        ITaskService taskService,
        IHttpContextAccessor httpContextAccessor)
    {
        _taskService = taskService;
        _httpContextAccessor = httpContextAccessor;
    }

    public async Task<TaskDto> Handle(UpdateTaskCommand request, CancellationToken cancellationToken)
    {
        var userId = _httpContextAccessor.HttpContext?.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value 
            ?? throw new UnauthorizedAccessException("User ID not found in token");

        return await _taskService.UpdateAsync(request.UpdateTaskDto.Id, request.UpdateTaskDto, userId, cancellationToken);
    }
}

