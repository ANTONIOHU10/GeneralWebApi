using Quartz;
using GeneralWebApi.Logging.Services;

namespace GeneralWebApi.Scheduler.Jobs.Base;

public abstract class BaseJob : IJob
{
    protected readonly ILoggingService _logger;
    protected readonly string _jobName;

    protected BaseJob(ILoggingService logger)
    {
        _logger = logger;
        // get the job name from the class name
        _jobName = GetType().Name;
    }

    // execute the job
    public async Task Execute(IJobExecutionContext context)
    {
        var startTime = DateTime.UtcNow;

        try
        {
            // 修复：确保参数占位符匹配
            _logger.LogInformation("Job {JobName} started at {StartTime}", _jobName, startTime);

            // execute the specific job
            await ExecuteJobAsync(context);

            var duration = DateTime.UtcNow - startTime;
            // 修复：确保参数占位符匹配
            _logger.LogInformation("Job {JobName} completed successfully in {Duration}ms", _jobName, duration.TotalMilliseconds);
        }
        catch (Exception ex)
        {
            var duration = DateTime.UtcNow - startTime;
            // 修复：确保参数占位符匹配
            _logger.LogError("Job {JobName} failed after {Duration}ms", _jobName, duration.TotalMilliseconds, ex);

            // rethrow the exception, let Quartz handle the retry logic
            throw;
        }
    }

    // execute the specific business job
    protected abstract Task ExecuteJobAsync(IJobExecutionContext context);
}