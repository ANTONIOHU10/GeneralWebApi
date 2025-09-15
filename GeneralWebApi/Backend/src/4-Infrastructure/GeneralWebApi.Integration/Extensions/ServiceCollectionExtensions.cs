using GeneralWebApi.Integration.Configuration;
using GeneralWebApi.Integration.Context;
using GeneralWebApi.Integration.Repository;
using GeneralWebApi.Integration.Repository.AnagraphyRepository;
using GeneralWebApi.Integration.Repository.BasesRepository;
using GeneralWebApi.Integration.Seeds;
using GeneralWebApi.Integration.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace GeneralWebApi.Integration.Extensions;

/// <summary>
/// This class is used to register the database service
/// to register a service, we need to add the service into the ServiceCollection
/// and then we can register it in the Program.cs file
/// </summary>
public static class ServiceCollectionExtensions
{
    /// <summary>
    ///
    /// </summary>
    /// <param name="services"> the services container, that will be used to register the services</param>
    /// <param name="configuration">the configuration to be registered into the services container</param>
    /// <returns></returns>
    /// <exception cref="InvalidOperationException"></exception>
    public static IServiceCollection AddDatabaseService(this IServiceCollection services, IConfiguration configuration)
    {
        // Register configuration : the database settings for other usages
        services.Configure<DatabaseSettings>(configuration.GetSection(DatabaseSettings.SectionName));

        // get the database settings from the configuration
        var databaseSettings = configuration.GetSection(DatabaseSettings.SectionName).Get<DatabaseSettings>();

        if (databaseSettings == null)
        {
            throw new InvalidOperationException("Database settings are not configured");
        }


        // the default lifecycles of the DbContext are Scoped - one for each request
        services.AddDbContext<ApplicationDbContext>
        (
            options =>
            {
                //configure the sql server options
                options
                .UseSqlServer
                (
                    databaseSettings.ConnectionString, sqlOptions =>
                    {
                        sqlOptions.CommandTimeout(databaseSettings.CommandTimeout);

                        if (databaseSettings.EnableRetryOnFailure)
                        {
                            sqlOptions.EnableRetryOnFailure(
                                maxRetryCount: databaseSettings.MaxRetryCount,
                                maxRetryDelay: TimeSpan.FromSeconds(databaseSettings.RetryDelaySeconds),
                                // specific error numbers to add to the retry
                                // example: 4060, 40199, 40501, 40603, 49918, 49919, 49920
                                errorNumbersToAdd: null
                            );
                        }
                    }
                )
                .UseSeeding((context, _) =>
                {
                    ProductSeeder.SeedAsync((ApplicationDbContext)context).Wait();

                });


                if (databaseSettings.EnableSensitiveDataLogging)
                {
                    options.EnableSensitiveDataLogging();
                }

                if (databaseSettings.EnableDetailedErrors)
                {
                    options.EnableDetailedErrors();
                }
            }
        );

        // register the database service, with all the basic methods to interact with the database
        services.AddScoped<IDatabaseService, DatabaseService>();

        // register the migration service, to be used to migrate the database
        services.AddScoped<IDatabaseMigrationService, DatabaseMigrationService>();


        return services;
    }


    public static IServiceCollection AddDatabaseHealthChecks(this IServiceCollection services, IConfiguration configuration)
    {
        var databaseSettings = configuration.GetSection(DatabaseSettings.SectionName).Get<DatabaseSettings>();

        if (databaseSettings != null)
        {
            services.AddHealthChecks()
            .AddSqlServer
            (
                databaseSettings.ConnectionString,
                name: "Database",
                timeout: TimeSpan.FromSeconds(5),
                tags: new[] { "database", "sql" }
            );
        }

        return services;
    }

    /// <summary>
    /// Register the repositories, to be used in the services
    /// we prefer to seperate the repositories registration from the base services
    /// </summary>
    /// <param name="services"> the services container, that will be used to register the services</param>
    /// <returns></returns>
    public static IServiceCollection AddRepositories(this IServiceCollection services)
    {
        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<IProductRepository, ProductRepository>();
        services.AddScoped<IFileDocumentRepository, FileRepository>();
        services.AddScoped<IExternalApiConfigRepository, ExternalApiConfigRepository>();
        services.AddScoped<IEmployeeRepository, EmployeeRepository>();
        return services;
    }




}
