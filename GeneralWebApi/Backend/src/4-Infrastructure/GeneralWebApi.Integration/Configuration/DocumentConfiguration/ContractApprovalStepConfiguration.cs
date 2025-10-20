using GeneralWebApi.Domain.Entities.Documents.Approvals;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GeneralWebApi.Integration.Configuration.DocumentConfiguration;

public class ContractApprovalStepConfiguration : IEntityTypeConfiguration<ContractApprovalStep>
{
    public void Configure(EntityTypeBuilder<ContractApprovalStep> builder)
    {
        builder.ToTable("ContractApprovalSteps");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id).ValueGeneratedOnAdd();

        builder.Property(x => x.StepOrder).IsRequired();
        builder.Property(x => x.StepName).HasMaxLength(100).IsRequired();
        builder.Property(x => x.ApproverRole).HasMaxLength(100).IsRequired();
        builder.Property(x => x.ApproverUserId).HasMaxLength(100);
        builder.Property(x => x.ApproverUserName).HasMaxLength(100);
        builder.Property(x => x.Status).HasMaxLength(20).IsRequired();
        builder.Property(x => x.Comments).HasMaxLength(1000);

        builder.HasIndex(x => new { x.ContractApprovalId, x.StepOrder });
        builder.HasIndex(x => x.Status);
    }
}


