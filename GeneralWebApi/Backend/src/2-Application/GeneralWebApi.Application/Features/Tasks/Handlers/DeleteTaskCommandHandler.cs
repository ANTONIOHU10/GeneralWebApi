using System.Security.Claims;
using GeneralWebApi.Application.Features.Tasks.Commands;
using GeneralWebApi.Application.Services;
using MediatR;
using Microsoft.AspNetCore.Http;

namespace GeneralWebApi.Application.Features.Tasks.Handlers;

/// <summary>
/// Handler for deleting a task
/// </summary>
public class DeleteTaskCommandHandler : IRequestHandler<DeleteTaskCommand, bool>
{
    private readonly ITaskService _taskService;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public DeleteTaskCommandHandler(
        ITaskService taskService,
        IHttpContextAccessor httpContextAccessor)
    {
        _taskService = taskService;
        _httpContextAccessor = httpContextAccessor;
    }

    public async Task<bool> Handle(DeleteTaskCommand request, CancellationToken cancellationToken)
    {
        var userId = _httpContextAccessor.HttpContext?.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value 
            ?? throw new UnauthorizedAccessException("User ID not found in token");

        return await _taskService.DeleteAsync(request.Id, userId, cancellationToken);
    }
}

