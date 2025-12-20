using System.Security.Claims;
using GeneralWebApi.Application.Features.Notifications.Commands;
using GeneralWebApi.Application.Services;
using MediatR;
using Microsoft.AspNetCore.Http;

namespace GeneralWebApi.Application.Features.Notifications.Handlers;

/// <summary>
/// Handler for marking a notification as archived
/// </summary>
public class MarkAsArchivedCommandHandler : IRequestHandler<MarkAsArchivedCommand>
{
    private readonly INotificationService _notificationService;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public MarkAsArchivedCommandHandler(
        INotificationService notificationService,
        IHttpContextAccessor httpContextAccessor)
    {
        _notificationService = notificationService;
        _httpContextAccessor = httpContextAccessor;
    }

    public async Task Handle(MarkAsArchivedCommand request, CancellationToken cancellationToken)
    {
        var userId = _httpContextAccessor.HttpContext?.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value
            ?? throw new UnauthorizedAccessException("User ID not found in token");

        await _notificationService.MarkAsArchivedAsync(request.NotificationId, userId, cancellationToken);
    }
}

