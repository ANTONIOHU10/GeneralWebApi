namespace GeneralWebApi.Email.Models;

/// <summary>
/// View model for password reset email template
/// </summary>
public class PasswordResetEmailModel
{
    /// <summary>
    /// Recipient's name
    /// </summary>
    public string RecipientName { get; set; } = string.Empty;

    /// <summary>
    /// Password reset link
    /// </summary>
    public string ResetLink { get; set; } = string.Empty;

    /// <summary>
    /// Company/Application name
    /// </summary>
    public string CompanyName { get; set; } = "GeneralWebApi";

    /// <summary>
    /// Token expiration time in minutes
    /// </summary>
    public int ExpirationMinutes { get; set; } = 30;
}

