using GeneralWebApi.Contracts.Common;

namespace GeneralWebApi.Contracts.Responses;

public static class DocumentResponse
{
    // For file system uploads (original)
    public static ApiResponse<object> UploadSuccess(string filePath, string fileName, long fileSize)
        => ApiResponse<object>.SuccessResult(new { filePath, fileName, fileSize }, "File uploaded successfully");

    // For database uploads
    public static ApiResponse<object> UploadSuccess(string fileName, long fileSize, string contentType, int id)
        => ApiResponse<object>.SuccessResult(new { fileName, fileSize, contentType, id }, "File uploaded successfully");

    // For database uploads with file path (backward compatibility)
    public static ApiResponse<object> UploadSuccess(string filePath, string fileName, long fileSize, string contentType, int id)
        => ApiResponse<object>.SuccessResult(new { filePath, fileName, fileSize, contentType, id }, "File uploaded successfully");

    public static ApiResponse<object> UploadFailed(string error)
        => ApiResponse<object>.ErrorResult(error);
}