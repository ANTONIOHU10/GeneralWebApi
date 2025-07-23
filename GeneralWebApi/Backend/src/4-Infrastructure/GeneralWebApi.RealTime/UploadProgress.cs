namespace GeneralWebApi.RealTime;

public class UploadProgress
{
    public string? UploadId { get; set; }
    public string? FileName { get; set; }
    public double ProgressPercentage { get; set; }
    public long ProcessedBytes { get; set; }
    public long TotalBytes { get; set; }
    public double SpeedMBps { get; set; }
    public TimeSpan EstimatedTimeRemaining { get; set; }
    public DateTime StartTime { get; set; }
    public UploadStatus Status { get; set; }
}

public enum UploadStatus
{
    Started,
    InProgress,
    Completed,
    Failed,
    Cancelled
}