using MediatR;

namespace GeneralWebApi.Application.Features.Notifications.Commands;

/// <summary>
/// Command for toggling notification read status (read <-> unread)
/// </summary>
public class ToggleReadStatusCommand : IRequest
{
    public int NotificationId { get; set; }
}

