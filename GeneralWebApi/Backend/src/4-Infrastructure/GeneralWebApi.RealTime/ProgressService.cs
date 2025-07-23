using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Logging;

namespace GeneralWebApi.RealTime;

public class ProgressService : IProgressService
{
    private readonly ILogger<ProgressService> _logger;

    public ProgressService(ILogger<ProgressService> logger)
    {
        _logger = logger;
    }

    public async Task UpdateProgressAsync(string uploadId, UploadProgress progress)
    {
        // console output
        var progressBar = GenerateProgressBar(progress.ProgressPercentage);
        var fileSizeMB = progress.TotalBytes / 1024.0 / 1024.0;
        var processedMB = progress.ProcessedBytes / 1024.0 / 1024.0;

        // 🔧 handle chinese file name display
        var displayFileName = progress.FileName ?? "Unknown";
        if (displayFileName.Length > 25)
        {
            displayFileName = displayFileName.Substring(0, 22) + "...";
        }

        // 🔧 optimize display format
        var sizeDisplay = fileSizeMB < 1 ? $"{processedMB * 1024:F0}KB/{fileSizeMB * 1024:F0}KB" : $"{processedMB:F1}MB/{fileSizeMB:F1}MB";
        var speedDisplay = progress.SpeedMBps < 1 ? $"{progress.SpeedMBps * 1024:F1}KB/s" : $"{progress.SpeedMBps:F2}MB/s";

        // 🔧 100% progress special display
        if (progress.ProgressPercentage >= 100.0)
        {
            Console.WriteLine($"🎉 {displayFileName} | {progressBar} | 100.0% | {sizeDisplay} | {speedDisplay} | ✅ 完成!");
        }
        else
        {
            Console.WriteLine($"📊 {displayFileName} | {progressBar} | {progress.ProgressPercentage:F1}% | {sizeDisplay} | {speedDisplay} | ETA: {progress.EstimatedTimeRemaining:mm\\:ss}");
        }

        // detailed log
        _logger.LogInformation(
            "Upload progress: {UploadId} | {FileName} | {Progress:F1}% | {ProcessedMB:F1}MB/{TotalMB:F1}MB | {Speed:F2}MB/s | ETA: {ETA:mm\\:ss}",
            uploadId, progress.FileName, progress.ProgressPercentage,
            processedMB, fileSizeMB, progress.SpeedMBps, progress.EstimatedTimeRemaining);

        await Task.CompletedTask;
    }

    public async Task CompleteUploadAsync(string uploadId, string filePath)
    {
        // console output
        Console.WriteLine($"✅ Upload completed: {uploadId} -> {Path.GetFileName(filePath)}");

        // log
        _logger.LogInformation("Upload completed: {UploadId} -> {FilePath}", uploadId, filePath);
        await Task.CompletedTask;
    }

    public async Task FailUploadAsync(string uploadId, string errorMessage)
    {
        // console output
        Console.WriteLine($"❌ Upload failed: {uploadId} - {errorMessage}");

        // log
        _logger.LogWarning("Upload failed: {UploadId} - {ErrorMessage}", uploadId, errorMessage);
        await Task.CompletedTask;
    }

    public async Task StartUploadAsync(string uploadId, string fileName, long fileSize)
    {
        var fileSizeMB = fileSize / 1024.0 / 1024.0;

        // console output
        Console.WriteLine($"🚀 Upload started: {fileName} ({fileSizeMB:F1}MB) | ID: {uploadId}");

        // log
        _logger.LogInformation("Upload started: {UploadId} - {FileName} ({FileSizeMB:F1}MB)",
            uploadId, fileName, fileSizeMB);
        await Task.CompletedTask;
    }

    /// <summary>
    /// generate progress bar
    /// </summary>
    private static string GenerateProgressBar(double percentage)
    {
        const int barLength = 20;
        var filledLength = (int)(percentage / 100 * barLength);
        var emptyLength = barLength - filledLength;

        var filled = new string('█', filledLength);
        var empty = new string('░', emptyLength);

        return $"[{filled}{empty}]";
    }
}