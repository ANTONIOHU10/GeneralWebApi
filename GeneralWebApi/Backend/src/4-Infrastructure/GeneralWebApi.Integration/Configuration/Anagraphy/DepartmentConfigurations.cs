using GeneralWebApi.Domain.Entities.Anagraphy;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GeneralWebApi.Integration.Configuration.Anagraphy;

public class DepartmentConfigurations : IEntityTypeConfiguration<Department>
{
    public void Configure(EntityTypeBuilder<Department> builder)
    {
        builder.ToTable("Departments");

        #region Primary Key
        builder.HasKey(d => d.Id);
        builder.Property(d => d.Id).ValueGeneratedOnAdd();
        #endregion

        #region Properties Configuration
        builder.Property(d => d.Name).HasMaxLength(100).IsRequired();
        builder.Property(d => d.Code).HasMaxLength(20).IsRequired();
        builder.Property(d => d.Description).HasMaxLength(500);
        builder.Property(d => d.ParentDepartmentId);
        builder.Property(d => d.Level).IsRequired().HasDefaultValue(1);
        builder.Property(d => d.Path).HasMaxLength(500);
        builder.Property(d => d.ManagerId);
        #endregion

        #region Foreign Key Relationships
        builder.HasOne(d => d.ParentDepartment)
               .WithMany(d => d.SubDepartments)
               .HasForeignKey(d => d.ParentDepartmentId)
               .OnDelete(DeleteBehavior.NoAction);

        builder.HasOne(d => d.Manager)
               .WithMany()
               .HasForeignKey(d => d.ManagerId)
               .OnDelete(DeleteBehavior.NoAction);
        #endregion

        #region Indexes
        builder.HasIndex(d => d.Code).IsUnique();
        builder.HasIndex(d => d.ParentDepartmentId);
        builder.HasIndex(d => d.Level);
        builder.HasIndex(d => d.ManagerId);
        #endregion
    }
}