using GeneralWebApi.Domain.Entities;
using GeneralWebApi.DTOs.Notification;
using MediatR;

namespace GeneralWebApi.Application.Features.Notifications.Queries;

/// <summary>
/// Query for getting paginated notifications
/// </summary>
public class GetNotificationsQuery : IRequest<PagedResult<NotificationListDto>>
{
    public NotificationSearchDto? SearchDto { get; set; }
}

