using System.Text.Json;
using AutoMapper;
using GeneralWebApi.Domain.Entities;
using GeneralWebApi.Domain.Entities.Notifications;
using GeneralWebApi.DTOs.Notification;
using GeneralWebApi.Integration.Repository.NotificationRepository;
using Microsoft.Extensions.Logging;

namespace GeneralWebApi.Application.Services;

/// <summary>
/// Service implementation for Notification operations
/// </summary>
public class NotificationService : INotificationService
{
    private readonly INotificationRepository _notificationRepository;
    private readonly IMapper _mapper;
    private readonly ILogger<NotificationService> _logger;

    public NotificationService(
        INotificationRepository notificationRepository,
        IMapper mapper,
        ILogger<NotificationService> logger)
    {
        _notificationRepository = notificationRepository;
        _mapper = mapper;
        _logger = logger;
    }

    public async System.Threading.Tasks.Task<NotificationDto> CreateAsync(
        CreateNotificationDto createDto,
        CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Creating notification for user: {UserId}", createDto.UserId);

        var notification = _mapper.Map<Notification>(createDto);

        // Serialize metadata to JSON
        if (createDto.Metadata != null)
        {
            notification.Metadata = JsonSerializer.Serialize(createDto.Metadata);
        }

        var createdNotification = await _notificationRepository.AddAsync(notification, cancellationToken);
        _logger.LogInformation("Successfully created notification with ID: {NotificationId}", createdNotification.Id);

        return await MapToDtoAsync(createdNotification, createDto.UserId, cancellationToken);
    }

    public async System.Threading.Tasks.Task<NotificationDto> GetByIdAsync(
        int id,
        string userId,
        CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Getting notification by ID: {NotificationId} for user: {UserId}", id, userId);

        var notification = await _notificationRepository.GetByIdAsync(id, cancellationToken);

        // Verify ownership
        if (notification.UserId != userId)
        {
            _logger.LogWarning("User {UserId} attempted to access notification {NotificationId} owned by {OwnerId}",
                userId, id, notification.UserId);
            throw new UnauthorizedAccessException("You do not have permission to access this notification");
        }

        return await MapToDtoAsync(notification, userId, cancellationToken);
    }

    public async System.Threading.Tasks.Task<PagedResult<NotificationListDto>> GetPagedAsync(
        NotificationSearchDto searchDto,
        string userId,
        CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Getting paged notifications for user: {UserId}", userId);

        var result = await _notificationRepository.GetPagedAsync(
            searchDto.PageNumber,
            searchDto.PageSize,
            userId,
            searchDto.Type,
            searchDto.Status,
            searchDto.Priority,
            searchDto.StartDate,
            searchDto.EndDate,
            searchDto.IncludeExpired,
            searchDto.SortBy,
            searchDto.SortDescending,
            cancellationToken);

        var notificationListDtos = new List<NotificationListDto>();
        var now = DateTime.UtcNow;

        foreach (var notification in result.Items)
        {
            var dto = _mapper.Map<NotificationListDto>(notification);
            dto.Status = notification.IsRead ? "read" : "unread";
            dto.ReadAt = notification.ReadAt;
            dto.IsExpired = notification.ExpiresAt.HasValue && notification.ExpiresAt < now;

            notificationListDtos.Add(dto);
        }

        return new PagedResult<NotificationListDto>(
            notificationListDtos,
            result.TotalCount,
            result.PageNumber,
            result.PageSize);
    }

    public async System.Threading.Tasks.Task<int> GetUnreadCountAsync(
        string userId,
        CancellationToken cancellationToken = default)
    {
        return await _notificationRepository.GetUnreadCountAsync(userId, cancellationToken);
    }

