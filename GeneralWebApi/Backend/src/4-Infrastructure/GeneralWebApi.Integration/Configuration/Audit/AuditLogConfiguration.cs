using GeneralWebApi.Domain.Entities.Audit;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GeneralWebApi.Integration.Configuration.Audit;

public class AuditLogConfiguration : IEntityTypeConfiguration<AuditLog>
{
    public void Configure(EntityTypeBuilder<AuditLog> builder)
    {
        builder.ToTable("AuditLogs");

        #region Primary Key
        builder.HasKey(a => a.Id);
        builder.Property(a => a.Id).ValueGeneratedOnAdd();
        #endregion

        #region Properties Configuration
        // User information
        builder.Property(a => a.UserId).HasMaxLength(50).IsRequired();
        builder.Property(a => a.UserName).HasMaxLength(100).IsRequired();

        // Action information
        builder.Property(a => a.Action).HasMaxLength(50).IsRequired();
        builder.Property(a => a.EntityType).HasMaxLength(100).IsRequired();
        builder.Property(a => a.EntityId).HasMaxLength(50).IsRequired();
        builder.Property(a => a.EntityName).HasMaxLength(200);

        // Request information
        builder.Property(a => a.IpAddress).HasMaxLength(45); // IPv6 support
        builder.Property(a => a.UserAgent).HasMaxLength(500);
        builder.Property(a => a.RequestPath).HasMaxLength(500);
        builder.Property(a => a.HttpMethod).HasMaxLength(10);
        builder.Property(a => a.RequestId).HasMaxLength(100);

        // Data changes
        builder.Property(a => a.Details).HasMaxLength(2000);
        builder.Property(a => a.OldValues).HasMaxLength(4000);
        builder.Property(a => a.NewValues).HasMaxLength(4000);

        // Status information
        builder.Property(a => a.Severity).HasMaxLength(20).HasDefaultValue("Info");
        builder.Property(a => a.Category).HasMaxLength(50).HasDefaultValue("General");
        builder.Property(a => a.IsSuccess).HasDefaultValue(true);
        builder.Property(a => a.ErrorMessage).HasMaxLength(1000);
        builder.Property(a => a.DurationMs);
        #endregion

        #region Indexes
        builder.HasIndex(a => a.UserId);
        builder.HasIndex(a => a.Action);
        builder.HasIndex(a => a.EntityType);
        builder.HasIndex(a => a.EntityId);
        builder.HasIndex(a => a.CreatedAt);
        builder.HasIndex(a => a.Severity);
        builder.HasIndex(a => a.Category);
        builder.HasIndex(a => a.IsSuccess);
        builder.HasIndex(a => new { a.EntityType, a.EntityId });
        builder.HasIndex(a => new { a.UserId, a.CreatedAt });
        #endregion
    }
}
