using GeneralWebApi.Logging.Configuration;
using GeneralWebApi.Logging.Extensions;
using GeneralWebApi.Logging.Middleware;
using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.



//Add custom Serilog logging
builder.Host.ConfigureSerilog();
builder.Services.AddCustomLogging();
builder.Services.AddControllers();
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi

builder.Services.AddOpenApi(options =>
{
    // add document transformer to modify the document before it is returned
    options.AddDocumentTransformer((document, context, _) =>
    {
        document.Info = new()
        {
            Title = "Product Catalog API",
            Version = "v1",
            Description = """
                Modern API for managing product catalogs.
                """
        };
        return Task.CompletedTask;
    });
});

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

app.UseAuthorization();

app.MapControllers();

app.Run();
