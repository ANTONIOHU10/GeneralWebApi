using GeneralWebApi.Identity.Extensions;
using GeneralWebApi.Integration.Extensions;
using GeneralWebApi.Logging.Configuration;
using GeneralWebApi.Logging.Extensions;
using GeneralWebApi.Logging.Middleware;
using Microsoft.AspNetCore.Mvc;
using GeneralWebApi.Common.Extensions;

using Scalar.AspNetCore;
using Microsoft.AspNetCore.Server.Kestrel.Core;
using Microsoft.AspNetCore.Http.Features;
using GeneralWebApi.Extensions;
using GeneralWebApi.FileOperation.Extensions;
using GeneralWebApi.Contracts.Extensions;
using GeneralWebApi.Application.Extensions;
using GeneralWebApi.Caching.Extensions;
using GeneralWebApi.HttpClient.Extensions;
using GeneralWebApi.Scheduler.Extensions;
using GeneralWebApi.Middleware;

// from dotnet6+, the WebApplication will create a ConfigurationBuilder to read the appsettings.json file
var builder = WebApplication.CreateBuilder(args);

// Add services to the container.



//Add custom Serilog logging
builder.Host.ConfigureSerilog();
builder.Services.AddCustomLogging();

//Add IIS server options
// set the max request body size to 1GB
builder.Services.Configure<IISServerOptions>(options =>
{
    options.MaxRequestBodySize = 1024 * 1024 * 1024; // 1GB
});

// configure the kestrel server options
// set the max request body size to 1GB
builder.Services.Configure<KestrelServerOptions>(options =>
{
    options.Limits.MaxRequestBodySize = 1024 * 1024 * 1024; // 1GB
    options.Limits.MaxConcurrentConnections = 100;
    options.Limits.MaxConcurrentUpgradedConnections = 100;
    options.Limits.KeepAliveTimeout = TimeSpan.FromMinutes(10);
    options.Limits.RequestHeadersTimeout = TimeSpan.FromMinutes(5);
});

// configure the form options
// set the max request body size to 1GB
builder.Services.Configure<FormOptions>(options =>
{
    options.MultipartBodyLengthLimit = 1024 * 1024 * 1024; // 1GB
    options.ValueLengthLimit = int.MaxValue;
    options.MemoryBufferThreshold = int.MaxValue;
});

//Add custom authentication

builder.Services.AddCustomAuthentication(builder.Configuration);

//Add database integration
builder.Services.AddDatabaseService(builder.Configuration);
builder.Services.AddDatabaseHealthChecks(builder.Configuration);
builder.Services.AddRepositories();

builder.Services.AddControllers();
// Add HttpContextAccessor for accessing HttpContext in services/handlers
builder.Services.AddHttpContextAccessor();
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddRouting(options =>
{
    // make the urls lowercase
    options.LowercaseUrls = true;
});

builder.Services.AddCSVExport();
builder.Services.AddExternalApiMapper();

// add rate limiter
builder.Services.AddCustomRateLimiter();

// add custom openapi documentation registration
builder.Services.AddCustomOpenApi();

// add document controller checks
builder.Services.AddCustomDocumentHelper();

// add signalr service
builder.Services.AddSignalRService();

// add cors
builder.Services.AddCORS();

// add validators
builder.Services.AddValidators();

// add file operation services
builder.Services.AddFileOperationServices();

// add redis
builder.Services.AddRedis(builder.Configuration);

// add API versioning services
builder.Services.AddApiVersioningServices();

// add external http client
builder.Services.AddExternalHttpClient(builder.Configuration);

// add scheduler services
builder.Services.AddSchedulerServices(builder.Configuration);

// add global exception handling
builder.Services.AddGlobalExceptionHandling();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    //open api expose document only for development: https://localhost:7297/openapi/v1.json
    app.MapOpenApi();

    //scalar api reference: https://localhost:7297/scalar/v1
    app.MapScalarApiReference();

    app.UseCors("DevelopmentPolicy");
}
else
{
    app.UseCors("ProductionPolicy");
}

app.UseMiddleware<LoggingMiddleware>();

// Add global exception handling middleware (should be early in the pipeline)
app.UseGlobalExceptionHandling();

app.UseHttpsRedirection();

app.UseCustomAuthentication();

// Add audit middleware to log CREATE, UPDATE, DELETE operations
// Must be after authentication so we can get user information
app.UseMiddleware<AuditMiddleware>();
app.MapControllers();
app.UseRateLimiter();

app.Run();
