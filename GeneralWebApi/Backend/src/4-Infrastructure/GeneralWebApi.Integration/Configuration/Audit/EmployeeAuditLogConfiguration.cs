using GeneralWebApi.Domain.Entities.Audit;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GeneralWebApi.Integration.Configuration.Audit;

public class EmployeeAuditLogConfiguration : IEntityTypeConfiguration<EmployeeAuditLog>
{
    public void Configure(EntityTypeBuilder<EmployeeAuditLog> builder)
    {
        builder.ToTable("EmployeeAuditLogs");

        #region Primary Key
        builder.HasKey(e => e.Id);
        builder.Property(e => e.Id).ValueGeneratedOnAdd();
        #endregion

        #region Properties Configuration
        // Employee information
        builder.Property(e => e.EmployeeId).IsRequired();
        builder.Property(e => e.EmployeeName).HasMaxLength(200).IsRequired();
        builder.Property(e => e.EmployeeNumber).HasMaxLength(20).IsRequired();

        // User information
        builder.Property(e => e.UserId).HasMaxLength(50).IsRequired();
        builder.Property(e => e.UserName).HasMaxLength(100).IsRequired();

        // Action information
        builder.Property(e => e.Action).HasMaxLength(50).IsRequired();
        builder.Property(e => e.FieldName).HasMaxLength(100);
        builder.Property(e => e.OldValue).HasMaxLength(1000);
        builder.Property(e => e.NewValue).HasMaxLength(1000);

        // Request information
        builder.Property(e => e.IpAddress).HasMaxLength(45); // IPv6 support
        builder.Property(e => e.RequestPath).HasMaxLength(500);

        // Additional information
        builder.Property(e => e.Details).HasMaxLength(2000);
        builder.Property(e => e.Reason).HasMaxLength(500);

        // Approval information
        builder.Property(e => e.IsApproved).HasDefaultValue(true);
        builder.Property(e => e.ApprovedAt);
        builder.Property(e => e.ApprovedBy).HasMaxLength(100);

        // Status information
        builder.Property(e => e.Severity).HasMaxLength(20).HasDefaultValue("Info");
        builder.Property(e => e.IsSuccess).HasDefaultValue(true);
        builder.Property(e => e.ErrorMessage).HasMaxLength(1000);
        #endregion

        #region Indexes
        builder.HasIndex(e => e.EmployeeId);
        builder.HasIndex(e => e.EmployeeNumber);
        builder.HasIndex(e => e.UserId);
        builder.HasIndex(e => e.Action);
        builder.HasIndex(e => e.FieldName);
        builder.HasIndex(e => e.CreatedAt);
        builder.HasIndex(e => e.Severity);
        builder.HasIndex(e => e.IsApproved);
        builder.HasIndex(e => e.IsSuccess);
        builder.HasIndex(e => new { e.EmployeeId, e.CreatedAt });
        builder.HasIndex(e => new { e.UserId, e.CreatedAt });
        #endregion
    }
}
