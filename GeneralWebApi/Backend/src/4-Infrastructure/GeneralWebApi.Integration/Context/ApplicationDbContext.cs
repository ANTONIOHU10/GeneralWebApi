using GeneralWebApi.Domain.Entities;
using GeneralWebApi.Domain.Entities.Anagraphy;
using GeneralWebApi.Domain.Entities.Documents;
using GeneralWebApi.Domain.Entities.Documents.Approvals;
using GeneralWebApi.Domain.Entities.Notifications;
using GeneralWebApi.Domain.Entities.Permissions;
using GeneralWebApi.Domain.Entities.Tasks;
using Microsoft.EntityFrameworkCore;
using TaskEntity = GeneralWebApi.Domain.Entities.Tasks.Task;

namespace GeneralWebApi.Integration.Context;


// ApplicationDbContext → OnConfiguring → SqlServer configuration → connection pool management
public class ApplicationDbContext : DbContext
{
    #region base entities
    public DbSet<User> Users { get; set; }
    public DbSet<Product> Products { get; set; }
    public DbSet<FileDocument> FileDocuments { get; set; }
    public DbSet<ExternalApiConfig> ExternalApiConfigs { get; set; }
    public DbSet<RefreshToken> RefreshTokens { get; set; }
    public DbSet<UserSession> UserSessions { get; set; }
    #endregion


    #region Anagraphy entities
    public DbSet<Department> Departments { get; set; }
    public DbSet<Position> Positions { get; set; }
    public DbSet<Employee> Employees { get; set; }
    #endregion

    #region Permissions entities
    public DbSet<Permission> Permissions { get; set; }
    public DbSet<Role> Roles { get; set; }
    public DbSet<EmployeeRole> EmployeeRoles { get; set; }
    public DbSet<RolePermission> RolePermissions { get; set; }
    #endregion

    #region Documents entities
    public DbSet<Certification> Certifications { get; set; }
    public DbSet<Contract> Contracts { get; set; }
    public DbSet<Education> Educations { get; set; }
    public DbSet<IdentityDocument> IdentityDocuments { get; set; }
    public DbSet<ContractApproval> ContractApprovals { get; set; }
    public DbSet<ContractApprovalStep> ContractApprovalSteps { get; set; }
    #endregion

    #region Tasks entities
    public DbSet<TaskEntity> Tasks { get; set; }
    #endregion

    #region Notifications entities
    public DbSet<Notification> Notifications { get; set; }
    #endregion

    // constructor to inject the DbContextOptions in ServiceCollectionExtensions
    // Program.cs -> Extensiones.ServiceCollectionExtensions.AddDatabaseService -> AddDbContext<ApplicationDbContext>

    // and this applicationDbContext will be passed to the base class DbContext
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
    {
        // 
    }


    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // this method has a Model builder, that will be used to configure the database model
        // get all the DbSet properties in the ApplicationDbContext class
        // calling the parent class OnModelCreating method
        base.OnModelCreating(modelBuilder);

        // here the builder will scan the assembly for all the DbContext classes,
        // and apply the configurations
        // so we don't have to register every single table in the DbContext class
        // like: modelBuilder.ApplyConfiguration(new UserConfiguration());
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);
    }
}