using GeneralWebApi.Integration.Services;
using GeneralWebApi.Scheduler.Configuration;
using Microsoft.Extensions.Options;
using Quartz;
using GeneralWebApi.Logging.Services;

namespace GeneralWebApi.Scheduler.Jobs;

[DisallowConcurrentExecution]
public class DatabaseCleanupJob : BaseJob
{
    private readonly IDatabaseService _databaseService;
    private readonly SchedulerSettings _settings;

    public DatabaseCleanupJob(
        ILoggingService logger,
        IDatabaseService databaseService,
        IOptions<SchedulerSettings> settings)
        : base(logger)
    {
        _databaseService = databaseService;
        _settings = settings.Value;
    }

    protected override async Task ExecuteJobAsync(IJobExecutionContext context)
    {
        var jobSettings = _settings.Jobs.DatabaseCleanup;

        if (!jobSettings.Enabled)
        {
            _logger.LogInformation("Database cleanup job is disabled");
            return;
        }

        // clean up temp data
        await CleanupFileDocuments(jobSettings.TempDataRetentionHours);
    }
    private async Task CleanupFileDocuments(int retentionHours)
    {
        var cutoffDate = DateTime.UtcNow.AddHours(-retentionHours);
        var sql = "DELETE FROM FileDocuments WHERE CreatedAt < @cutoffDate";
        var parameters = new { cutoffDate };

        var deletedCount = await _databaseService.ExecuteAsync(sql, parameters);

        _logger.LogInformation("Cleaned up {DeletedCount} file documents older than {CutoffDate}",
            deletedCount, cutoffDate);
    }
}