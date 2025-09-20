using GeneralWebApi.Domain.Entities.Documents;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GeneralWebApi.Integration.Configuration.DocumentConfiguration;

public class IdentityDocumentConfiguration : IEntityTypeConfiguration<IdentityDocument>
{
    public void Configure(EntityTypeBuilder<IdentityDocument> builder)
    {
        builder.ToTable("IdentityDocuments");

        #region Primary Key
        builder.HasKey(i => i.Id);
        builder.Property(i => i.Id).ValueGeneratedOnAdd();
        #endregion

        #region Properties Configuration
        builder.Property(i => i.EmployeeId).IsRequired();
        builder.Property(i => i.DocumentType).HasMaxLength(50).IsRequired();
        builder.Property(i => i.DocumentNumber).HasMaxLength(100).IsRequired();
        builder.Property(i => i.IssueDate).IsRequired();
        builder.Property(i => i.ExpirationDate).IsRequired();
        builder.Property(i => i.IssuingAuthority).HasMaxLength(200).IsRequired();
        builder.Property(i => i.IssuingPlace).HasMaxLength(100).IsRequired();
        builder.Property(i => i.IssuingCountry).HasMaxLength(100).IsRequired();
        builder.Property(i => i.IssuingState).HasMaxLength(100).IsRequired();
        builder.Property(i => i.Notes).HasMaxLength(1000);
        #endregion

        #region Foreign Key Relationships
        builder.HasOne(i => i.Employee)
               .WithMany(emp => emp.IdentityDocuments)
               .HasForeignKey(i => i.EmployeeId)
               .OnDelete(DeleteBehavior.Cascade);
        #endregion

        #region Indexes
        builder.HasIndex(i => i.EmployeeId);
        builder.HasIndex(i => i.DocumentType);
        builder.HasIndex(i => i.DocumentNumber);
        builder.HasIndex(i => i.IssuingAuthority);
        builder.HasIndex(i => i.IssuingCountry);
        builder.HasIndex(i => i.ExpirationDate);
        #endregion
    }
}


