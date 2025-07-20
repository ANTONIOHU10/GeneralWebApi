using Microsoft.Extensions.DependencyInjection;
using Microsoft.OpenApi.Models;


namespace GeneralWebApi.Common.Extensions;

public static class OpenApiExtensions
{
    public static IServiceCollection AddCustomOpenApi(
        this IServiceCollection services,
        string title = "API",
        string version = "v1",
        string description = "API Description")
    {

        services.AddOpenApi(options =>
        {
            // currently the openapi 2.0 does not support the transformation of the document
            // so i used the openapi 1-6
            options.AddDocumentTransformer((document, context, _) =>
            {
                document.Info = new()
                {
                    Title = title,
                    Version = version,
                    Description = description
                };

                // define a new component for all the security scheme
                // optional
                document.Components = new()
                {
                    SecuritySchemes = new Dictionary<string, OpenApiSecurityScheme>
                    {
                        // Access Token
                        ["AccessToken"] = new()
                        {
                            Type = SecuritySchemeType.Http,
                            Scheme = "bearer",
                            BearerFormat = "JWT",
                            Description = "JWT Authorization header"
                        },

                        // Refresh Token
                        // this value is not used in the body, but only an optional header
                        ["RefreshToken"] = new()
                        {
                            Type = SecuritySchemeType.Http,
                            Scheme = "bearer",
                            //BearerFormat = "JWT",
                            Description = "64 Bytes Refresh Token"
                        }
                    }
                };


                // apply the security scheme to all the endpoints
                // document.SecurityRequirements = new List<OpenApiSecurityRequirement>
                // {
                //     new()
                //     {
                //         {
                //             new OpenApiSecurityScheme
                //             {
                //                 Reference = new OpenApiReference
                //                 {
                //                     Type = ReferenceType.SecurityScheme,
                //                     Id = "Bearer"
                //                 }
                //             },
                //             Array.Empty<string>()
                //         }
                //     },
                // };

                return Task.CompletedTask;
            });
        });

        return services;
    }
}