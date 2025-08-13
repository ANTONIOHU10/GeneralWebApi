using GeneralWebApi.Scheduler.Configuration;
using GeneralWebApi.Scheduler.Services;
using GeneralWebApi.Scheduler.Jobs;
using Quartz;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Configuration;

namespace GeneralWebApi.Scheduler.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddSchedulerServices(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        // Option binding - injections to the service
        services.Configure<SchedulerSettings>(
            configuration.GetSection(SchedulerSettings.SectionName)
        );

        // configuration binding - GetSection 

        var settings = configuration.GetSection(SchedulerSettings.SectionName)
            .Get<SchedulerSettings>();

        if (settings?.EnableScheduler != true)
            return services;

        // register Quartz services
        services.AddQuartz(q =>
        {
            // type loader will be used to load the job classes that implement IJob interface (BaseJob) from the assembly
            q.UseSimpleTypeLoader();
            // use in-memory store for the scheduler information
            q.UseInMemoryStore();

            //TODO: to be enabled
            // register jobs
            if (settings.Jobs.DatabaseCleanup.Enabled)
                RegisterJob<DatabaseCleanupJob>(q, settings.Jobs.DatabaseCleanup);

            // if (settings.Jobs.CacheMaintenance.Enabled)
            //     RegisterJob<CacheMaintenanceJob>(q, settings.Jobs.CacheMaintenance);

            // if (settings.Jobs.FileSystemMaintenance.Enabled)
            //     RegisterJob<FileSystemMaintenanceJob>(q, settings.Jobs.FileSystemMaintenance);
        });

        // register hosted services
        services.AddQuartzHostedService(q => q.WaitForJobsToComplete = true);

        // register business services 
        services.AddScoped<ISchedulerService, SchedulerService>();

        return services;
    }

    private static void RegisterJob<T>(IServiceCollectionQuartzConfigurator quartz,
        object jobSettings) where T : IJob
    {
        // get the job name from the class name
        var jobName = typeof(T).Name;
        // create a trigger job key with the job name
        var jobKey = new JobKey(jobName);

        // register the job with the job key
        quartz.AddJob<T>(opts => opts.WithIdentity(jobKey));

        // read the Cron expression from the configuration
        var cronProperty = jobSettings.GetType().GetProperty("CronExpression");
        var cronExpression = cronProperty?.GetValue(jobSettings)?.ToString() ?? "0 0 2 * * ?";

        quartz.AddTrigger(opts => opts
            .ForJob(jobKey)
            .WithIdentity($"{jobName}_trigger")
            .WithCronSchedule(cronExpression));
    }
}