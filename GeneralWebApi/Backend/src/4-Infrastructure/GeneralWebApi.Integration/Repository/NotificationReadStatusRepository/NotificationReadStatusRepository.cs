using GeneralWebApi.Domain.Entities.Notifications;
using GeneralWebApi.Integration.Context;
using GeneralWebApi.Integration.Repository.Base;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using GeneralWebApi.Logging.Templates;

namespace GeneralWebApi.Integration.Repository.NotificationReadStatusRepository;

/// <summary>
/// Repository implementation for NotificationReadStatus operations
/// </summary>
public class NotificationReadStatusRepository : BaseRepository<NotificationReadStatus>, INotificationReadStatusRepository
{
    public NotificationReadStatusRepository(
        ApplicationDbContext context,
        ILogger<BaseRepository<NotificationReadStatus>> logger)
        : base(context, logger)
    {
    }

    public async System.Threading.Tasks.Task<NotificationReadStatus?> GetByNotificationAndUserAsync(
        int notificationId,
        string userId,
        CancellationToken cancellationToken = default)
    {
        return await GetActiveAndEnabledEntities()
            .FirstOrDefaultAsync(
                rs => rs.NotificationId == notificationId && rs.UserId == userId,
                cancellationToken);
    }

    public async System.Threading.Tasks.Task<NotificationReadStatus> MarkAsReadAsync(
        int notificationId,
        string userId,
        CancellationToken cancellationToken = default)
    {
        var existingStatus = await GetByNotificationAndUserAsync(notificationId, userId, cancellationToken);

        if (existingStatus != null)
        {
            // Update existing status
            existingStatus.ReadAt = DateTime.UtcNow;
            existingStatus.IsArchived = false;
            existingStatus.ArchivedAt = null;
            return await UpdateAsync(existingStatus, cancellationToken);
        }

        // Create new read status
        var readStatus = new NotificationReadStatus
        {
            NotificationId = notificationId,
            UserId = userId,
            ReadAt = DateTime.UtcNow,
            IsArchived = false
        };

        return await AddAsync(readStatus, cancellationToken);
    }

    public async System.Threading.Tasks.Task MarkAsArchivedAsync(
        int notificationId,
        string userId,
        CancellationToken cancellationToken = default)
    {
        var readStatus = await GetByNotificationAndUserAsync(notificationId, userId, cancellationToken);

        if (readStatus == null)
        {
            // Create new read status with archived flag
            readStatus = new NotificationReadStatus
            {
                NotificationId = notificationId,
                UserId = userId,
                ReadAt = DateTime.UtcNow,
                IsArchived = true,
                ArchivedAt = DateTime.UtcNow
            };
            await AddAsync(readStatus, cancellationToken);
        }
        else
        {
            // Update existing status
            readStatus.IsArchived = true;
            readStatus.ArchivedAt = DateTime.UtcNow;
            await UpdateAsync(readStatus, cancellationToken);
        }
    }

    public async System.Threading.Tasks.Task MarkAllAsReadAsync(
        string userId,
        CancellationToken cancellationToken = default)
    {
        // Get all unread notifications for the user
        // Note: This method is deprecated as we now use IsRead flag on Notification entity
        var unreadNotifications = await _context.Set<Notification>()
            .Where(n => n.UserId == userId && n.IsActive && !n.IsDeleted)
            .Where(n => !n.IsRead && !n.IsArchived)
            .ToListAsync(cancellationToken);

        var now = DateTime.UtcNow;
        var readStatuses = new List<NotificationReadStatus>();

        foreach (var notification in unreadNotifications)
        {
            var existingStatus = await GetByNotificationAndUserAsync(notification.Id, userId, cancellationToken);

            if (existingStatus == null)
            {
                readStatuses.Add(new NotificationReadStatus
                {
                    NotificationId = notification.Id,
                    UserId = userId,
                    ReadAt = now,
                    IsArchived = false
                });
            }
        }

        if (readStatuses.Any())
        {
            await AddRangeAsync(readStatuses, cancellationToken);
        }
    }

    public async System.Threading.Tasks.Task DeleteReadStatusAsync(
        int notificationId,
        string userId,
        CancellationToken cancellationToken = default)
    {
        var readStatus = await GetByNotificationAndUserAsync(notificationId, userId, cancellationToken);

        if (readStatus != null)
        {
            // Use hard delete (physical delete) for NotificationReadStatus
            // This is safe because it's just an association record, not a main entity
            _dbSet.Remove(readStatus);
            await _context.SaveChangesAsync(cancellationToken);
            _logger.LogInformation("Deleted read status for notification {NotificationId} and user {UserId}", notificationId, userId);
        }
    }
}

