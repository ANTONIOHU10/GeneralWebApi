using GeneralWebApi.Application.Features.Notifications.Commands;
using GeneralWebApi.Application.Services;
using GeneralWebApi.DTOs.Notification;
using MediatR;

namespace GeneralWebApi.Application.Features.Notifications.Handlers;

/// <summary>
/// Handler for creating a notification
/// </summary>
public class CreateNotificationCommandHandler : IRequestHandler<CreateNotificationCommand, NotificationDto>
{
    private readonly INotificationService _notificationService;

    public CreateNotificationCommandHandler(INotificationService notificationService)
    {
        _notificationService = notificationService;
    }

    public async Task<NotificationDto> Handle(CreateNotificationCommand request, CancellationToken cancellationToken)
    {
        return await _notificationService.CreateAsync(request.CreateNotificationDto, cancellationToken);
    }
}

