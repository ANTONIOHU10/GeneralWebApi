namespace GeneralWebApi.Identity.Services;

/// <summary>
/// Result of password update operation
/// </summary>
public class UpdatePasswordResult
{
    public bool Success { get; set; }
    public string? ErrorTitle { get; set; }
    public string? ErrorMessage { get; set; }

    public static UpdatePasswordResult CreateSuccess()
    {
        return new UpdatePasswordResult { Success = true };
    }

    public static UpdatePasswordResult CreateError(string errorTitle, string errorMessage)
    {
        return new UpdatePasswordResult
        {
            Success = false,
            ErrorTitle = errorTitle,
            ErrorMessage = errorMessage
        };
    }
}






