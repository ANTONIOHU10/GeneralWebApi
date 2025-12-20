using GeneralWebApi.DTOs.Notification;
using MediatR;

namespace GeneralWebApi.Application.Features.Notifications.Queries;

/// <summary>
/// Query for getting a notification by ID
/// </summary>
public class GetNotificationByIdQuery : IRequest<NotificationDto>
{
    public int Id { get; set; }
}

