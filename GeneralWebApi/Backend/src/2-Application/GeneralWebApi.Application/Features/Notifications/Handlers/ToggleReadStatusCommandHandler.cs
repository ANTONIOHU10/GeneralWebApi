using System.Security.Claims;
using GeneralWebApi.Application.Features.Notifications.Commands;
using GeneralWebApi.Application.Services;
using MediatR;
using Microsoft.AspNetCore.Http;

namespace GeneralWebApi.Application.Features.Notifications.Handlers;

/// <summary>
/// Handler for toggling notification read status
/// </summary>
public class ToggleReadStatusCommandHandler : IRequestHandler<ToggleReadStatusCommand>
{
    private readonly INotificationService _notificationService;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public ToggleReadStatusCommandHandler(
        INotificationService notificationService,
        IHttpContextAccessor httpContextAccessor)
    {
        _notificationService = notificationService;
        _httpContextAccessor = httpContextAccessor;
    }

    public async Task Handle(ToggleReadStatusCommand request, CancellationToken cancellationToken)
    {
        var userId = _httpContextAccessor.HttpContext?.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value
            ?? throw new UnauthorizedAccessException("User ID not found in token");

        await _notificationService.ToggleReadStatusAsync(request.NotificationId, userId, cancellationToken);
    }
}

