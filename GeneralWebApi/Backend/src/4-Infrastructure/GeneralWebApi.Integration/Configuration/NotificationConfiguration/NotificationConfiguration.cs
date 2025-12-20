using GeneralWebApi.Domain.Entities.Notifications;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GeneralWebApi.Integration.Configuration.NotificationConfiguration;

/// <summary>
/// Entity configuration for Notification
/// </summary>
public class NotificationConfiguration : IEntityTypeConfiguration<Notification>
{
    public void Configure(EntityTypeBuilder<Notification> builder)
    {
        builder.ToTable("Notifications");

        // Primary key
        builder.HasKey(n => n.Id);
        builder.Property(n => n.Id).ValueGeneratedOnAdd();

        // Required fields
        builder.Property(n => n.UserId).HasMaxLength(100).IsRequired();
        builder.Property(n => n.Type).HasMaxLength(50).IsRequired();
        builder.Property(n => n.Priority).HasMaxLength(20).IsRequired();
        builder.Property(n => n.Title).HasMaxLength(200).IsRequired();
        builder.Property(n => n.Message).HasMaxLength(1000).IsRequired();

        // Optional fields
        builder.Property(n => n.Icon).HasMaxLength(50);
        builder.Property(n => n.ActionUrl).HasMaxLength(500);
        builder.Property(n => n.ActionLabel).HasMaxLength(100);
        builder.Property(n => n.SourceType).HasMaxLength(100);
        builder.Property(n => n.SourceId).HasMaxLength(100);
        builder.Property(n => n.Metadata).HasColumnType("nvarchar(max)");

        // Dates
        builder.Property(n => n.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
        builder.Property(n => n.ExpiresAt).IsRequired(false);

        // Indexes
        builder.HasIndex(n => n.UserId);
        builder.HasIndex(n => n.Type);
        builder.HasIndex(n => new { n.UserId, n.Type });
        builder.HasIndex(n => n.CreatedAt);

        // Relationships
        builder.HasMany(n => n.ReadStatuses)
            .WithOne(rs => rs.Notification)
            .HasForeignKey(rs => rs.NotificationId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

