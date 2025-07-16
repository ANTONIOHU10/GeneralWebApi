using GeneralWebApi.Domain.Entities;
using GeneralWebApi.Integration.Configuration;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace GeneralWebApi.Integration.Context;


// ApplicationDbContext → OnConfiguring → SqlServer configuration → connection pool management
public class ApplicationDbContext : DbContext
{
    public DbSet<User> Users { get; set; }
    public DbSet<Product> Products { get; set; }

    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
    {
        // here to add tables
    }



    // scan the assembly for all the DbContext classes, and apply the configurations
    // for example: the ApplicationDbContext class has a table called "Users"
    // and then we have a configuration for the Users class: key, maxLength, etc.
    // this method will scan the assembly for all the DbContext classes, and apply the configurations
    // so we don't have to register every single table in the DbContext class
    // like: modelBuilder.ApplyConfiguration(new UserConfiguration());
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);
    }
}