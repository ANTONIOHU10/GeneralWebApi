using GeneralWebApi.Domain.Entities.Notifications;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GeneralWebApi.Integration.Configuration.NotificationConfiguration;

/// <summary>
/// Entity configuration for NotificationReadStatus
/// </summary>
public class NotificationReadStatusConfiguration : IEntityTypeConfiguration<NotificationReadStatus>
{
    public void Configure(EntityTypeBuilder<NotificationReadStatus> builder)
    {
        builder.ToTable("NotificationReadStatuses");

        // Primary key
        builder.HasKey(rs => rs.Id);
        builder.Property(rs => rs.Id).ValueGeneratedOnAdd();

        // Required fields
        builder.Property(rs => rs.NotificationId).IsRequired();
        builder.Property(rs => rs.UserId).HasMaxLength(100).IsRequired();
        builder.Property(rs => rs.ReadAt).IsRequired();

        // Optional fields
        builder.Property(rs => rs.IsArchived).HasDefaultValue(false);
        builder.Property(rs => rs.ArchivedAt).IsRequired(false);

        // Dates
        builder.Property(rs => rs.CreatedAt).HasDefaultValueSql("GETUTCDATE()");

        // Indexes
        builder.HasIndex(rs => new { rs.NotificationId, rs.UserId }).IsUnique();
        builder.HasIndex(rs => rs.UserId);
        builder.HasIndex(rs => rs.NotificationId);
        builder.HasIndex(rs => rs.ReadAt);

        // Relationships
        builder.HasOne(rs => rs.Notification)
            .WithMany(n => n.ReadStatuses)
            .HasForeignKey(rs => rs.NotificationId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

