using GeneralWebApi.Integration.Configuration;
using GeneralWebApi.Integration.Context;
using GeneralWebApi.Integration.Repository;
using GeneralWebApi.Integration.Seeds;
using GeneralWebApi.Integration.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace GeneralWebApi.Integration.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddDatabaseService(this IServiceCollection services, IConfiguration configuration)
    {
        // DatabaseSettings : from Configuration → DatabaseSettings declaration class
        services.Configure<DatabaseSettings>(configuration.GetSection(DatabaseSettings.SectionName));
        services.Configure<DatabaseOptions>(configuration.GetSection(DatabaseOptions.SectionName));
        var databaseSettings = configuration.GetSection(DatabaseSettings.SectionName).Get<DatabaseSettings>();

        if (databaseSettings == null)
        {
            throw new InvalidOperationException("Database settings are not configured");
        }

        //register the database context

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

                // for development environment
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

        // register the database service
        services.AddScoped<IDatabaseService, DatabaseService>();

        // register the migration service
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

    public static IServiceCollection AddRepositories(this IServiceCollection services)
    {
        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<IProductRepository, ProductRepository>();
        return services;
    }




}
