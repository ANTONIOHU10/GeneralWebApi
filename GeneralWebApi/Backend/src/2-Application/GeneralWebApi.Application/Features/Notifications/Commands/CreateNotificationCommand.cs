using GeneralWebApi.DTOs.Notification;
using MediatR;

namespace GeneralWebApi.Application.Features.Notifications.Commands;

/// <summary>
/// Command for creating a notification
/// </summary>
public class CreateNotificationCommand : IRequest<NotificationDto>
{
    public CreateNotificationDto CreateNotificationDto { get; set; } = null!;
}

