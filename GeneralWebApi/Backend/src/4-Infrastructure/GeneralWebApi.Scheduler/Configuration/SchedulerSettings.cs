namespace GeneralWebApi.Scheduler.Configuration;

public class SchedulerSettings
{
    public const string SectionName = "Scheduler";

    // basic configuration of the scheduler
    public bool EnableScheduler { get; set; } = true;
    // maximum number of concurrent jobs
    public int MaxConcurrency { get; set; } = 10;
    public string InstanceName { get; set; } = "GeneralWebApiScheduler";

    // job configuration
    public JobSettings Jobs { get; set; } = new();
}

public class JobSettings
{
    public DatabaseCleanupJobSettings DatabaseCleanup { get; set; } = new();
    public CacheMaintenanceJobSettings CacheMaintenance { get; set; } = new();
    public FileSystemMaintenanceJobSettings FileSystemMaintenance { get; set; } = new();
}

public class DatabaseCleanupJobSettings
{
    public bool Enabled { get; set; } = true;
    // explanation of the format:
    // 0 0 2 * * ? means every day at 2:00
    // 0 0 */6 * * ? means every 6 hours
    public string CronExpression { get; set; } = "0 0 2 * * ?"; // every day at 2:00
    public int LogRetentionDays { get; set; } = 30;
    public int TempDataRetentionHours { get; set; } = 24;
}

public class CacheMaintenanceJobSettings
{
    public bool Enabled { get; set; } = true;
    public string CronExpression { get; set; } = "0 0 */6 * * ?"; // every 6 hours
    public int MaxCacheSize { get; set; } = 1000;
}

public class FileSystemMaintenanceJobSettings
{
    public bool Enabled { get; set; } = true;
    public string CronExpression { get; set; } = "0 0 3 * * ?"; // every day at 3:00
    public int TempFileRetentionHours { get; set; } = 48;
    public long MaxDiskUsageGB { get; set; } = 10;
}