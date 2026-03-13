using GeneralWebApi.Domain.Entities.Documents;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GeneralWebApi.Integration.Configuration.DocumentConfiguration;

/// <summary>
/// EF Core configuration for ContractTemplate entity and indexes for list/get performance.
/// </summary>
public class ContractTemplateConfiguration : IEntityTypeConfiguration<ContractTemplate>
{
    public void Configure(EntityTypeBuilder<ContractTemplate> builder)
    {
        builder.ToTable("ContractTemplates");

        #region Primary Key

        builder.HasKey(t => t.Id);
        builder.Property(t => t.Id).ValueGeneratedOnAdd();

        #endregion

        #region Properties

        builder.Property(t => t.Name).HasMaxLength(200).IsRequired();
        builder.Property(t => t.Description).HasMaxLength(1000);
        builder.Property(t => t.ContractType).HasMaxLength(50).IsRequired();
        builder.Property(t => t.TemplateContent).IsRequired();
        builder.Property(t => t.Variables).HasMaxLength(4000);
        builder.Property(t => t.Category).HasMaxLength(50);
        builder.Property(t => t.IsDefault).HasDefaultValue(false);
        builder.Property(t => t.UsageCount).HasDefaultValue(0);
        builder.Property(t => t.Tags).HasMaxLength(2000);
        builder.Property(t => t.LegalRequirements).HasMaxLength(2000);
        builder.Property(t => t.ApprovalWorkflow).HasMaxLength(2000);

        #endregion

        #region Relationships

        builder.HasOne(t => t.ParentTemplate)
               .WithMany()
               .HasForeignKey(t => t.ParentTemplateId)
               .OnDelete(DeleteBehavior.NoAction);

        #endregion

        #region Indexes (for list/search and default sort)

        builder.HasIndex(t => t.Name);
        builder.HasIndex(t => t.ContractType);
        builder.HasIndex(t => t.Category);
        builder.HasIndex(t => t.CreatedAt);
        builder.HasIndex(t => new { t.IsActive, t.IsDeleted });
        builder.HasIndex(t => t.IsDefault);
        builder.HasIndex(t => t.ParentTemplateId);

        #endregion
    }
}
