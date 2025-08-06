using System.Text.Json.Serialization;

namespace GeneralWebApi.Contracts.Responses;

/// <summary>
/// Authentication result with token information
/// </summary>
public class AuthResult
{
    [JsonPropertyName("isSuccess")]
    public bool IsSuccess { get; }

    [JsonPropertyName("accessToken")]
    public string? AccessToken { get; }

    [JsonPropertyName("refreshToken")]
    public string? RefreshToken { get; }

    [JsonPropertyName("expiresAt")]
    public DateTime? ExpiresAt { get; }

    [JsonPropertyName("tokenType")]
    public string TokenType { get; }

    [JsonPropertyName("user")]
    public UserInfoResponse? User { get; }

    [JsonPropertyName("errorMessage")]
    public string? ErrorMessage { get; }

    [JsonPropertyName("errorCode")]
    public string? ErrorCode { get; }

    private AuthResult(bool isSuccess, string? accessToken, string? refreshToken, DateTime? expiresAt,
        string tokenType, UserInfoResponse? user, string? errorMessage, string? errorCode)
    {
        IsSuccess = isSuccess;
        AccessToken = accessToken;
        RefreshToken = refreshToken;
        ExpiresAt = expiresAt;
        TokenType = tokenType;
        User = user;
        ErrorMessage = errorMessage;
        ErrorCode = errorCode;
    }

    // Success methods
    public static AuthResult Success(string accessToken, string refreshToken, DateTime expiresAt, UserInfoResponse? user = null)
        => new(true, accessToken, refreshToken, expiresAt, "Bearer", user, null, null);

    public static AuthResult Success(string accessToken, string refreshToken, int expiresInHours = 1, UserInfoResponse? user = null)
        => Success(accessToken, refreshToken, DateTime.UtcNow.AddHours(expiresInHours), user);

    // Failure methods
    public static AuthResult Failure(string errorMessage, string? errorCode = null)
        => new(false, null, null, null, "Bearer", null, errorMessage, errorCode);

    // Implicit conversion from tuple (for backward compatibility)
    public static implicit operator (bool Success, string? AccessToken, string? RefreshToken)(AuthResult result)
        => (result.IsSuccess, result.AccessToken, result.RefreshToken);
}

/// <summary>
/// User information for authentication responses
/// </summary>
public class UserInfoResponse
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;

    [JsonPropertyName("username")]
    public string Username { get; set; } = string.Empty;

    [JsonPropertyName("email")]
    public string Email { get; set; } = string.Empty;

    [JsonPropertyName("role")]
    public string Role { get; set; } = string.Empty;

    [JsonPropertyName("permissions")]
    public List<string> Permissions { get; set; } = new();
}