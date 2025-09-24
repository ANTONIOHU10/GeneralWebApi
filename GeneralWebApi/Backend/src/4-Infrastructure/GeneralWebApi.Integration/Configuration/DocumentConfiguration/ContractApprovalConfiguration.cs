using GeneralWebApi.Domain.Entities.Documents.Approvals;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GeneralWebApi.Integration.Configuration.DocumentConfiguration;

public class ContractApprovalConfiguration : IEntityTypeConfiguration<ContractApproval>
{
    public void Configure(EntityTypeBuilder<ContractApproval> builder)
    {
        builder.ToTable("ContractApprovals");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id).ValueGeneratedOnAdd();

        builder.Property(x => x.Status).HasMaxLength(20).IsRequired();
        builder.Property(x => x.RequestedBy).HasMaxLength(100).IsRequired();
        builder.Property(x => x.Comments).HasMaxLength(1000);
        builder.Property(x => x.RejectionReason).HasMaxLength(500);

        builder.HasOne(x => x.Contract)
               .WithMany()
               .HasForeignKey(x => x.ContractId)
               .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(x => x.ApprovalSteps)
               .WithOne(s => s.ContractApproval)
               .HasForeignKey(s => s.ContractApprovalId)
               .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(x => x.ContractId);
        builder.HasIndex(x => x.Status);
        builder.HasIndex(x => new { x.IsDeleted, x.IsActive });
    }
}


