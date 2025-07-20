using GeneralWebApi.Identity.Extensions;
using GeneralWebApi.Integration.Extensions;
using GeneralWebApi.Logging.Configuration;
using GeneralWebApi.Logging.Extensions;
using GeneralWebApi.Logging.Middleware;
using GeneralWebApi.WebApi.Extensions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Versioning;
using GeneralWebApi.Common.Extensions;

using Scalar.AspNetCore;

// from dotnet6+, the WebApplication will create a ConfigurationBuilder to read the appsettings.json file
var builder = WebApplication.CreateBuilder(args);

// Add services to the container.



//Add custom Serilog logging
builder.Host.ConfigureSerilog();
builder.Services.AddCustomLogging();

//Add custom authentication

builder.Services.AddCustomAuthentication(builder.Configuration);

//Add database integration
builder.Services.AddDatabaseService(builder.Configuration);
builder.Services.AddDatabaseHealthChecks(builder.Configuration);
builder.Services.AddRepositories();

//Add API Versioning
builder.Services.AddApiVersioning(options =>
{
    options.DefaultApiVersion = new ApiVersion(1, 0);
    options.AssumeDefaultVersionWhenUnspecified = true;
    options.ReportApiVersions = true;

    //configure the ApiVersionReader to use the header
    options.ApiVersionReader = ApiVersionReader.Combine(
        //read the version from the url segment, header, media type, or query string
        new UrlSegmentApiVersionReader(),
        //read the version from the header
        new HeaderApiVersionReader("X-API-Version"),
        //read the version from the media type
        new MediaTypeApiVersionReader("version"),
        //read the version from the query string
        new QueryStringApiVersionReader("api-version")
    );
});

builder.Services.AddVersionedApiExplorer(options =>
{
    options.GroupNameFormat = "'v'VVV";
    options.SubstituteApiVersionInUrl = true;
});

builder.Services.AddControllers();
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddRouting(options =>
{
    // make the urls lowercase
    options.LowercaseUrls = true;
});

// add rate limiter
builder.Services.AddCustomRateLimiter();

// add custom openapi documentation registration
builder.Services.AddCustomOpenApi();


var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    //open api expose document: https://localhost:7297/openapi/v1.json
    app.MapOpenApi();

    //scalar api reference: https://localhost:7297/scalar/v1
    app.MapScalarApiReference();
}

app.UseMiddleware<LoggingMiddleware>();

app.UseHttpsRedirection();

app.UseCustomAuthentication();

app.MapControllers();
app.UseRateLimiter();

app.Run();
