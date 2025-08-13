using Quartz;

namespace GeneralWebApi.Scheduler.Services;

public interface ISchedulerService
{
    Task StartAsync(CancellationToken cancellationToken = default);
    Task StopAsync(CancellationToken cancellationToken = default);
    Task<bool> IsRunningAsync();
    Task<IEnumerable<JobInfo>> GetJobStatusAsync();
    Task PauseJobAsync(string jobName);
    Task ResumeJobAsync(string jobName);
    Task TriggerJobAsync(string jobName);
}

public class JobInfo
{
    public string Name { get; set; } = string.Empty;
    public string Group { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTime? NextFireTime { get; set; }
    public DateTime? PreviousFireTime { get; set; }
    public int ExecutionCount { get; set; }
}