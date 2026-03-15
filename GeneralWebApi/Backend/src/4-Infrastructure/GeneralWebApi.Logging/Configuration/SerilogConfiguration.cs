using Microsoft.Extensions.Hosting;
using Serilog;
using Serilog.Sinks.SystemConsole.Themes;

namespace GeneralWebApi.Logging.Configuration;

/// <summary>
/// Serilog configuration: single readable format, error-focused.
/// Success-path logs use Debug level and are off by default.
/// </summary>
public static class SerilogConfiguration
{
    /// <summary>
    /// Single console format: [Time Level] SourceContext: Message, then Exception when present.
    /// </summary>
    private const string ConsoleOutputTemplate =
        "[{Timestamp:HH:mm:ss} {Level:u3}] {SourceContext}: {Message:lj}{NewLine}{Exception}";

    public static IHostBuilder ConfigureSerilog(this IHostBuilder builder)
    {
        return builder.UseSerilog((context, services, configuration) =>
        {
            configuration
                .ReadFrom.Configuration(context.Configuration)
                .ReadFrom.Services(services)
                .Enrich.FromLogContext()
                .WriteTo.Console(
                    outputTemplate: ConsoleOutputTemplate,
                    theme: AnsiConsoleTheme.Code);
        });
    }
}