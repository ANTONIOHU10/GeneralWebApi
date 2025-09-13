using GeneralWebApi.Domain.Entities.Permissions;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GeneralWebApi.Integration.Configuration.PermissionConfiguration;

public class EmployeeRoleConfiguration : IEntityTypeConfiguration<EmployeeRole>
{
    public void Configure(EntityTypeBuilder<EmployeeRole> builder)
    {
        builder.ToTable("EmployeeRoles");

        #region Primary Key
        builder.HasKey(er => er.Id);
        builder.Property(er => er.Id).ValueGeneratedOnAdd();
        #endregion

        #region Properties Configuration
        builder.Property(er => er.EmployeeId).IsRequired();
        builder.Property(er => er.RoleId).IsRequired();
        builder.Property(er => er.AssignedDate).IsRequired().HasDefaultValueSql("GETUTCDATE()");
        builder.Property(er => er.ExpiryDate);
        #endregion

        #region Foreign Key Relationships
        builder.HasOne(er => er.Employee)
               .WithMany(e => e.EmployeeRoles)
               .HasForeignKey(er => er.EmployeeId)
               .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(er => er.Role)
               .WithMany(r => r.EmployeeRoles)
               .HasForeignKey(er => er.RoleId)
               .OnDelete(DeleteBehavior.Cascade);
        #endregion

        #region Indexes
        builder.HasIndex(er => er.EmployeeId);
        builder.HasIndex(er => er.RoleId);
        builder.HasIndex(er => new { er.EmployeeId, er.RoleId }).IsUnique();
        builder.HasIndex(er => er.ExpiryDate);
        #endregion
    }
}