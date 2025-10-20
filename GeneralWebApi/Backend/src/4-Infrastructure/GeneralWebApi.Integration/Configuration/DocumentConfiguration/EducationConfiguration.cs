using GeneralWebApi.Domain.Entities.Documents;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GeneralWebApi.Integration.Configuration.DocumentConfiguration;

public class EducationConfiguration : IEntityTypeConfiguration<Education>
{
    public void Configure(EntityTypeBuilder<Education> builder)
    {
        builder.ToTable("Educations");

        #region Primary Key
        builder.HasKey(e => e.Id);
        builder.Property(e => e.Id).ValueGeneratedOnAdd();
        #endregion

        #region Properties Configuration
        builder.Property(e => e.EmployeeId).IsRequired();
        builder.Property(e => e.Institution).HasMaxLength(200).IsRequired();
        builder.Property(e => e.Degree).HasMaxLength(100).IsRequired();
        builder.Property(e => e.FieldOfStudy).HasMaxLength(100).IsRequired();
        builder.Property(e => e.StartDate).IsRequired();
        builder.Property(e => e.EndDate);
        builder.Property(e => e.Grade).HasMaxLength(50);
        builder.Property(e => e.Description).HasMaxLength(1000);
        #endregion

        #region Foreign Key Relationships
        builder.HasOne(e => e.Employee)
               .WithMany(emp => emp.Educations)
               .HasForeignKey(e => e.EmployeeId)
               .OnDelete(DeleteBehavior.Cascade);
        #endregion

        #region Indexes
        builder.HasIndex(e => e.EmployeeId);
        builder.HasIndex(e => e.Institution);
        builder.HasIndex(e => e.Degree);
        builder.HasIndex(e => e.FieldOfStudy);
        #endregion
    }
}