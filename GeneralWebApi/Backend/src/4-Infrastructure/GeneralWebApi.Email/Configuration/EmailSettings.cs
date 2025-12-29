namespace GeneralWebApi.Email.Configuration;

/// <summary>
/// Email service configuration settings
/// </summary>
public class EmailSettings
{
    public const string SectionName = "Email";

    /// <summary>
    /// SMTP server host (e.g., sandbox.smtp.mailtrap.io for testing)
    /// </summary>
    public string SmtpHost { get; set; } = string.Empty;

    /// <summary>
    /// SMTP server port (e.g., 2525, 587 for TLS, 465 for SSL)
    /// </summary>
    public int SmtpPort { get; set; } = 2525;

    /// <summary>
    /// SMTP username
    /// </summary>
    public string SmtpUsername { get; set; } = string.Empty;

    /// <summary>
    /// SMTP password
    /// </summary>
    public string SmtpPassword { get; set; } = string.Empty;

    /// <summary>
    /// Enable SSL/TLS (STARTTLS)
    /// </summary>
    public bool EnableSsl { get; set; } = true;

    /// <summary>
    /// Sender email address
    /// </summary>
    public string FromEmail { get; set; } = string.Empty;

    /// <summary>
    /// Sender display name
    /// </summary>
    public string FromName { get; set; } = "GeneralWebApi";

    /// <summary>
    /// Frontend base URL for generating reset links
    /// </summary>
    public string FrontendBaseUrl { get; set; } = "http://localhost:4200";

    /// <summary>
    /// Enable email service (can be disabled for development)
    /// </summary>
    public bool Enabled { get; set; } = true;
}

