using MediatR;

namespace GeneralWebApi.Application.Features.Notifications.Commands;

/// <summary>
/// Command for deleting a notification
/// </summary>
public class DeleteNotificationCommand : IRequest<bool>
{
    public int NotificationId { get; set; }
}

