using GeneralWebApi.Domain.Entities.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TaskEntity = GeneralWebApi.Domain.Entities.Tasks.Task;

namespace GeneralWebApi.Integration.Configuration.TaskConfiguration;

/// <summary>
/// EF Core configuration for Task entity
/// </summary>
public class TaskConfiguration : IEntityTypeConfiguration<TaskEntity>
{
    public void Configure(EntityTypeBuilder<TaskEntity> builder)
    {
        builder.ToTable("Tasks");

        #region Primary Key
        builder.HasKey(t => t.Id);
        builder.Property(t => t.Id).ValueGeneratedOnAdd();
        #endregion

        #region Properties Configuration
        builder.Property(t => t.Title).HasMaxLength(200).IsRequired();
        builder.Property(t => t.Description).HasMaxLength(2000);
        builder.Property(t => t.Status).HasMaxLength(20).IsRequired().HasDefaultValue("Pending");
        builder.Property(t => t.Priority).HasMaxLength(20).IsRequired().HasDefaultValue("Medium");
        builder.Property(t => t.DueDate);
        builder.Property(t => t.CompletedAt);
        builder.Property(t => t.UserId).HasMaxLength(100).IsRequired();
        builder.Property(t => t.Category).HasMaxLength(50);
        builder.Property(t => t.EstimatedHours).HasColumnType("decimal(10,2)");
        builder.Property(t => t.ActualHours).HasColumnType("decimal(10,2)");
        #endregion

        #region Indexes
        builder.HasIndex(t => t.UserId);
        builder.HasIndex(t => t.Status);
        builder.HasIndex(t => t.Priority);
        builder.HasIndex(t => t.DueDate);
        builder.HasIndex(t => t.Category);
        builder.HasIndex(t => new { t.UserId, t.Status });
        #endregion
    }
}