    public async System.Threading.Tasks.Task ToggleReadStatusAsync(
        int notificationId,
        string userId,
        CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Toggling read status for notification {NotificationId} for user: {UserId}", notificationId, userId);

        var notification = await _notificationRepository.GetByIdAsync(notificationId, cancellationToken);

        // Verify ownership
        if (notification.UserId != userId)
        {
            _logger.LogWarning("User {UserId} attempted to toggle notification {NotificationId} owned by {OwnerId}",
                userId, notificationId, notification.UserId);
            throw new UnauthorizedAccessException("You do not have permission to toggle this notification's read status");
        }

        // Toggle read status
        notification.IsRead = !notification.IsRead;
        notification.ReadAt = notification.IsRead ? DateTime.UtcNow : null;

        await _notificationRepository.UpdateAsync(notification, cancellationToken);
        
        var status = notification.IsRead ? "read" : "unread";
        _logger.LogInformation("Successfully toggled notification {NotificationId} to {Status}", notificationId, status);
    }

    public async System.Threading.Tasks.Task MarkAllAsReadAsync(
        string userId,
        CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Marking all notifications as read for user: {UserId}", userId);
        
        var unreadNotifications = await _notificationRepository.GetUnreadNotificationsAsync(userId, cancellationToken);
        var now = DateTime.UtcNow;

        foreach (var notification in unreadNotifications)
        {
            notification.IsRead = true;
            notification.ReadAt = now;
        }

        if (unreadNotifications.Any())
        {
            await _notificationRepository.UpdateRangeAsync(unreadNotifications, cancellationToken);
        }

        _logger.LogInformation("Successfully marked {Count} notifications as read for user: {UserId}", 
            unreadNotifications.Count, userId);
    }

    public async System.Threading.Tasks.Task MarkAsArchivedAsync(
        int notificationId,
        string userId,
        CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Marking notification {NotificationId} as archived for user: {UserId}", notificationId, userId);

        var notification = await _notificationRepository.GetByIdAsync(notificationId, cancellationToken);

        // Verify ownership
        if (notification.UserId != userId)
        {
            _logger.LogWarning("User {UserId} attempted to archive notification {NotificationId} owned by {OwnerId}",
                userId, notificationId, notification.UserId);
            throw new UnauthorizedAccessException("You do not have permission to archive this notification");
        }

        notification.IsArchived = true;
        notification.ArchivedAt = DateTime.UtcNow;
        await _notificationRepository.UpdateAsync(notification, cancellationToken);
        
        _logger.LogInformation("Successfully marked notification {NotificationId} as archived", notificationId);
    }

    public async System.Threading.Tasks.Task<bool> DeleteAsync(
        int id,
        string userId,
        CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Deleting notification with ID: {NotificationId} for user: {UserId}", id, userId);

        var notification = await _notificationRepository.GetByIdAsync(id, cancellationToken);

        // Verify ownership
        if (notification.UserId != userId)
        {
            _logger.LogWarning("User {UserId} attempted to delete notification {NotificationId} owned by {OwnerId}",
                userId, id, notification.UserId);
            throw new UnauthorizedAccessException("You do not have permission to delete this notification");
        }

        await _notificationRepository.DeleteAsync(id, cancellationToken);
        _logger.LogInformation("Successfully deleted notification with ID: {NotificationId}", id);
        return true;
    }

    /// <summary>
    /// Map Notification entity to DTO with read status
    /// </summary>
    private async System.Threading.Tasks.Task<NotificationDto> MapToDtoAsync(
        Notification notification,
        string userId,
        CancellationToken cancellationToken)
    {
        var dto = _mapper.Map<NotificationDto>(notification);

        // Set status based on IsRead and IsArchived flags
        dto.Status = notification.IsArchived ? "archived" : (notification.IsRead ? "read" : "unread");
        dto.ReadAt = notification.ReadAt;
        dto.ArchivedAt = notification.ArchivedAt;

        // Deserialize metadata
        if (!string.IsNullOrEmpty(notification.Metadata))
        {
            try
            {
                dto.Metadata = JsonSerializer.Deserialize<Dictionary<string, object>>(notification.Metadata);
            }
            catch (JsonException ex)
            {
                _logger.LogWarning(ex, "Failed to deserialize metadata for notification {NotificationId}", notification.Id);
            }
        }

        return dto;
    }
}

