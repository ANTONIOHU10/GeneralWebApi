using Quartz;
using GeneralWebApi.Scheduler.Configuration;
using Microsoft.Extensions.Options;

namespace GeneralWebApi.Scheduler.Services;

public class SchedulerService : ISchedulerService
{
    private readonly ISchedulerFactory _schedulerFactory;
    private readonly SchedulerSettings _settings;
    private IScheduler? _scheduler;

    public SchedulerService(
        ISchedulerFactory schedulerFactory,
        IOptions<SchedulerSettings> settings)
    {
        _schedulerFactory = schedulerFactory;
        _settings = settings.Value;
    }

    public async Task StartAsync(CancellationToken cancellationToken = default)
    {
        if (!_settings.EnableScheduler)
            return;

        _scheduler = await _schedulerFactory.GetScheduler(cancellationToken);
        await _scheduler.Start(cancellationToken);
    }

    public async Task StopAsync(CancellationToken cancellationToken = default)
    {
        if (_scheduler != null)
        {
            await _scheduler.Shutdown(cancellationToken);
        }
    }


    //TODO: 

    public Task<bool> IsRunningAsync()
    {
        return Task.FromResult(_scheduler?.IsStarted == true);
    }

    public Task<IEnumerable<JobInfo>> GetJobStatusAsync()
    {
        throw new NotImplementedException();
    }

    public Task PauseJobAsync(string jobName)
    {
        throw new NotImplementedException();
    }

    public Task ResumeJobAsync(string jobName)
    {
        throw new NotImplementedException();
    }

    public Task TriggerJobAsync(string jobName)
    {
        throw new NotImplementedException();
    }

    // other methods implementation...
}