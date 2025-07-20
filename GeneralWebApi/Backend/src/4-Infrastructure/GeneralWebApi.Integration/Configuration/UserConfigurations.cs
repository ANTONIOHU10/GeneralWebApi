using GeneralWebApi.Domain.Entities;
using GeneralWebApi.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GeneralWebApi.Integration.Configuration;

//this configuration will automatically be scanned by ApplicationDbContext
// and applied to the User entity
public class UserConfigurations : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.ToTable("Users");

        #region properties
        // primary key, db will create and auto increment an id
        builder.HasKey(u => u.Id);
        builder.Property(u => u.Id).ValueGeneratedOnAdd();
        builder.Property(u => u.Name).HasMaxLength(100).IsRequired();
        builder.Property(u => u.Email).HasMaxLength(100).IsRequired();
        builder.Property(u => u.PasswordHash).HasMaxLength(100).IsRequired();
        builder.Property(u => u.PhoneNumber).HasMaxLength(20);
        builder.Property(u => u.Role).HasConversion<string>();
        builder.Property(u => u.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
        #endregion

    }
}