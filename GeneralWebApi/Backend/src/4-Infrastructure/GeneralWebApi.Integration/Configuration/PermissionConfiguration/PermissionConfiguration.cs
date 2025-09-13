using GeneralWebApi.Domain.Entities.Permissions;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GeneralWebApi.Integration.Configuration.PermissionConfiguration;

public class PermissionConfiguration : IEntityTypeConfiguration<Permission>
{
    public void Configure(EntityTypeBuilder<Permission> builder)
    {
        builder.ToTable("Permissions");

        #region Primary Key
        builder.HasKey(p => p.Id);
        builder.Property(p => p.Id).ValueGeneratedOnAdd();
        #endregion

        #region Properties Configuration
        builder.Property(p => p.Name).HasMaxLength(100).IsRequired();
        builder.Property(p => p.Description).HasMaxLength(500);
        builder.Property(p => p.Resource).HasMaxLength(100).IsRequired();
        builder.Property(p => p.Action).HasMaxLength(50).IsRequired();
        builder.Property(p => p.Category).HasMaxLength(50).IsRequired();
        #endregion

        #region Indexes
        builder.HasIndex(p => p.Name).IsUnique();
        builder.HasIndex(p => p.Resource);
        builder.HasIndex(p => p.Action);
        builder.HasIndex(p => p.Category);
        builder.HasIndex(p => new { p.Resource, p.Action }).IsUnique();
        #endregion
    }
}