using GeneralWebApi.Contracts.Common;
using GeneralWebApi.Domain.Entities;

namespace GeneralWebApi.Contracts.Responses;

// Response DTOs for better type safety
public class FileUploadResponse
{
    public string FilePath { get; set; } = string.Empty;
    public string FileName { get; set; } = string.Empty;
    public long FileSize { get; set; }
    public string ContentType { get; set; } = string.Empty;
    public int Id { get; set; }
}

public class FileListResponse
{
    public IEnumerable<FileDocument> Files { get; set; } = new List<FileDocument>();
    public int TotalCount { get; set; }
}

public class FileUpdateResponse
{
    public FileDocument File { get; set; } = new();
    public string Message { get; set; } = string.Empty;
}

public class FileDeleteResponse
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
}

public class TestResponse
{
    public string Message { get; set; } = string.Empty;
}

public static class DocumentResponse
{
    // For file system uploads (original)
    // For database uploads
    public static ApiResponse<FileUploadResponse> UploadSuccess(string fileName, long fileSize, string contentType, int id)
        => ApiResponse<FileUploadResponse>.SuccessResult(new FileUploadResponse
        {
            FileName = fileName,
            FileSize = fileSize,
            ContentType = contentType,
            Id = id
        }, "File uploaded successfully");

    // For database uploads with file path (backward compatibility)
    public static ApiResponse<FileUploadResponse> UploadFailed(string error)
        => ApiResponse<FileUploadResponse>.ErrorResult(error);

    // For file list
    public static ApiResponse<FileListResponse> FileListSuccess(IEnumerable<FileDocument> files, int totalCount)
        => ApiResponse<FileListResponse>.SuccessResult(new FileListResponse
        {
            Files = files,
            TotalCount = totalCount
        }, "Files retrieved successfully");

    // For file update
    public static ApiResponse<FileDocument> FileUpdateSuccess(FileDocument file)
        => ApiResponse<FileDocument>.SuccessResult(file, "File content updated successfully");

    // For file delete
    public static ApiResponse<FileDeleteResponse> FileDeleteSuccess()
        => ApiResponse<FileDeleteResponse>.SuccessResult(new FileDeleteResponse
        {
            Success = true,
            Message = "File deleted successfully"
        }, "File deleted successfully");

    // For test endpoint
    public static ApiResponse<TestResponse> TestSuccess()
        => ApiResponse<TestResponse>.SuccessResult(new TestResponse
        {
            Message = "Test endpoint v1 is working"
        }, "Test successful");
}