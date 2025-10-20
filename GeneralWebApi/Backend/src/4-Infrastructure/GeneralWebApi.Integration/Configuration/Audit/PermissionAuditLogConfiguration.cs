using GeneralWebApi.Domain.Entities.Audit;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GeneralWebApi.Integration.Configuration.Audit;

public class PermissionAuditLogConfiguration : IEntityTypeConfiguration<PermissionAuditLog>
{
    public void Configure(EntityTypeBuilder<PermissionAuditLog> builder)
    {
        builder.ToTable("PermissionAuditLogs");

        #region Primary Key
        builder.HasKey(p => p.Id);
        builder.Property(p => p.Id).ValueGeneratedOnAdd();
        #endregion

        #region Properties Configuration
        // Target user information
        builder.Property(p => p.TargetUserId).HasMaxLength(50).IsRequired();
        builder.Property(p => p.TargetUserName).HasMaxLength(100).IsRequired();

        // User information
        builder.Property(p => p.UserId).HasMaxLength(50).IsRequired();
        builder.Property(p => p.UserName).HasMaxLength(100).IsRequired();

        // Action information
        builder.Property(p => p.Action).HasMaxLength(50).IsRequired();

        // Role information
        builder.Property(p => p.RoleId);
        builder.Property(p => p.RoleName).HasMaxLength(100);

        // Permission information
        builder.Property(p => p.PermissionId);
        builder.Property(p => p.PermissionName).HasMaxLength(100);
        builder.Property(p => p.Resource).HasMaxLength(100);
        builder.Property(p => p.ResourceAction).HasMaxLength(50);

        // Request information
        builder.Property(p => p.IpAddress).HasMaxLength(45); // IPv6 support
        builder.Property(p => p.RequestPath).HasMaxLength(500);

        // Additional information
        builder.Property(p => p.Details).HasMaxLength(2000);
        builder.Property(p => p.Reason).HasMaxLength(500);

        // Approval information
        builder.Property(p => p.IsApproved).HasDefaultValue(true);
        builder.Property(p => p.ApprovedAt);
        builder.Property(p => p.ApprovedBy).HasMaxLength(100);
        builder.Property(p => p.ExpiryDate);

        // Status information
        builder.Property(p => p.Severity).HasMaxLength(20).HasDefaultValue("Info");
        builder.Property(p => p.IsSuccess).HasDefaultValue(true);
        builder.Property(p => p.ErrorMessage).HasMaxLength(1000);
        #endregion

        #region Indexes
        builder.HasIndex(p => p.TargetUserId);
        builder.HasIndex(p => p.UserId);
        builder.HasIndex(p => p.Action);
        builder.HasIndex(p => p.RoleId);
        builder.HasIndex(p => p.PermissionId);
        builder.HasIndex(p => p.Resource);
        builder.HasIndex(p => p.CreatedAt);
        builder.HasIndex(p => p.Severity);
        builder.HasIndex(p => p.IsApproved);
        builder.HasIndex(p => p.IsSuccess);
        builder.HasIndex(p => p.ExpiryDate);
        builder.HasIndex(p => new { p.TargetUserId, p.CreatedAt });
        builder.HasIndex(p => new { p.UserId, p.CreatedAt });
        #endregion
    }
}
