using GeneralWebApi.Domain.Entities.Documents;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GeneralWebApi.Integration.Configuration.DocumentConfiguration;


public class CertificationConfiguration : IEntityTypeConfiguration<Certification>
{
    public void Configure(EntityTypeBuilder<Certification> builder)
    {
        builder.ToTable("Certifications");

        #region Primary Key
        builder.HasKey(c => c.Id);
        builder.Property(c => c.Id).ValueGeneratedOnAdd();
        #endregion

        #region Properties Configuration
        builder.Property(c => c.EmployeeId).IsRequired();
        builder.Property(c => c.Name).HasMaxLength(200).IsRequired();
        builder.Property(c => c.IssuingOrganization).HasMaxLength(200).IsRequired();
        builder.Property(c => c.IssueDate).IsRequired();
        builder.Property(c => c.ExpiryDate);
        builder.Property(c => c.CredentialId).HasMaxLength(100);
        builder.Property(c => c.CredentialUrl).HasMaxLength(500);
        builder.Property(c => c.Notes).HasMaxLength(1000);
        #endregion

        #region Foreign Key Relationships
        builder.HasOne(c => c.Employee)
               .WithMany(e => e.Certifications)
               .HasForeignKey(c => c.EmployeeId)
               .OnDelete(DeleteBehavior.Cascade);
        #endregion

        #region Indexes
        builder.HasIndex(c => c.EmployeeId);
        builder.HasIndex(c => c.Name);
        builder.HasIndex(c => c.IssuingOrganization);
        builder.HasIndex(c => c.ExpiryDate);
        #endregion
    }
}