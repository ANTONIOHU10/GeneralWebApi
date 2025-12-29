using GeneralWebApi.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GeneralWebApi.Integration.Configuration.BaseEntityConfigurations;

public class PasswordResetTokenConfiguration : IEntityTypeConfiguration<PasswordResetToken>
{
    public void Configure(EntityTypeBuilder<PasswordResetToken> builder)
    {
        builder.ToTable("PasswordResetTokens");

        #region Primary Key
        builder.HasKey(prt => prt.Id);
        builder.Property(prt => prt.Id).ValueGeneratedOnAdd();
        #endregion

        #region Properties Configuration
        builder.Property(prt => prt.Token)
            .HasMaxLength(500)
            .IsRequired();

        builder.Property(prt => prt.UserId)
            .IsRequired();

        builder.Property(prt => prt.Email)
            .HasMaxLength(255)
            .IsRequired();

        builder.Property(prt => prt.ExpiresAt)
            .IsRequired();

        builder.Property(prt => prt.CreatedAt)
            .IsRequired();

        builder.Property(prt => prt.UsedAt)
            .IsRequired(false);

        builder.Property(prt => prt.IsUsed)
            .IsRequired()
            .HasDefaultValue(false);

        builder.Property(prt => prt.RequestedFromIp)
            .HasMaxLength(45);

        builder.Property(prt => prt.RequestedFromUserAgent)
            .HasMaxLength(500);
        #endregion

        #region Indexes
        builder.HasIndex(prt => prt.Token)
            .IsUnique();

        builder.HasIndex(prt => prt.UserId);
        builder.HasIndex(prt => prt.Email);
        builder.HasIndex(prt => prt.ExpiresAt);
        #endregion

        #region Relationships
        builder.HasOne(prt => prt.User)
            .WithMany()
            .HasForeignKey(prt => prt.UserId)
            .OnDelete(DeleteBehavior.Cascade);
        #endregion
    }
}

