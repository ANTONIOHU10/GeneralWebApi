using GeneralWebApi.Domain.Entities.Anagraphy;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GeneralWebApi.Integration.Configuration.Anagraphy;
public class PositionConfigurations : IEntityTypeConfiguration<Position>
{
    public void Configure(EntityTypeBuilder<Position> builder)
    {
        builder.ToTable("Positions");

        #region Primary Key
        builder.HasKey(p => p.Id);
        builder.Property(p => p.Id).ValueGeneratedOnAdd();
        #endregion

        #region Properties Configuration
        builder.Property(p => p.Title).HasMaxLength(100).IsRequired();
        builder.Property(p => p.Code).HasMaxLength(20).IsRequired();
        builder.Property(p => p.Description).HasMaxLength(500);
        builder.Property(p => p.DepartmentId).IsRequired();
        builder.Property(p => p.Level).IsRequired().HasDefaultValue(1);
        builder.Property(p => p.ParentPositionId);
        builder.Property(p => p.MinSalary).HasColumnType("decimal(18,2)");
        builder.Property(p => p.MaxSalary).HasColumnType("decimal(18,2)");
        builder.Property(p => p.IsManagement).HasDefaultValue(false);
        #endregion

        #region Foreign Key Relationships
        // department relationship
        builder.HasOne(p => p.Department)
               .WithMany(d => d.Positions)
               .HasForeignKey(p => p.DepartmentId)
               .OnDelete(DeleteBehavior.NoAction);

        // self-reference relationship - parent position
        builder.HasOne(p => p.ParentPosition)
               .WithMany(p => p.SubPositions)
               .HasForeignKey(p => p.ParentPositionId)
               .OnDelete(DeleteBehavior.NoAction);
        #endregion

        #region Indexes
        builder.HasIndex(p => p.Code).IsUnique();
        builder.HasIndex(p => p.DepartmentId);
        builder.HasIndex(p => p.Level);
        builder.HasIndex(p => p.ParentPositionId);
        builder.HasIndex(p => p.IsManagement);
        #endregion
    }
}