using MediatR;

namespace GeneralWebApi.Application.Features.Notifications.Commands;

/// <summary>
/// Command for marking a notification as archived
/// </summary>
public class MarkAsArchivedCommand : IRequest
{
    public int NotificationId { get; set; }
}

