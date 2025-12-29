using GeneralWebApi.Email.Models;
using GeneralWebApi.Logging.Services;
using RazorEngine;
using RazorEngine.Templating;
using System.Reflection;

namespace GeneralWebApi.Email.Services;

/// <summary>
/// Service for rendering Razor email templates
/// </summary>
public class RazorTemplateService
{
    private readonly ILoggingService? _logger;
    private static readonly object _lockObject = new object();
    private static bool _templatesLoaded = false;

    public RazorTemplateService(ILoggingService? logger = null)
    {
        _logger = logger;
        LoadTemplates();
    }

    /// <summary>
    /// Load email templates from embedded resources
    /// </summary>
    private void LoadTemplates()
    {
        if (_templatesLoaded) return;

        lock (_lockObject)
        {
            if (_templatesLoaded) return;

            try
            {
                var assembly = Assembly.GetExecutingAssembly();
                var templateNamespace = "GeneralWebApi.Email.Templates";

                // Load PasswordResetEmail template
                var htmlTemplateName = $"{templateNamespace}.PasswordResetEmail.cshtml";
                var htmlTemplateStream = assembly.GetManifestResourceStream(htmlTemplateName);
                if (htmlTemplateStream != null)
                {
                    using var reader = new StreamReader(htmlTemplateStream);
                    var htmlTemplate = reader.ReadToEnd();
                    Engine.Razor.Compile(htmlTemplate, "PasswordResetEmail", typeof(PasswordResetEmailModel));
                    _logger?.LogInformation("PasswordResetEmail HTML template loaded");
                }
                else
                {
                    _logger?.LogWarning("PasswordResetEmail HTML template not found as embedded resource");
                }

                // Load PasswordResetEmailText template
                var textTemplateName = $"{templateNamespace}.PasswordResetEmailText.cshtml";
                var textTemplateStream = assembly.GetManifestResourceStream(textTemplateName);
                if (textTemplateStream != null)
                {
                    using var reader = new StreamReader(textTemplateStream);
                    var textTemplate = reader.ReadToEnd();
                    Engine.Razor.Compile(textTemplate, "PasswordResetEmailText", typeof(PasswordResetEmailModel));
                    _logger?.LogInformation("PasswordResetEmailText template loaded");
                }
                else
                {
                    _logger?.LogWarning("PasswordResetEmailText template not found as embedded resource");
                }

                _templatesLoaded = true;
                _logger?.LogInformation("Email templates loaded successfully");
            }
            catch (Exception ex)
            {
                _logger?.LogError("Failed to load email templates: {Error}", ex.Message);
                throw;
            }
        }
    }

    /// <summary>
    /// Render HTML email template
    /// </summary>
    /// <param name="templateName">Template name</param>
    /// <param name="model">Template model</param>
    /// <returns>Rendered HTML string</returns>
    public string RenderHtmlTemplate(string templateName, PasswordResetEmailModel model)
    {
        try
        {
            return Engine.Razor.Run(templateName, typeof(PasswordResetEmailModel), model);
        }
        catch (Exception ex)
        {
            _logger?.LogError("Failed to render HTML template {TemplateName}: {Error}", templateName, ex.Message);
            throw;
        }
    }

    /// <summary>
    /// Render text email template
    /// </summary>
    /// <param name="templateName">Template name</param>
    /// <param name="model">Template model</param>
    /// <returns>Rendered text string</returns>
    public string RenderTextTemplate(string templateName, PasswordResetEmailModel model)
    {
        try
        {
            return Engine.Razor.Run(templateName, typeof(PasswordResetEmailModel), model);
        }
        catch (Exception ex)
        {
            _logger?.LogError("Failed to render text template {TemplateName}: {Error}", templateName, ex.Message);
            throw;
        }
    }
}

