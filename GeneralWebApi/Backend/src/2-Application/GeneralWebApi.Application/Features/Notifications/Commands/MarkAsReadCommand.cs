using MediatR;

namespace GeneralWebApi.Application.Features.Notifications.Commands;

/// <summary>
/// Command for marking a notification as read
/// </summary>
public class MarkAsReadCommand : IRequest
{
    public int NotificationId { get; set; }
}

