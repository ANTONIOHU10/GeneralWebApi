using GeneralWebApi.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GeneralWebApi.Integration.Configuration.BaseEntityConfigurations;

public class FileDocumentConfiguration : IEntityTypeConfiguration<FileDocument>
{
    public void Configure(EntityTypeBuilder<FileDocument> builder)
    {
        builder.ToTable("FileDocuments");
        builder.HasKey(f => f.Id);
        builder.Property(f => f.FileName).IsRequired().HasMaxLength(255);
        builder.Property(f => f.FilePath).IsRequired().HasMaxLength(500);
        builder.Property(f => f.FileExtension).IsRequired().HasMaxLength(50);
        builder.Property(f => f.FileSize).IsRequired();
        builder.Property(f => f.FileContentType).IsRequired().HasMaxLength(100);
        builder.Property(f => f.FileCategory).IsRequired().HasMaxLength(100);
        builder.Property(f => f.OriginalFileName).IsRequired().HasMaxLength(255);
        builder.Property(f => f.FileHash).IsRequired().HasMaxLength(64);
    }
}