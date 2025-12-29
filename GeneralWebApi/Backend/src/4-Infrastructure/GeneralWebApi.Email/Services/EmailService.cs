using GeneralWebApi.Email.Configuration;
using GeneralWebApi.Email.Models;
using GeneralWebApi.Logging.Services;
using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Options;
using MimeKit;

namespace GeneralWebApi.Email.Services;

/// <summary>
/// Email service implementation using MailKit
/// </summary>
public class EmailService : IEmailService
{
    private readonly EmailSettings _settings;
    private readonly ILoggingService? _logger;
    private readonly RazorTemplateService _templateService;

    public EmailService(
        IOptions<EmailSettings> settings,
        RazorTemplateService templateService,
        ILoggingService? logger = null)
    {
        _settings = settings.Value;
        _templateService = templateService;
        _logger = logger;
    }

    /// <summary>
    /// Send password reset email
    /// </summary>
    public async Task<bool> SendPasswordResetEmailAsync(
        string toEmail,
        string toName,
        string resetToken,
        CancellationToken cancellationToken = default)
    {
        if (!_settings.Enabled)
        {
            _logger?.LogInformation("Email service is disabled. Skipping email send to: {Email}", toEmail);
            return false;
        }

        try
        {
            // Create email message
            var message = new MimeMessage();
            message.From.Add(new MailboxAddress(_settings.FromName, _settings.FromEmail));
            message.To.Add(new MailboxAddress(toName, toEmail));
            message.Subject = "Password Reset Request";

            // Create reset link
            var resetLink = $"{_settings.FrontendBaseUrl.TrimEnd('/')}/reset-password?token={Uri.EscapeDataString(resetToken)}";

            // Create view model for Razor template
            var model = new PasswordResetEmailModel
            {
                RecipientName = toName,
                ResetLink = resetLink,
                CompanyName = _settings.FromName,
                ExpirationMinutes = 30
            };

            // Generate email body using Razor templates
            var bodyBuilder = new BodyBuilder
            {
                HtmlBody = _templateService.RenderHtmlTemplate("PasswordResetEmail", model),
                TextBody = _templateService.RenderTextTemplate("PasswordResetEmailText", model)
            };

            message.Body = bodyBuilder.ToMessageBody();

            // Send email using SMTP
            using var client = new SmtpClient();
            await client.ConnectAsync(_settings.SmtpHost, _settings.SmtpPort, _settings.EnableSsl ? SecureSocketOptions.StartTls : SecureSocketOptions.None, cancellationToken);

            if (!string.IsNullOrEmpty(_settings.SmtpUsername) && !string.IsNullOrEmpty(_settings.SmtpPassword))
            {
                await client.AuthenticateAsync(_settings.SmtpUsername, _settings.SmtpPassword, cancellationToken);
            }

            await client.SendAsync(message, cancellationToken);
            await client.DisconnectAsync(true, cancellationToken);

            _logger?.LogInformation("Password reset email sent successfully to: {Email}", toEmail);
            return true;
        }
        catch (Exception ex)
        {
            _logger?.LogError("Failed to send password reset email to {Email}: {Error}", toEmail, ex.Message);
            return false;
        }
    }
}

