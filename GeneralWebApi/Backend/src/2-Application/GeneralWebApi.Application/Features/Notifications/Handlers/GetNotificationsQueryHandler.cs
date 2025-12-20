using System.Security.Claims;
using GeneralWebApi.Application.Features.Notifications.Queries;
using GeneralWebApi.Application.Services;
using GeneralWebApi.Domain.Entities;
using GeneralWebApi.DTOs.Notification;
using MediatR;
using Microsoft.AspNetCore.Http;

namespace GeneralWebApi.Application.Features.Notifications.Handlers;

/// <summary>
/// Handler for getting paginated notifications
/// </summary>
public class GetNotificationsQueryHandler : IRequestHandler<GetNotificationsQuery, PagedResult<NotificationListDto>>
{
    private readonly INotificationService _notificationService;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public GetNotificationsQueryHandler(
        INotificationService notificationService,
        IHttpContextAccessor httpContextAccessor)
    {
        _notificationService = notificationService;
        _httpContextAccessor = httpContextAccessor;
    }

    public async Task<PagedResult<NotificationListDto>> Handle(GetNotificationsQuery request, CancellationToken cancellationToken)
    {
        var userId = _httpContextAccessor.HttpContext?.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value
            ?? throw new UnauthorizedAccessException("User ID not found in token");

        var searchDto = request.SearchDto ?? new NotificationSearchDto
        {
            PageNumber = 1,
            PageSize = 20
        };

        return await _notificationService.GetPagedAsync(searchDto, userId, cancellationToken);
    }
}

