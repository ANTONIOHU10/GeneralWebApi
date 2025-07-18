using GeneralWebApi.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GeneralWebApi.Integration.Configuration;

public class ConfigKeyConfiguration : IEntityTypeConfiguration<ConfigKey>
{
    public void Configure(EntityTypeBuilder<ConfigKey> builder)
    {
        builder.ToTable("ConfigKeys");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id).ValueGeneratedOnAdd();
        builder.Property(x => x.Value).HasMaxLength(150).IsRequired();
        builder.Property(x => x.Type).HasMaxLength(50).IsRequired();
        builder.Property(x => x.Description).HasMaxLength(200).IsRequired();
    }
}