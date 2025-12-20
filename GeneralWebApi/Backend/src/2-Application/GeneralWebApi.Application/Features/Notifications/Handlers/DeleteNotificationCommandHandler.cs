using System.Security.Claims;
using GeneralWebApi.Application.Features.Notifications.Commands;
using GeneralWebApi.Application.Services;
using MediatR;
using Microsoft.AspNetCore.Http;

namespace GeneralWebApi.Application.Features.Notifications.Handlers;

/// <summary>
/// Handler for deleting a notification
/// </summary>
public class DeleteNotificationCommandHandler : IRequestHandler<DeleteNotificationCommand, bool>
{
    private readonly INotificationService _notificationService;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public DeleteNotificationCommandHandler(
        INotificationService notificationService,
        IHttpContextAccessor httpContextAccessor)
    {
        _notificationService = notificationService;
        _httpContextAccessor = httpContextAccessor;
    }

    public async Task<bool> Handle(DeleteNotificationCommand request, CancellationToken cancellationToken)
    {
        var userId = _httpContextAccessor.HttpContext?.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value
            ?? throw new UnauthorizedAccessException("User ID not found in token");

        return await _notificationService.DeleteAsync(request.NotificationId, userId, cancellationToken);
    }
}

