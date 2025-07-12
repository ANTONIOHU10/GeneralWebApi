using Microsoft.Extensions.Hosting;
using Serilog;
using Serilog.Events;
using Serilog.Sinks.SystemConsole.Themes;

namespace GeneralWebApi.Logging.Configuration;

public static class SerilogConfiguration
{
    // Serilog default configuration

    //this IHostBuilder is the builder that is used to configure the host

    //context = used to read appsettings.json ecc.
    //services = used to add services to the container
    //configuration = used to read the configuration like sink, enrichers, etc.

    public static IHostBuilder ConfigureSerilog(this IHostBuilder builder)
    {
        return builder.UseSerilog((context, services, configuration) =>
        {
            configuration
                .ReadFrom.Configuration(context.Configuration)
                .ReadFrom.Services(services)
                .Enrich.FromLogContext()
                // system lifecycle log - simple format
                .WriteTo.Logger(lc => lc
                    .Filter.ByIncludingOnly(e => e.Properties.ContainsKey("SourceContext") && 
                        e.Properties["SourceContext"].ToString().Contains("Microsoft.Hosting.Lifetime"))
                    .WriteTo.Console(
                        outputTemplate: "[{Timestamp:HH:mm:ss} | {Level:u3}] {Message:lj}{NewLine}",
                        theme: AnsiConsoleTheme.Code))
                // only show your business log - detailed format
                .WriteTo.Logger(lc => lc
                    .Filter.ByIncludingOnly(e => e.Properties.ContainsKey("SourceContext") && 
                        e.Properties["SourceContext"].ToString().Contains("GeneralWebApi.Logging.Services.SerilogService"))
                    .WriteTo.Console(
                        outputTemplate: "[{Timestamp:HH:mm:ss} | {Level:u3}] {Message:lj}{NewLine}" +
                                    "└─ Properties: {Properties:j}{NewLine}" +
                                    "   ├─ Source: {SourceContext}{NewLine}" +
                                    "   ├─ Action: {ActionName}{NewLine}" +
                                    "   ├─ ActionId: {ActionId}{NewLine}" +
                                    "   ├─ ConnectionId: {ConnectionId}{NewLine}" +
                                    "   ├─ Request: {RequestPath} | {RequestId}{NewLine}" +
                                    "   ├─ StatusCode: {StatusCode:}{NewLine}" +
                                    "   └─ Exception: {Exception}",
                        theme: AnsiConsoleTheme.Code));
                /*
                .WriteTo.File(
                    path: "logs/app-.txt",
                    rollingInterval: RollingInterval.Day,
                    retainedFileCountLimit: 30,
                    outputTemplate: "{Timestamp:yyyy-MM-dd HH:mm:ss.fff zzz} [{Level:u3}] {Message:lj} {Properties:j}{NewLine}{Exception}")
                */
                /*.WriteTo.File(
                    path: "logs/errors-.txt",
                    rollingInterval: RollingInterval.Day,
                    retainedFileCountLimit: 30,
                    restrictedToMinimumLevel: LogEventLevel.Error,
                    outputTemplate: "{Timestamp:yyyy-MM-dd HH:mm:ss.fff zzz} [{Level:u3}] {Message:lj} {Properties:j}{NewLine}{Exception}");
                */
        });
    }
}