using GeneralWebApi.Domain.Entities.Documents;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GeneralWebApi.Integration.Configuration.DocumentConfiguration;


public class ContractConfiguration : IEntityTypeConfiguration<Contract>
{
    public void Configure(EntityTypeBuilder<Contract> builder)
    {
        builder.ToTable("Contracts");

        #region Primary Key
        builder.HasKey(c => c.Id);
        builder.Property(c => c.Id).ValueGeneratedOnAdd();
        #endregion

        #region Properties Configuration
        builder.Property(c => c.EmployeeId).IsRequired();
        builder.Property(c => c.ContractType).HasMaxLength(50).IsRequired();
        builder.Property(c => c.StartDate).IsRequired();
        builder.Property(c => c.EndDate);
        builder.Property(c => c.Status).HasMaxLength(20).IsRequired().HasDefaultValue("Active");
        builder.Property(c => c.Salary).HasColumnType("decimal(18,2)");
        builder.Property(c => c.Notes).HasMaxLength(1000);
        builder.Property(c => c.RenewalReminderDate);
        #endregion

        #region Foreign Key Relationships
        builder.HasOne(c => c.Employee)
               .WithMany(e => e.Contracts)
               .HasForeignKey(c => c.EmployeeId)
               .OnDelete(DeleteBehavior.Cascade);
        #endregion

        #region Indexes
        builder.HasIndex(c => c.EmployeeId);
        builder.HasIndex(c => c.ContractType);
        builder.HasIndex(c => c.Status);
        builder.HasIndex(c => c.StartDate);
        builder.HasIndex(c => c.EndDate);
        #endregion
    }
}