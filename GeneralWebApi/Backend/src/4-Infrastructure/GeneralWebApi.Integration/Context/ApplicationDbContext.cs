using GeneralWebApi.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace GeneralWebApi.Integration.Context;


// ApplicationDbContext → OnConfiguring → SqlServer configuration → connection pool management
public class ApplicationDbContext : DbContext
{
    public DbSet<User> Users { get; set; }
    public DbSet<Product> Products { get; set; }
    public DbSet<FileDocument> FileDocuments { get; set; }


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