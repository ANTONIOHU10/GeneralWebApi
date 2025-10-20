using GeneralWebApi.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GeneralWebApi.Integration.Configuration.BaseEntityConfigurations;

public class ExternalApiConfiguration : IEntityTypeConfiguration<ExternalApiConfig>
{
    public void Configure(EntityTypeBuilder<ExternalApiConfig> builder)
    {
        builder.ToTable("ExternalApiConfigs");

        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id).ValueGeneratedOnAdd();

        builder.Property(x => x.Name).HasMaxLength(100).IsRequired();
        builder.Property(x => x.BaseUrl).HasMaxLength(500).IsRequired();
        builder.Property(x => x.ApiKey).HasMaxLength(500);
        builder.Property(x => x.AuthToken).HasMaxLength(1000);
        builder.Property(x => x.Username).HasMaxLength(100);
        builder.Property(x => x.Password).HasMaxLength(100);
        builder.Property(x => x.ClientId).HasMaxLength(100);
        builder.Property(x => x.ClientSecret).HasMaxLength(100);
        builder.Property(x => x.Endpoint).HasMaxLength(200);
        builder.Property(x => x.HttpMethod).HasMaxLength(10).IsRequired();
        builder.Property(x => x.Headers).HasMaxLength(2000); // JSON Format
        builder.Property(x => x.TimeoutSeconds).IsRequired();
        builder.Property(x => x.Description).HasMaxLength(500);
        builder.Property(x => x.Category).HasMaxLength(50);

        // create index
        builder.HasIndex(x => x.Name).IsUnique();
        builder.HasIndex(x => x.Category);
        builder.HasIndex(x => x.IsActive);
    }

}