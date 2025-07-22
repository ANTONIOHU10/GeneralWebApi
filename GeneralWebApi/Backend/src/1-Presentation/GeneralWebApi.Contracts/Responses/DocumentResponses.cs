using GeneralWebApi.Contracts.Common;

namespace GeneralWebApi.Contracts.Responses;

public static class DocumentResponse
{
    public static ApiResponse<object> UploadSuccess(string filePath, string fileName, long fileSize)
        => ApiResponse<object>.SuccessResult(new { filePath, fileName, fileSize }, "File uploaded successfully");

    public static ApiResponse<object> UploadFailed(string error)
        => ApiResponse<object>.ErrorResult(error);


}