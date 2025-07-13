namespace GeneralWebApi.Contracts.Responses;

using GeneralWebApi.Contracts.Common;

public class TokenInfo
{
    public string? AccessToken { get; set; }
    public string? RefreshToken { get; set; }
    public string TokenType { get; set; } = "Bearer";
    public long ExpiresIn { get; set; }
    public DateTime ExpiresAt { get; set; }
    public DateTime RefreshTokenExpiresAt { get; set; }
    public string[]? Scope { get; set; }
}

public class LoginResponseData
{
    public string? UserId { get; set; }
    public string? Username { get; set; }
    public string? Email { get; set; }
    public string[]? Roles { get; set; }
    public Dictionary<string, object>? Profile { get; set; }
    public TokenInfo Token { get; set; } = new();
}

public class RegisterResponseData
{
    public string UserId { get; set; } = string.Empty;
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public bool EmailConfirmed { get; set; }

    //optional, depends on whether to auto-login after registration
    public TokenInfo? Token { get; set; } 
}



public class RefreshTokenResponseData
{
    public TokenInfo Token { get; set; } = new();
    public DateTime RefreshedAt { get; set; } = DateTime.UtcNow;
}

public class LogoutResponseData
{
    public string Message { get; set; } = "Logout successful";
}

//Factory methods for creating ApiResponse instances
public static class AuthResponse
{
    public static ApiResponse<LoginResponseData> LoginSuccess(LoginResponseData data) 
        => ApiResponse<LoginResponseData>.SuccessResult(data, "Login successful");

    public static ApiResponse<RegisterResponseData> RegisterSuccess(RegisterResponseData data) 
        => ApiResponse<RegisterResponseData>.SuccessResult(data, "Register successful");

    public static ApiResponse<RefreshTokenResponseData> RefreshTokenSuccess(RefreshTokenResponseData data) 
        => ApiResponse<RefreshTokenResponseData>.SuccessResult(data, "Token refreshed successfully");

    public static ApiResponse<LogoutResponseData> LogoutSuccess() 
        => ApiResponse<LogoutResponseData>.SuccessResult(new LogoutResponseData(), "Logout successful");

    public static ApiResponse<LoginResponseData> LoginFailed(string error = "Username or password is incorrect") 
        => ApiResponse<LoginResponseData>.Unauthorized(error);

    public static ApiResponse<RegisterResponseData> RegisterFailed(string error) 
        => ApiResponse<RegisterResponseData>.ErrorResult(error, 400);

    public static ApiResponse<RefreshTokenResponseData> RefreshTokenFailed(string error = "Invalid refresh token") 
        => ApiResponse<RefreshTokenResponseData>.Unauthorized(error);
}