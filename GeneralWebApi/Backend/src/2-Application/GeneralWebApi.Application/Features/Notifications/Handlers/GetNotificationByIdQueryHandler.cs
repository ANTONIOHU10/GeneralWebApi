using System.Security.Claims;
using GeneralWebApi.Application.Features.Notifications.Queries;
using GeneralWebApi.Application.Services;
using GeneralWebApi.DTOs.Notification;
using MediatR;
using Microsoft.AspNetCore.Http;

namespace GeneralWebApi.Application.Features.Notifications.Handlers;

/// <summary>
/// Handler for getting a notification by ID
/// </summary>
public class GetNotificationByIdQueryHandler : IRequestHandler<GetNotificationByIdQuery, NotificationDto>
{
    private readonly INotificationService _notificationService;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public GetNotificationByIdQueryHandler(
        INotificationService notificationService,
        IHttpContextAccessor httpContextAccessor)
    {
        _notificationService = notificationService;
        _httpContextAccessor = httpContextAccessor;
    }

    public async Task<NotificationDto> Handle(GetNotificationByIdQuery request, CancellationToken cancellationToken)
    {
        var userId = _httpContextAccessor.HttpContext?.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value
            ?? throw new UnauthorizedAccessException("User ID not found in token");

        return await _notificationService.GetByIdAsync(request.Id, userId, cancellationToken);
    }
}

